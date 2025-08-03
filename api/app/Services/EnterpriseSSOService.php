<?php

namespace App\Services;

use App\Models\User;
use App\Models\Role;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * خدمة تسجيل الدخول الموحد للمؤسسات
 * Enterprise Single Sign-On Service
 */
class EnterpriseSSOService
{
    private const SAML_PROVIDER = 'saml';
    private const OAUTH_PROVIDER = 'oauth';
    private const LDAP_PROVIDER = 'ldap';
    private const JWT_PROVIDER = 'jwt';

    private array $config;

    public function __construct()
    {
        $this->config = config('enterprise_sso', []);
    }

    /**
     * معالجة تسجيل الدخول الموحد
     */
    public function processSSOLogin(string $provider, array $credentials): array
    {
        try {
            $userInfo = match($provider) {
                self::SAML_PROVIDER => $this->processSAMLLogin($credentials),
                self::OAUTH_PROVIDER => $this->processOAuthLogin($credentials),
                self::LDAP_PROVIDER => $this->processLDAPLogin($credentials),
                self::JWT_PROVIDER => $this->processJWTLogin($credentials),
                default => throw new \InvalidArgumentException("Unsupported SSO provider: {$provider}")
            };

            // إنشاء أو تحديث المستخدم
            $user = $this->createOrUpdateUser($userInfo, $provider);
            
            // تسجيل الدخول وإنشاء الجلسة
            $sessionData = $this->createUserSession($user, $provider);
            
            // تسجيل نشاط SSO
            $this->logSSOActivity($user, $provider, 'success');

            return [
                'success' => true,
                'user' => $user,
                'session' => $sessionData,
                'provider' => $provider,
                'timestamp' => now(),
            ];

        } catch (\Exception $e) {
            $this->logSSOActivity(null, $provider, 'failed', $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'provider' => $provider,
            ];
        }
    }

    /**
     * معالجة SAML
     */
    private function processSAMLLogin(array $credentials): array
    {
        $samlResponse = $credentials['saml_response'] ?? '';
        
        if (empty($samlResponse)) {
            throw new \InvalidArgumentException('SAML response is required');
        }

        // فك تشفير وتحليل SAML Response
        $decodedResponse = base64_decode($samlResponse);
        $samlDoc = new \DOMDocument();
        $samlDoc->loadXML($decodedResponse);

        // التحقق من صحة التوقيع
        if (!$this->verifySAMLSignature($samlDoc)) {
            throw new \SecurityException('Invalid SAML signature');
        }

        // استخراج معلومات المستخدم
        $userInfo = $this->extractSAMLUserInfo($samlDoc);
        
        return $userInfo;
    }

    /**
     * معالجة OAuth 2.0
     */
    private function processOAuthLogin(array $credentials): array
    {
        $accessToken = $credentials['access_token'] ?? '';
        
        if (empty($accessToken)) {
            throw new \InvalidArgumentException('OAuth access token is required');
        }

        // التحقق من صحة الرمز المميز
        $tokenInfo = $this->validateOAuthToken($accessToken);
        
        if (!$tokenInfo['valid']) {
            throw new \SecurityException('Invalid OAuth token');
        }

        // جلب معلومات المستخدم من مزود OAuth
        $userInfo = $this->fetchOAuthUserInfo($accessToken);
        
        return $userInfo;
    }

    /**
     * معالجة LDAP/Active Directory
     */
    private function processLDAPLogin(array $credentials): array
    {
        $username = $credentials['username'] ?? '';
        $password = $credentials['password'] ?? '';
        
        if (empty($username) || empty($password)) {
            throw new \InvalidArgumentException('Username and password are required for LDAP');
        }

        // الاتصال بخادم LDAP
        $ldapConnection = $this->connectToLDAP();
        
        // التحقق من بيانات الاعتماد
        if (!$this->authenticateLDAPUser($ldapConnection, $username, $password)) {
            throw new \SecurityException('LDAP authentication failed');
        }

        // جلب معلومات المستخدم من LDAP
        $userInfo = $this->fetchLDAPUserInfo($ldapConnection, $username);
        
        ldap_close($ldapConnection);
        
        return $userInfo;
    }

