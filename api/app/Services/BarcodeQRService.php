<?php

namespace App\Services;

use Picqer\Barcode\BarcodeGeneratorPNG;
use Picqer\Barcode\BarcodeGeneratorSVG;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Endroid\QrCode\Writer\SvgWriter;
use App\Models\Product;
use App\Models\Order;
use App\Models\Material;
use App\Models\OrderProductionTracking;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BarcodeQRService
{
    private BarcodeGeneratorPNG $barcodeGeneratorPNG;
    private BarcodeGeneratorSVG $barcodeGeneratorSVG;

    public function __construct()
    {
        $this->barcodeGeneratorPNG = new BarcodeGeneratorPNG();
        $this->barcodeGeneratorSVG = new BarcodeGeneratorSVG();
    }

    /**
     * Generate barcode for product
     */
    public function generateProductBarcode(Product $product, string $format = 'png'): array
    {
        $barcodeData = $this->generateProductBarcodeData($product);
        
        if ($format === 'svg') {
            $barcodeContent = $this->barcodeGeneratorSVG->getBarcode($barcodeData, BarcodeGeneratorSVG::TYPE_CODE_128);
        } else {
            $barcodeContent = $this->barcodeGeneratorPNG->getBarcode($barcodeData, BarcodeGeneratorPNG::TYPE_CODE_128);
        }

        $filename = "barcodes/products/{$product->id}_{$barcodeData}.{$format}";
        Storage::disk('public')->put($filename, $barcodeContent);

        return [
            'data' => $barcodeData,
            'url' => Storage::disk('public')->url($filename),
            'path' => $filename,
            'type' => 'barcode',
            'format' => $format,
            'product_id' => $product->id,
            'generated_at' => now()
        ];
    }

    /**
     * Generate QR code for order tracking
     */
    public function generateOrderQRCode(Order $order, string $format = 'png'): array
    {
        $qrData = $this->generateOrderQRData($order);
        
        $writer = $format === 'svg' ? new SvgWriter() : new PngWriter();
        
        $result = Builder::create()
            ->writer($writer)
            ->data($qrData)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(300)
            ->margin(10)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->build();

        $filename = "qrcodes/orders/{$order->id}_{$order->created_at->format('Ymd')}.{$format}";
        Storage::disk('public')->put($filename, $result->getString());

        return [
            'data' => $qrData,
            'url' => Storage::disk('public')->url($filename),
            'path' => $filename,
            'type' => 'qrcode',
            'format' => $format,
            'order_id' => $order->id,
            'generated_at' => now()
        ];
    }

    /**
     * Generate QR code for material tracking
     */
    public function generateMaterialQRCode(Material $material, string $format = 'png'): array
    {
        $qrData = $this->generateMaterialQRData($material);
        
        $writer = $format === 'svg' ? new SvgWriter() : new PngWriter();
        
        $result = Builder::create()
            ->writer($writer)
            ->data($qrData)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(250)
            ->margin(8)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->build();

        $filename = "qrcodes/materials/{$material->id}_{$material->sku}.{$format}";
        Storage::disk('public')->put($filename, $result->getString());

        return [
            'data' => $qrData,
            'url' => Storage::disk('public')->url($filename),
            'path' => $filename,
            'type' => 'qrcode',
            'format' => $format,
            'material_id' => $material->id,
            'generated_at' => now()
        ];
    }

    /**
     * Generate QR code for production stage tracking
     */
    public function generateProductionStageQRCode(OrderProductionTracking $tracking, string $format = 'png'): array
    {
        $qrData = $this->generateProductionStageQRData($tracking);
        
        $writer = $format === 'svg' ? new SvgWriter() : new PngWriter();
        
        $result = Builder::create()
            ->writer($writer)
            ->data($qrData)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(200)
            ->margin(6)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->build();

        $filename = "qrcodes/production/{$tracking->id}_{$tracking->order_id}_stage.{$format}";
        Storage::disk('public')->put($filename, $result->getString());

        return [
            'data' => $qrData,
            'url' => Storage::disk('public')->url($filename),
            'path' => $filename,
            'type' => 'qrcode',
            'format' => $format,
            'tracking_id' => $tracking->id,
            'generated_at' => now()
        ];
    }

    /**
     * Parse scanned barcode/QR data
     */
    public function parseScannedData(string $scannedData): array
    {
        try {
            // Try to decode as JSON first (for QR codes)
            $decoded = json_decode($scannedData, true);
            
            if ($decoded && isset($decoded['type'])) {
                return $this->handleQRCodeScan($decoded);
            }
            
            // Handle as barcode
            return $this->handleBarcodeScan($scannedData);
            
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Invalid scan data',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Update production status via scan
     */
    public function updateProductionByScan(string $scannedData, array $updateData): array
    {
        $parseResult = $this->parseScannedData($scannedData);
        
        if (!$parseResult['success']) {
            return $parseResult;
        }

        $data = $parseResult['data'];
        
        if ($data['type'] === 'production_stage') {
            return $this->updateProductionStage($data['tracking_id'], $updateData);
        }
        
        if ($data['type'] === 'order') {
            return $this->updateOrderStatus($data['order_id'], $updateData);
        }

        return [
            'success' => false,
            'error' => 'Unsupported scan type for production update'
        ];
    }

    /**
     * Generate product barcode data
     */
    private function generateProductBarcodeData(Product $product): string
    {
        // Use SKU if available, otherwise generate based on ID
        if ($product->sku) {
            return $product->sku;
        }
        
        return 'PRD' . str_pad($product->id, 8, '0', STR_PAD_LEFT);
    }

    /**
     * Generate order QR data
     */
    private function generateOrderQRData(Order $order): string
    {
        $data = [
            'type' => 'order',
            'order_id' => $order->id,
            'order_number' => $order->id,
            'client_name' => $order->client->name ?? 'Unknown',
            'status' => $order->status,
            'created_at' => $order->created_at->toISOString(),
            'tracking_url' => config('app.url') . "/orders/{$order->id}/tracking",
            'scan_timestamp' => now()->toISOString()
        ];
        
        return json_encode($data);
    }

    /**
     * Generate material QR data
     */
    private function generateMaterialQRData(Material $material): string
    {
        $data = [
            'type' => 'material',
            'material_id' => $material->id,
            'sku' => $material->sku,
            'name' => $material->name,
            'quantity' => $material->quantity,
            'unit' => $material->unit,
            'location' => $material->storage_location ?? 'Unknown',
            'tracking_url' => config('app.url') . "/materials/{$material->id}",
            'scan_timestamp' => now()->toISOString()
        ];
        
        return json_encode($data);
    }

    /**
     * Generate production stage QR data
     */
    private function generateProductionStageQRData(OrderProductionTracking $tracking): string
    {
        $data = [
            'type' => 'production_stage',
            'tracking_id' => $tracking->id,
            'order_id' => $tracking->order_id,
            'stage_name' => $tracking->productionStage->name ?? 'Unknown Stage',
            'status' => $tracking->status,
            'worker_id' => $tracking->worker_id,
            'started_at' => $tracking->started_at?->toISOString(),
            'tracking_url' => config('app.url') . "/production/tracking/{$tracking->id}",
            'scan_timestamp' => now()->toISOString()
        ];
        
        return json_encode($data);
    }

    /**
     * Handle QR code scan
     */
    private function handleQRCodeScan(array $decoded): array
    {
        return [
            'success' => true,
            'type' => 'qrcode',
            'data' => $decoded,
            'scanned_at' => now()
        ];
    }

    /**
     * Handle barcode scan
     */
    private function handleBarcodeScan(string $barcodeData): array
    {
        // Try to find product by SKU or generated barcode
        $product = Product::where('sku', $barcodeData)->first();
        
        if (!$product && str_starts_with($barcodeData, 'PRD')) {
            $productId = (int) substr($barcodeData, 3);
            $product = Product::find($productId);
        }

        if ($product) {
            return [
                'success' => true,
                'type' => 'barcode',
                'data' => [
                    'type' => 'product',
                    'product_id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'barcode' => $barcodeData
                ],
                'scanned_at' => now()
            ];
        }

        return [
            'success' => false,
            'error' => 'Product not found',
            'barcode' => $barcodeData
        ];
    }

    /**
     * Update production stage
     */
    private function updateProductionStage(int $trackingId, array $updateData): array
    {
        $tracking = OrderProductionTracking::find($trackingId);
        
        if (!$tracking) {
            return [
                'success' => false,
                'error' => 'Production stage not found'
            ];
        }

        $tracking->update($updateData);
        
        return [
            'success' => true,
            'message' => 'Production stage updated successfully',
            'tracking' => $tracking->fresh()
        ];
    }

    /**
     * Update order status
     */
    private function updateOrderStatus(int $orderId, array $updateData): array
    {
        $order = Order::find($orderId);
        
        if (!$order) {
            return [
                'success' => false,
                'error' => 'Order not found'
            ];
        }

        $order->update($updateData);
        
        return [
            'success' => true,
            'message' => 'Order updated successfully',
            'order' => $order->fresh()
        ];
    }

    /**
     * Generate batch barcodes/QR codes
     */
    public function generateBatch(string $type, array $ids, string $format = 'png'): array
    {
        $results = [];
        
        foreach ($ids as $id) {
            try {
                switch ($type) {
                    case 'products':
                        $product = Product::find($id);
                        if ($product) {
                            $results[] = $this->generateProductBarcode($product, $format);
                        }
                        break;
                        
                    case 'orders':
                        $order = Order::find($id);
                        if ($order) {
                            $results[] = $this->generateOrderQRCode($order, $format);
                        }
                        break;
                        
                    case 'materials':
                        $material = Material::find($id);
                        if ($material) {
                            $results[] = $this->generateMaterialQRCode($material, $format);
                        }
                        break;
                }
            } catch (\Exception $e) {
                $results[] = [
                    'error' => $e->getMessage(),
                    'id' => $id
                ];
            }
        }
        
        return $results;
    }
}