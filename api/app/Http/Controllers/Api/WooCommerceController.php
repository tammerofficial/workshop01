<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Order;
use App\Models\Material;
use App\Models\Category;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class WooCommerceController extends Controller
{
    /**
     * Test WooCommerce connection
     */
    public function testConnection(Request $request): JsonResponse
    {
        try {
            $url = $request->input('url');
            $consumerKey = $request->input('consumer_key');
            $consumerSecret = $request->input('consumer_secret');

            // Test API connection by making a simple request
            $apiUrl = rtrim($url, '/') . '/wp-json/wc/v3/products?per_page=1';
            
            $curl = curl_init();
            
            curl_setopt_array($curl, [
                CURLOPT_URL => $apiUrl,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Basic ' . base64_encode($consumerKey . ':' . $consumerSecret),
                    'Content-Type: application/json',
                ],
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
            ]);

            $response = curl_exec($curl);
            $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $error = curl_error($curl);
            
            curl_close($curl);
            
            if ($response === false || !empty($error)) {
                throw new \Exception("Connection failed: {$error}");
            }
            
            if ($httpCode !== 200) {
                throw new \Exception("HTTP Error {$httpCode}. Please check your credentials and URL.");
            }
            
            $data = json_decode($response, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                throw new \Exception("Invalid response from WooCommerce API");
            }

            return response()->json([
                'success' => true,
                'message' => 'Successfully connected to WooCommerce'
            ]);

        } catch (\Exception $e) {
            Log::error('WooCommerce connection test failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to connect to WooCommerce: ' . $e->getMessage()
            ], 400);
        }
    }

    /**
     * Sync products from WooCommerce
     */
    public function syncProducts(Request $request): JsonResponse
    {
        try {
            $url = $request->input('url');
            $consumerKey = $request->input('consumer_key');
            $consumerSecret = $request->input('consumer_secret');

            $products = $this->fetchWooCommerceData($url, $consumerKey, $consumerSecret, 'products');
            
            $syncedCount = 0;
            $errors = [];

            foreach ($products as $product) {
                try {
                    DB::beginTransaction();

                    // Check if product already exists
                    $existingMaterial = Material::where('woocommerce_id', $product['id'])->first();
                    
                    $materialData = [
                        'name' => $product['name'],
                        'description' => strip_tags($product['description'] ?? ''),
                        'price' => (float) $product['price'],
                        'stock_quantity' => $product['stock_quantity'] ?? 0,
                        'sku' => $product['sku'] ?? null,
                        'woocommerce_id' => $product['id'],
                    ];

                    if ($existingMaterial) {
                        $existingMaterial->update($materialData);
                    } else {
                        Material::create($materialData);
                    }

                    $syncedCount++;
                    DB::commit();

                } catch (\Exception $e) {
                    DB::rollBack();
                    $errors[] = "Product {$product['name']}: " . $e->getMessage();
                    Log::error('Product sync error: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Synced {$syncedCount} products",
                'synced_count' => $syncedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error('Products sync failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync products: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync orders from WooCommerce
     */
    public function syncOrders(Request $request): JsonResponse
    {
        try {
            $url = $request->input('url');
            $consumerKey = $request->input('consumer_key');
            $consumerSecret = $request->input('consumer_secret');

            $orders = $this->fetchWooCommerceData($url, $consumerKey, $consumerSecret, 'orders');
            
            $syncedCount = 0;
            $errors = [];

            foreach ($orders as $order) {
                try {
                    DB::beginTransaction();

                    // Get or create client
                    $clientId = $this->getOrCreateClient($order['billing']);

                    // Check if order already exists
                    $existingOrder = Order::where('woocommerce_id', $order['id'])->first();
                    
                    $orderData = [
                        'title' => "WooCommerce Order #{$order['number']}",
                        'description' => "Imported from WooCommerce - Status: {$order['status']}",
                        'status' => $this->mapWooCommerceStatus($order['status']),
                        'total_cost' => (float) $order['total'],
                        'client_id' => $clientId,
                        'woocommerce_id' => $order['id'],
                        'due_date' => $order['date_created'],
                        'priority' => 'medium',
                    ];

                    if ($existingOrder) {
                        $existingOrder->update($orderData);
                    } else {
                        Order::create($orderData);
                    }

                    $syncedCount++;
                    DB::commit();

                } catch (\Exception $e) {
                    DB::rollBack();
                    $errors[] = "Order #{$order['number']}: " . $e->getMessage();
                    Log::error('Order sync error: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Synced {$syncedCount} orders",
                'synced_count' => $syncedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error('Orders sync failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync customers from WooCommerce
     */
    public function syncCustomers(Request $request): JsonResponse
    {
        try {
            $url = $request->input('url');
            $consumerKey = $request->input('consumer_key');
            $consumerSecret = $request->input('consumer_secret');

            $customers = $this->fetchWooCommerceData($url, $consumerKey, $consumerSecret, 'customers');
            
            $syncedCount = 0;
            $errors = [];

            foreach ($customers as $customer) {
                try {
                    DB::beginTransaction();

                    // Check if customer already exists
                    $existingClient = Client::where('woocommerce_id', $customer['id'])->first();
                    
                    $clientData = [
                        'name' => trim(($customer['first_name'] ?? '') . ' ' . ($customer['last_name'] ?? '')),
                        'email' => $customer['email'] ?? '',
                        'phone' => $customer['billing']['phone'] ?? '',
                        'address' => trim(
                            ($customer['billing']['address_1'] ?? '') . ' ' . 
                            ($customer['billing']['city'] ?? '') . ' ' . 
                            ($customer['billing']['country'] ?? '')
                        ),
                        'woocommerce_id' => $customer['id'],
                    ];

                    if ($existingClient) {
                        $existingClient->update($clientData);
                    } else {
                        Client::create($clientData);
                    }

                    $syncedCount++;
                    DB::commit();

                } catch (\Exception $e) {
                    DB::rollBack();
                    $errors[] = "Customer {$customer['email']}: " . $e->getMessage();
                    Log::error('Customer sync error: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Synced {$syncedCount} customers",
                'synced_count' => $syncedCount,
                'errors' => $errors
            ]);

        } catch (\Exception $e) {
            Log::error('Customers sync failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync customers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync all data from WooCommerce
     */
    public function syncAll(Request $request): JsonResponse
    {
        try {
            $results = [];
            
            // Sync customers first
            $customersResult = $this->syncCustomers($request);
            $results['customers'] = json_decode($customersResult->getContent(), true);
            
            // Then sync products
            $productsResult = $this->syncProducts($request);
            $results['products'] = json_decode($productsResult->getContent(), true);
            
            // Finally sync orders
            $ordersResult = $this->syncOrders($request);
            $results['orders'] = json_decode($ordersResult->getContent(), true);

            $totalSynced = 
                ($results['customers']['synced_count'] ?? 0) +
                ($results['products']['synced_count'] ?? 0) +
                ($results['orders']['synced_count'] ?? 0);

            return response()->json([
                'success' => true,
                'message' => "Successfully synced {$totalSynced} items total",
                'results' => $results
            ]);

        } catch (\Exception $e) {
            Log::error('Full sync failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync all data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch data from WooCommerce API
     */
    private function fetchWooCommerceData(string $url, string $consumerKey, string $consumerSecret, string $endpoint): array
    {
        $apiUrl = rtrim($url, '/') . "/wp-json/wc/v3/{$endpoint}?per_page=100";
        
        // Use cURL for better error handling
        $curl = curl_init();
        
        curl_setopt_array($curl, [
            CURLOPT_URL => $apiUrl,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => [
                'Authorization: Basic ' . base64_encode($consumerKey . ':' . $consumerSecret),
                'Content-Type: application/json',
            ],
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        $error = curl_error($curl);
        
        curl_close($curl);
        
        if ($response === false || !empty($error)) {
            throw new \Exception("cURL Error: {$error}");
        }
        
        if ($httpCode !== 200) {
            throw new \Exception("HTTP Error {$httpCode}: " . substr($response, 0, 200));
        }

        $data = json_decode($response, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception("JSON decode error: " . json_last_error_msg());
        }

        return $data;
    }

    /**
     * Get or create client from WooCommerce billing data
     */
    private function getOrCreateClient(array $billing): int
    {
        $clientName = trim(($billing['first_name'] ?? '') . ' ' . ($billing['last_name'] ?? ''));
        $email = $billing['email'] ?? '';

        // Try to find existing client
        $client = Client::where('email', $email)
            ->orWhere('name', $clientName)
            ->first();

        if ($client) {
            return $client->id;
        }

        // Create new client
        $newClient = Client::create([
            'name' => $clientName ?: 'WooCommerce Customer',
            'email' => $email,
            'phone' => $billing['phone'] ?? '',
            'address' => trim(
                ($billing['address_1'] ?? '') . ' ' . 
                ($billing['city'] ?? '') . ' ' . 
                ($billing['country'] ?? '')
            ),
        ]);

        return $newClient->id;
    }

    /**
     * Map WooCommerce order status to local status
     */
    private function mapWooCommerceStatus(string $status): string
    {
        $statusMap = [
            'pending' => 'pending',
            'processing' => 'in_progress',
            'on-hold' => 'pending',
            'completed' => 'completed',
            'cancelled' => 'cancelled',
            'refunded' => 'cancelled',
            'failed' => 'cancelled',
        ];

        return $statusMap[$status] ?? 'pending';
    }
} 