    /**
     * معالجة JWT
     */
    private function processJWTLogin(array $credentials): array
    {
        $jwtToken = $credentials['jwt_token'] ?? '';
        
        if (empty($jwtToken)) {
            throw new \InvalidArgumentException('JWT token is required');
        }

        // فك تشفير والتحقق من JWT
        $publicKey = $this->getJWTPublicKey();
        $decoded = JWT::decode($jwtToken, new Key($publicKey, 'RS256'));
        
        // التحقق من انتهاء الصلاحية
        if ($decoded->exp < time()) {
            throw new \SecurityException('JWT token has expired');
        }

        // استخراج معلومات المستخدم
        $userInfo = [
            'external_id' => $decoded->sub,
            'email' => $decoded->email,
            'name' => $decoded->name,
            'roles' => $decoded->roles ?? [],
            'department' => $decoded->department ?? null,
            'attributes' => (array) $decoded,
        ];
        
        return $userInfo;
    }

    /**
     * إنشاء أو تحديث المستخدم
     */
    private function createOrUpdateUser(array $userInfo, string $provider): User
    {
        $user = User::where('email', $userInfo['email'])
                   ->orWhere('external_id', $userInfo['external_id'] ?? null)
                   ->first();

        if (!$user) {
            $user = new User();
            $user->external_id = $userInfo['external_id'] ?? null;
            $user->sso_provider = $provider;
        }

        // تحديث معلومات المستخدم
        $user->name = $userInfo['name'];
        $user->email = $userInfo['email'];
        $user->is_active = true;
        $user->last_activity = now();
        $user->sso_last_login = now();

        // تعيين الدور بناءً على معلومات SSO
        if (isset($userInfo['roles']) && !empty($userInfo['roles'])) {
            $role = $this->mapSSORole($userInfo['roles'], $userInfo['department'] ?? null);
            if ($role) {
                $user->role_id = $role->id;
            }
        }

        $user->save();

        // حفظ البيانات الإضافية
        $this->saveSSOUserAttributes($user, $userInfo, $provider);

        return $user;
    }

    /**
     * إنشاء جلسة المستخدم
     */
    private function createUserSession(User $user, string $provider): array
    {
        // إنشاء رمز الجلسة
        $sessionToken = $user->createToken(
            "SSO-{$provider}-" . now()->timestamp,
            ['*'],
            Carbon::now()->addHours(8)
        );

        // حفظ معلومات الجلسة
        $sessionData = [
            'token' => $sessionToken->plainTextToken,
            'expires_at' => $sessionToken->accessToken->expires_at,
            'provider' => $provider,
            'created_at' => now(),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ];

        // حفظ في Cache للوصول السريع
        Cache::put(
            "sso_session_{$user->id}",
            $sessionData,
            Carbon::parse($sessionData['expires_at'])
        );

        return $sessionData;
    }

    /**
     * تسجيل نشاط SSO
     */
    private function logSSOActivity(?User $user, string $provider, string $status, string $error = null): void
    {
        Log::info('SSO Activity', [
            'user_id' => $user?->id,
            'provider' => $provider,
            'status' => $status,
            'error' => $error,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'timestamp' => now(),
        ]);

        // إنشاء حدث أمني إذا فشل
        if ($status === 'failed') {
            \App\Models\SecurityEvent::logEvent(
                'sso_login_failed',
                'medium',
                [
                    'provider' => $provider,
                    'error' => $error,
                    'attempted_user' => $user?->email,
                ],
                $user
            );
        }
    }

