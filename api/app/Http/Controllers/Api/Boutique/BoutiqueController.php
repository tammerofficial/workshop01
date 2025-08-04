<?php

namespace App\Http\Controllers\Api\Boutique;

use App\Http\Controllers\Controller;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class BoutiqueController extends Controller
{
    /**
     * عرض جميع البوتيكات
     */
    public function index(Request $request): JsonResponse
    {
        if (!auth()->user()->hasPermission('boutique.view')) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بعرض البوتيكات'
            ], 403);
        }

        try {
            $boutiques = Boutique::accessibleByUser(auth()->user())
                ->with(['manager'])
                ->when($request->active_only, fn($q) => $q->active())
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $boutiques
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب البوتيكات'
            ], 500);
        }
    }

    /**
     * عرض بوتيك محدد
     */
    public function show(Boutique $boutique): JsonResponse
    {
        if (!$boutique->canBeAccessedBy(auth()->user())) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بالوصول لهذا البوتيك'
            ], 403);
        }

        try {
            $boutique->load(['manager', 'staff']);
            
            // إحصائيات البوتيك
            $stats = $boutique->calculateSalesForPeriod(
                now()->startOfMonth(),
                now()->endOfMonth()
            );

            return response()->json([
                'success' => true,
                'data' => [
                    'boutique' => $boutique,
                    'monthly_stats' => $stats
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب بيانات البوتيك'
            ], 500);
        }
    }

    /**
     * إنشاء بوتيك جديد
     */
    public function store(Request $request): JsonResponse
    {
        if (!auth()->user()->hasPermission('boutique.create')) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بإنشاء بوتيك جديد'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'manager_id' => 'required|exists:users,id',
            'business_hours' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $boutique = Boutique::create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء البوتيك بنجاح',
                'data' => $boutique
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء البوتيك'
            ], 500);
        }
    }

    /**
     * تحديث بوتيك
     */
    public function update(Request $request, Boutique $boutique): JsonResponse
    {
        if (!$boutique->canBeEditedBy(auth()->user())) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتعديل هذا البوتيك'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'location' => 'sometimes|string|max:255',
            'manager_id' => 'sometimes|exists:users,id',
            'business_hours' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $boutique->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث البوتيك بنجاح',
                'data' => $boutique
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تحديث البوتيك'
            ], 500);
        }
    }
}