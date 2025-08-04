<?php

namespace App\Http\Controllers\Api\Production;

use App\Http\Controllers\Controller;
use App\Services\BarcodeQRService;
use App\Models\Product;
use App\Models\Order;
use App\Models\Material;
use App\Models\OrderProductionTracking;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class BarcodeQRController extends Controller
{
    private BarcodeQRService $barcodeQRService;

    public function __construct(BarcodeQRService $barcodeQRService)
    {
        $this->barcodeQRService = $barcodeQRService;
    }

    /**
     * Generate barcode for product
     */
    public function generateProductBarcode(Request $request, $productId): JsonResponse
    {
        $product = Product::find($productId);
        
        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found'
            ], 404);
        }

        $format = $request->input('format', 'png');
        
        try {
            $result = $this->barcodeQRService->generateProductBarcode($product, $format);
            
            return response()->json([
                'success' => true,
                'message' => 'Barcode generated successfully',
                'barcode' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate barcode',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate QR code for order
     */
    public function generateOrderQRCode(Request $request, $orderId): JsonResponse
    {
        $order = Order::find($orderId);
        
        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        $format = $request->input('format', 'png');
        
        try {
            $result = $this->barcodeQRService->generateOrderQRCode($order, $format);
            
            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'qrcode' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate QR code for material
     */
    public function generateMaterialQRCode(Request $request, $materialId): JsonResponse
    {
        $material = Material::find($materialId);
        
        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found'
            ], 404);
        }

        $format = $request->input('format', 'png');
        
        try {
            $result = $this->barcodeQRService->generateMaterialQRCode($material, $format);
            
            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'qrcode' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate QR code for production stage
     */
    public function generateProductionStageQRCode(Request $request, $trackingId): JsonResponse
    {
        $tracking = OrderProductionTracking::find($trackingId);
        
        if (!$tracking) {
            return response()->json([
                'success' => false,
                'message' => 'Production tracking not found'
            ], 404);
        }

        $format = $request->input('format', 'png');
        
        try {
            $result = $this->barcodeQRService->generateProductionStageQRCode($tracking, $format);
            
            return response()->json([
                'success' => true,
                'message' => 'QR code generated successfully',
                'qrcode' => $result
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate QR code',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process scanned data (barcode or QR code)
     */
    public function processScan(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scanned_data' => 'required|string',
            'scanner_type' => 'in:barcode,qrcode',
            'worker_id' => 'integer|exists:workers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $result = $this->barcodeQRService->parseScannedData($request->scanned_data);
            
            // Log scan activity
            $this->logScanActivity($request, $result);
            
            return response()->json([
                'success' => true,
                'message' => 'Scan processed successfully',
                'scan_result' => $result,
                'timestamp' => now()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process scan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update production via scan
     */
    public function updateProductionByScan(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'scanned_data' => 'required|string',
            'status' => 'in:pending,in_progress,completed,paused,cancelled',
            'worker_id' => 'integer|exists:workers,id',
            'actual_hours' => 'numeric|min:0',
            'quality_score' => 'integer|min:1|max:10',
            'notes' => 'string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only(['status', 'worker_id', 'actual_hours', 'quality_score', 'notes']);
            $updateData['updated_at'] = now();
            
            $result = $this->barcodeQRService->updateProductionByScan(
                $request->scanned_data,
                $updateData
            );
            
            return response()->json([
                'success' => $result['success'],
                'message' => $result['message'] ?? 'Production updated',
                'result' => $result,
                'timestamp' => now()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update production',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate batch barcodes/QR codes
     */
    public function generateBatch(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:products,orders,materials,production_stages',
            'ids' => 'required|array',
            'ids.*' => 'integer',
            'format' => 'in:png,svg'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $results = $this->barcodeQRService->generateBatch(
                $request->type,
                $request->ids,
                $request->input('format', 'png')
            );
            
            return response()->json([
                'success' => true,
                'message' => 'Batch generation completed',
                'results' => $results,
                'generated_count' => count($results),
                'timestamp' => now()
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate batch',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get scan history
     */
    public function getScanHistory(Request $request): JsonResponse
    {
        // This would require a scans table to track scan history
        // For now, return mock data
        return response()->json([
            'success' => true,
            'message' => 'Scan history retrieved',
            'scans' => [
                [
                    'id' => 1,
                    'type' => 'qrcode',
                    'scanned_data' => 'Order QR Code',
                    'worker_id' => $request->input('worker_id'),
                    'scanned_at' => now()->subHours(1)
                ]
            ],
            'pagination' => [
                'current_page' => 1,
                'per_page' => 20,
                'total' => 1
            ]
        ]);
    }

    /**
     * Get scanning statistics
     */
    public function getScanStatistics(): JsonResponse
    {
        // Mock statistics - would be calculated from actual scan data
        return response()->json([
            'success' => true,
            'message' => 'Scan statistics retrieved',
            'statistics' => [
                'total_scans_today' => 0,
                'barcode_scans' => 0,
                'qrcode_scans' => 0,
                'production_updates' => 0,
                'most_scanned_items' => [],
                'scan_frequency_by_hour' => [],
                'worker_scan_activity' => []
            ],
            'generated_at' => now()
        ]);
    }

    /**
     * Log scan activity
     */
    private function logScanActivity(Request $request, array $scanResult): void
    {
        // Log scan activity for tracking and analytics
        \Log::info('Barcode/QR Scan Activity', [
            'scanned_data' => $request->scanned_data,
            'scanner_type' => $request->scanner_type,
            'worker_id' => $request->worker_id,
            'scan_result' => $scanResult,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()
        ]);
    }
}