    /**
     * ربط أدوار SSO بأدوار النظام
     */
    private function mapSSORole(array $ssoRoles, ?string $department): ?Role
    {
        $roleMapping = $this->config['role_mapping'] ?? [
            'admin' => 'administrator',
            'manager' => 'production_manager',
            'supervisor' => 'production_supervisor',
            'user' => 'worker',
        ];

        // البحث عن أعلى دور في التسلسل الهرمي
        $highestRole = null;
        $highestPriority = 999;

        foreach ($ssoRoles as $ssoRole) {
            if (isset($roleMapping[$ssoRole])) {
                $role = Role::where('name', $roleMapping[$ssoRole])->first();
                
                if ($role && $role->priority < $highestPriority) {
                    $highestRole = $role;
                    $highestPriority = $role->priority;
                }
            }
        }

        return $highestRole;
    }

    /**
     * حفظ خصائص المستخدم من SSO
     */
    private function saveSSOUserAttributes(User $user, array $userInfo, string $provider): void
    {
        $attributes = [
            'sso_provider' => $provider,
            'sso_external_id' => $userInfo['external_id'] ?? null,
            'sso_department' => $userInfo['department'] ?? null,
            'sso_roles' => $userInfo['roles'] ?? [],
            'sso_last_sync' => now(),
            'sso_attributes' => $userInfo['attributes'] ?? [],
        ];

        Cache::put("user_sso_attributes_{$user->id}", $attributes, now()->addDays(7));
    }

    /**
     * تسجيل الخروج من SSO
     */
    public function processSSOLogout(User $user, string $provider): array
    {
        try {
            // إلغاء الرموز المميزة
            $user->tokens()->delete();
            
            // حذف معلومات الجلسة
            Cache::forget("sso_session_{$user->id}");
            Cache::forget("user_sso_attributes_{$user->id}");
            
            // تسجيل الخروج من مزود SSO إذا لزم الأمر
            $this->performSSOLogout($provider, $user);
            
            $this->logSSOActivity($user, $provider, 'logout');

            return [
                'success' => true,
                'message' => 'Successfully logged out from SSO',
                'provider' => $provider,
            ];

        } catch (\Exception $e) {
            $this->logSSOActivity($user, $provider, 'logout_failed', $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Helper Methods للتنفيذ الفعلي
     */
    private function verifySAMLSignature(\DOMDocument $samlDoc): bool
    {
        // تنفيذ التحقق من توقيع SAML
        return true; // مبسط للمثال
    }

    private function extractSAMLUserInfo(\DOMDocument $samlDoc): array
    {
        // استخراج معلومات المستخدم من SAML
        return [
            'external_id' => 'saml_user_123',
            'email' => 'user@company.com',
            'name' => 'John Doe',
            'roles' => ['user'],
            'department' => 'IT',
        ];
    }

    private function validateOAuthToken(string $token): array
    {
        // التحقق من رمز OAuth
        return ['valid' => true];
    }

    private function fetchOAuthUserInfo(string $token): array
    {
        // جلب معلومات المستخدم من OAuth
        return [
            'external_id' => 'oauth_user_123',
            'email' => 'user@company.com',
            'name' => 'John Doe',
            'roles' => ['user'],
        ];
    }

    private function connectToLDAP()
    {
        $ldapServer = $this->config['ldap']['server'] ?? 'ldap://localhost';
        return ldap_connect($ldapServer);
    }

    private function authenticateLDAPUser($connection, string $username, string $password): bool
    {
        $dn = "cn={$username}," . ($this->config['ldap']['base_dn'] ?? 'dc=company,dc=com');
        return @ldap_bind($connection, $dn, $password);
    }

    private function fetchLDAPUserInfo($connection, string $username): array
    {
        // جلب معلومات المستخدم من LDAP
        return [
            'external_id' => "ldap_{$username}",
            'email' => "{$username}@company.com",
            'name' => ucfirst($username),
            'roles' => ['user'],
        ];
    }

    private function getJWTPublicKey(): string
    {
        return $this->config['jwt']['public_key'] ?? '';
    }

    private function performSSOLogout(string $provider, User $user): void
    {
        // تنفيذ تسجيل الخروج من مزود SSO
        // يختلف حسب نوع المزود
    }
}