<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Spatie\Activitylog\Facades\LogActivity;

class UserController extends Controller
{
    /**
     * عرض قائمة المستخدمين
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::with(['role']);

            // البحث
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // تصفية حسب الدور
            if ($request->has('role')) {
                $query->whereHas('role', function($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }

            // تصفية حسب الحالة
            if ($request->has('status')) {
                $query->where('is_active', $request->status === 'active');
            }

            // الترتيب
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // الترقيم
            $perPage = $request->get('per_page', 15);
            $users = $query->paginate($perPage);

            // إضافة معلومات إضافية
            $users->getCollection()->transform(function($user) {
                $user->role_display_name = $user->role ? $user->role->display_name : 'غير محدد';
                $user->last_activity_formatted = $user->last_activity ? 
                    Carbon::parse($user->last_activity)->diffForHumans() : 'لم يسجل دخول';
                return $user;
            });

            return response()->json([
                'success' => true,
                'data' => $users,
                'summary' => [
                    'total_users' => User::count(),
                    'active_users' => User::where('is_active', true)->count(),
                    'inactive_users' => User::where('is_active', false)->count(),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب المستخدمين: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إنشاء مستخدم جديد
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role_id' => 'required|exists:roles,id',
                'department' => 'nullable|string|max:255',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صحيحة',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role_id' => $request->role_id,
                'department' => $request->department,
                'is_active' => $request->get('is_active', true),
                'email_verified_at' => now(),
            ]);

            // تحميل العلاقات
            $user->load('role');

            // تسجيل النشاط
            try {
                if (function_exists('activity') && auth()->check()) {
                    activity()
                        ->performedOn($user)
                        ->causedBy(auth()->user())
                        ->withProperties(['action' => 'user_created'])
                        ->log('تم إنشاء مستخدم جديد: ' . $user->name);
                }
            } catch (\Exception $e) {
                // تجاهل أخطاء تسجيل النشاط
                \Log::warning('Failed to log activity: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المستخدم بنجاح',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في إنشاء المستخدم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * عرض مستخدم محدد
     */
    public function show(User $user): JsonResponse
    {
        try {
            $user->load(['role', 'activityLogs' => function($query) {
                $query->latest()->limit(10);
            }]);

            $user->role_display_name = $user->role ? $user->role->display_name : 'غير محدد';
            $user->last_activity_formatted = $user->last_activity ? 
                Carbon::parse($user->last_activity)->diffForHumans() : 'لم يسجل دخول';

            return response()->json([
                'success' => true,
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب بيانات المستخدم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تحديث مستخدم
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
                'password' => 'nullable|string|min:8',
                'role_id' => 'required|exists:roles,id',
                'department' => 'nullable|string|max:255',
                'is_active' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صحيحة',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldData = $user->toArray();

            $updateData = [
                'name' => $request->name,
                'email' => $request->email,
                'role_id' => $request->role_id,
                'department' => $request->department,
                'is_active' => $request->get('is_active', true),
            ];

            // تحديث كلمة المرور إذا تم تقديمها
            if ($request->filled('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $user->update($updateData);
            $user->load('role');

            // تسجيل النشاط
            try {
                if (function_exists('activity') && auth()->check()) {
                    activity()
                        ->performedOn($user)
                        ->causedBy(auth()->user())
                        ->withProperties([
                            'action' => 'user_updated',
                            'old_data' => $oldData,
                            'new_data' => $user->toArray()
                        ])
                        ->log('تم تحديث بيانات المستخدم: ' . $user->name);
                }
            } catch (\Exception $e) {
                // تجاهل أخطاء تسجيل النشاط
                \Log::warning('Failed to log activity: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث المستخدم بنجاح',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تحديث المستخدم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حذف مستخدم
     */
    public function destroy(User $user): JsonResponse
    {
        try {
            // التحقق من عدم حذف المستخدم الحالي
            if ($user->id === auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف حسابك الخاص'
                ], 403);
            }

            // التحقق من عدم حذف مستخدم لديه بيانات مرتبطة
            if ($user->orders()->exists() || $user->tasks()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن حذف هذا المستخدم لأن لديه بيانات مرتبطة'
                ], 403);
            }

            $userName = $user->name;
            $user->delete();

            // تسجيل النشاط
            activity()
                ->causedBy(auth()->user())
                ->withProperties(['action' => 'user_deleted', 'deleted_user' => $userName])
                ->log('تم حذف المستخدم: ' . $userName);

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المستخدم بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في حذف المستخدم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تغيير حالة المستخدم (تفعيل/إلغاء تفعيل)
     */
    public function toggleStatus(User $user): JsonResponse
    {
        try {
            // التحقق من عدم إلغاء تفعيل المستخدم الحالي
            if ($user->id === auth()->id() && $user->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'لا يمكن إلغاء تفعيل حسابك الخاص'
                ], 403);
            }

            $oldStatus = $user->is_active;
            $user->update(['is_active' => !$user->is_active]);

            $action = $user->is_active ? 'تفعيل' : 'إلغاء تفعيل';

            // تسجيل النشاط
            activity()
                ->performedOn($user)
                ->causedBy(auth()->user())
                ->withProperties([
                    'action' => 'user_status_changed',
                    'old_status' => $oldStatus,
                    'new_status' => $user->is_active
                ])
                ->log($action . ' المستخدم: ' . $user->name);

            return response()->json([
                'success' => true,
                'message' => 'تم ' . $action . ' المستخدم بنجاح',
                'data' => ['is_active' => $user->is_active]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تغيير حالة المستخدم: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تعيين دور للمستخدم
     */
    public function assignRole(Request $request, User $user): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'role_id' => 'required|exists:roles,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صحيحة',
                    'errors' => $validator->errors()
                ], 422);
            }

            $oldRole = $user->role;
            $newRole = Role::find($request->role_id);

            $user->update(['role_id' => $request->role_id]);
            $user->load('role');

            // تسجيل النشاط
            activity()
                ->performedOn($user)
                ->causedBy(auth()->user())
                ->withProperties([
                    'action' => 'role_assigned',
                    'old_role' => $oldRole ? $oldRole->display_name : 'بلا دور',
                    'new_role' => $newRole->display_name
                ])
                ->log('تم تغيير دور المستخدم ' . $user->name . ' من ' . ($oldRole ? $oldRole->display_name : 'بلا دور') . ' إلى ' . $newRole->display_name);

            return response()->json([
                'success' => true,
                'message' => 'تم تعيين الدور بنجاح',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تعيين الدور: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * إحصائيات المستخدمين
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'active_users' => User::where('is_active', true)->count(),
                'inactive_users' => User::where('is_active', false)->count(),
                'users_by_role' => User::join('roles', 'users.role_id', '=', 'roles.id')
                    ->selectRaw('roles.display_name, COUNT(*) as count')
                    ->groupBy('roles.id', 'roles.display_name')
                    ->get(),
                'recent_registrations' => User::whereDate('created_at', '>=', now()->subDays(30)->toDateString())
                    ->count(),
                'users_by_department' => User::selectRaw('department, COUNT(*) as count')
                    ->whereNotNull('department')
                    ->groupBy('department')
                    ->get(),
                'login_activity' => [
                    'today' => User::whereDate('last_activity', today())->count(),
                    'this_week' => User::whereBetween('last_activity', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                    'this_month' => User::whereMonth('last_activity', now()->month)->count(),
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في جلب الإحصائيات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تصدير بيانات المستخدمين
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $format = $request->get('format', 'csv');
            
            $users = User::with('role')
                ->select(['id', 'name', 'email', 'role_id', 'department', 'is_active', 'created_at', 'last_activity'])
                ->get()
                ->map(function($user) {
                    return [
                        'ID' => $user->id,
                        'الاسم' => $user->name,
                        'البريد الإلكتروني' => $user->email,
                        'الدور' => $user->role ? $user->role->display_name : 'غير محدد',
                        'القسم' => $user->department ?: 'غير محدد',
                        'الحالة' => $user->is_active ? 'نشط' : 'غير نشط',
                        'تاريخ الانضمام' => $user->created_at->format('Y-m-d'),
                        'آخر نشاط' => $user->last_activity ? Carbon::parse($user->last_activity)->format('Y-m-d H:i') : 'لا يوجد'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $users,
                'filename' => 'users_export_' . now()->format('Y_m_d_H_i_s') . '.' . $format
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تصدير البيانات: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * تغيير كلمة مرور المستخدم
     */
    public function changePassword(Request $request, User $user): JsonResponse
    {
        try {
            // التحقق من صحة البيانات
            $validator = Validator::make($request->all(), [
                'password' => 'required|string|min:6',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صحيحة',
                    'errors' => $validator->errors()
                ], 422);
            }

            // تحديث كلمة المرور
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            // تسجيل النشاط - مؤقتاً معطل
            // activity log will be added later when properly configured

            return response()->json([
                'success' => true,
                'message' => 'تم تغيير كلمة المرور بنجاح',
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ في تغيير كلمة المرور: ' . $e->getMessage()
            ], 500);
        }
    }
}