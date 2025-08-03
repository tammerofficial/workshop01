<?php

namespace App\Services;

use App\Models\Client;
use App\Models\LoyaltyCustomer;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AppleWalletIntegrationService
{
    protected string $loyaltySystemUrl;
    protected string $loyaltySystemKey;

    public function __construct()
    {
        $this->loyaltySystemUrl = config('loyalty.system.external_system_url', 'http://localhost:8001');
        $this->loyaltySystemKey = config('loyalty.system.external_system_key', 'default-key');
    }

    /**
     * إنشاء بطاقة Apple Wallet لعميل الولاء
     */
    public function createWalletPass(LoyaltyCustomer $loyaltyCustomer): array
    {
        try {
            // بيانات البطاقة
            $passData = $this->buildPassData($loyaltyCustomer);
            
            // استدعاء خدمة إنشاء البطاقة من نظام الولاء
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->loyaltySystemKey,
            ])->post("{$this->loyaltySystemUrl}/api/apple-wallet/generate", $passData);

            if ($response->successful()) {
                $passResult = $response->json();
                
                // تحديث بيانات العميل مع معرف البطاقة
                $loyaltyCustomer->update([
                    'wallet_pass_serial' => $passResult['serial_number'],
                    'wallet_auth_token' => $passResult['auth_token'],
                    'wallet_last_updated_at' => now(),
                ]);

                // مزامنة مع جدول العملاء
                $loyaltyCustomer->client->syncLoyaltyPoints();

                Log::info('Apple Wallet pass created successfully', [
                    'loyalty_customer_id' => $loyaltyCustomer->id,
                    'serial_number' => $passResult['serial_number']
                ]);

                return [
                    'success' => true,
                    'pass_url' => $passResult['pass_url'],
                    'serial_number' => $passResult['serial_number'],
                    'qr_code' => $passResult['qr_code'] ?? null,
                ];
            } else {
                throw new \Exception('Failed to create Apple Wallet pass: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Error creating Apple Wallet pass', [
                'loyalty_customer_id' => $loyaltyCustomer->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * تحديث بطاقة Apple Wallet
     */
    public function updateWalletPass(LoyaltyCustomer $loyaltyCustomer): array
    {
        try {
            if (!$loyaltyCustomer->wallet_pass_serial) {
                return $this->createWalletPass($loyaltyCustomer);
            }

            $updateData = $this->buildPassData($loyaltyCustomer);
            $updateData['serial_number'] = $loyaltyCustomer->wallet_pass_serial;

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->loyaltySystemKey,
            ])->put("{$this->loyaltySystemUrl}/api/apple-wallet/update", $updateData);

            if ($response->successful()) {
                $loyaltyCustomer->update([
                    'wallet_last_updated_at' => now(),
                ]);

                Log::info('Apple Wallet pass updated successfully', [
                    'loyalty_customer_id' => $loyaltyCustomer->id,
                    'serial_number' => $loyaltyCustomer->wallet_pass_serial
                ]);

                return [
                    'success' => true,
                    'message' => 'تم تحديث البطاقة بنجاح'
                ];
            } else {
                throw new \Exception('Failed to update Apple Wallet pass: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Error updating Apple Wallet pass', [
                'loyalty_customer_id' => $loyaltyCustomer->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * إرسال إشعار push للبطاقة
     */
    public function sendPushNotification(LoyaltyCustomer $loyaltyCustomer, string $message = null): array
    {
        try {
            if (!$loyaltyCustomer->wallet_pass_serial) {
                throw new \Exception('لا توجد بطاقة Apple Wallet للعميل');
            }

            $notificationData = [
                'serial_number' => $loyaltyCustomer->wallet_pass_serial,
                'message' => $message ?? 'تم تحديث نقاط الولاء الخاصة بك',
                'customer_data' => $this->buildPassData($loyaltyCustomer)
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->loyaltySystemKey,
            ])->post("{$this->loyaltySystemUrl}/api/apple-wallet/push", $notificationData);

            if ($response->successful()) {
                Log::info('Apple Wallet push notification sent', [
                    'loyalty_customer_id' => $loyaltyCustomer->id,
                    'serial_number' => $loyaltyCustomer->wallet_pass_serial
                ]);

                return [
                    'success' => true,
                    'message' => 'تم إرسال الإشعار بنجاح'
                ];
            } else {
                throw new \Exception('Failed to send push notification: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Error sending Apple Wallet push notification', [
                'loyalty_customer_id' => $loyaltyCustomer->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * بناء بيانات البطاقة
     */
    protected function buildPassData(LoyaltyCustomer $loyaltyCustomer): array
    {
        $client = $loyaltyCustomer->client;
        
        return [
            'customer' => [
                'id' => $loyaltyCustomer->id,
                'client_id' => $client->id,
                'name' => $loyaltyCustomer->name,
                'email' => $loyaltyCustomer->email,
                'phone' => $loyaltyCustomer->phone,
                'membership_number' => $loyaltyCustomer->membership_number,
            ],
            'loyalty' => [
                'tier' => $loyaltyCustomer->tier,
                'tier_name' => $loyaltyCustomer->getTierName(),
                'tier_color' => $loyaltyCustomer->getTierColor(),
                'total_points' => $loyaltyCustomer->total_points,
                'available_points' => $loyaltyCustomer->available_points,
                'total_spent' => $loyaltyCustomer->total_spent,
                'total_orders' => $loyaltyCustomer->total_orders,
                'member_since' => $loyaltyCustomer->joined_at?->format('Y-m-d'),
                'last_purchase' => $loyaltyCustomer->last_purchase_at?->format('Y-m-d'),
            ],
            'workshop' => [
                'name' => config('app.name', 'ورشة الخياطة'),
                'contact_phone' => config('loyalty.workshop.phone', '+965 1234 5678'),
                'contact_email' => config('loyalty.workshop.email', 'info@workshop.com'),
                'address' => config('loyalty.workshop.address', 'الكويت'),
                'website' => config('app.url'),
            ],
            'pass_settings' => [
                'organization_name' => config('loyalty.apple_wallet.organization_name', 'Workshop Loyalty'),
                'description' => config('loyalty.apple_wallet.pass_description', 'بطاقة ولاء الورشة'),
                'logo_text' => config('loyalty.apple_wallet.logo_text', 'ولاء الورشة'),
                'background_color' => config('loyalty.apple_wallet.colors.background', '#1a1a1a'),
                'foreground_color' => config('loyalty.apple_wallet.colors.foreground', '#ffffff'),
                'label_color' => config('loyalty.apple_wallet.colors.label', '#cccccc'),
            ]
        ];
    }

    /**
     * حذف بطاقة Apple Wallet
     */
    public function deleteWalletPass(LoyaltyCustomer $loyaltyCustomer): array
    {
        try {
            if (!$loyaltyCustomer->wallet_pass_serial) {
                return [
                    'success' => true,
                    'message' => 'لا توجد بطاقة للحذف'
                ];
            }

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->loyaltySystemKey,
            ])->delete("{$this->loyaltySystemUrl}/api/apple-wallet/delete", [
                'serial_number' => $loyaltyCustomer->wallet_pass_serial
            ]);

            if ($response->successful()) {
                $loyaltyCustomer->update([
                    'wallet_pass_serial' => null,
                    'wallet_auth_token' => null,
                    'wallet_last_updated_at' => null,
                ]);

                Log::info('Apple Wallet pass deleted successfully', [
                    'loyalty_customer_id' => $loyaltyCustomer->id
                ]);

                return [
                    'success' => true,
                    'message' => 'تم حذف البطاقة بنجاح'
                ];
            } else {
                throw new \Exception('Failed to delete Apple Wallet pass: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Error deleting Apple Wallet pass', [
                'loyalty_customer_id' => $loyaltyCustomer->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * استيراد شعار الورشة لاستخدامه في البطاقات
     */
    public function uploadWorkshopLogo(string $logoPath): array
    {
        try {
            if (!Storage::exists($logoPath)) {
                throw new \Exception('ملف الشعار غير موجود');
            }

            $logoContent = Storage::get($logoPath);
            $logoName = basename($logoPath);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->loyaltySystemKey,
            ])->attach('logo', $logoContent, $logoName)
              ->post("{$this->loyaltySystemUrl}/api/apple-wallet/upload-logo");

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('Workshop logo uploaded to loyalty system', [
                    'logo_path' => $logoPath,
                    'logo_id' => $result['logo_id'] ?? null
                ]);

                return [
                    'success' => true,
                    'logo_id' => $result['logo_id'] ?? null,
                    'message' => 'تم رفع الشعار بنجاح'
                ];
            } else {
                throw new \Exception('Failed to upload logo: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Error uploading workshop logo', [
                'logo_path' => $logoPath,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * مزامنة بيانات العميل مع نظام الولاء الخارجي
     */
    public function syncCustomerWithExternalSystem(LoyaltyCustomer $loyaltyCustomer): array
    {
        try {
            $customerData = [
                'workshop_customer_id' => $loyaltyCustomer->id,
                'client_id' => $loyaltyCustomer->client_id,
                'name' => $loyaltyCustomer->name,
                'email' => $loyaltyCustomer->email,
                'phone' => $loyaltyCustomer->phone,
                'date_of_birth' => $loyaltyCustomer->date_of_birth?->format('Y-m-d'),
                'membership_number' => $loyaltyCustomer->membership_number,
                'tier' => $loyaltyCustomer->tier,
                'total_points' => $loyaltyCustomer->total_points,
                'available_points' => $loyaltyCustomer->available_points,
                'total_spent' => $loyaltyCustomer->total_spent,
                'joined_at' => $loyaltyCustomer->joined_at?->format('Y-m-d H:i:s'),
            ];

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $this->loyaltySystemKey,
            ])->post("{$this->loyaltySystemUrl}/api/customers/sync", $customerData);

            if ($response->successful()) {
                $result = $response->json();
                
                // تحديث معرف العميل في النظام الخارجي إذا لزم الأمر
                if (isset($result['external_customer_id'])) {
                    $loyaltyCustomer->update([
                        'metadata' => array_merge(
                            $loyaltyCustomer->metadata ?? [],
                            ['external_customer_id' => $result['external_customer_id']]
                        )
                    ]);
                }

                Log::info('Customer synced with external loyalty system', [
                    'loyalty_customer_id' => $loyaltyCustomer->id,
                    'external_customer_id' => $result['external_customer_id'] ?? null
                ]);

                return [
                    'success' => true,
                    'external_customer_id' => $result['external_customer_id'] ?? null,
                    'message' => 'تم مزامنة بيانات العميل بنجاح'
                ];
            } else {
                throw new \Exception('Failed to sync customer: ' . $response->body());
            }

        } catch (\Exception $e) {
            Log::error('Error syncing customer with external system', [
                'loyalty_customer_id' => $loyaltyCustomer->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * اختبار الاتصال مع نظام الولاء الخارجي
     */
    public function testConnection(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->loyaltySystemKey,
            ])->get("{$this->loyaltySystemUrl}/api/health");

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message' => 'الاتصال بنظام الولاء يعمل بشكل صحيح',
                    'system_info' => $response->json()
                ];
            } else {
                throw new \Exception('Connection test failed: ' . $response->status());
            }

        } catch (\Exception $e) {
            Log::error('Loyalty system connection test failed', [
                'url' => $this->loyaltySystemUrl,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'message' => 'فشل الاتصال بنظام الولاء: ' . $e->getMessage()
            ];
        }
    }
}