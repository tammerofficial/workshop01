<?php

namespace App\Services;

use GuzzleHttp\Client as HttpClient;
use App\Models\Client;
use App\Models\Order;
use App\Models\Material;
use Illuminate\Support\Facades\Log;

class WooCommerceService
{
    private $client;
    private $baseUrl = 'https://hudaaljarallah.net';
    private $consumerKey = 'ck_3a5c739c20336c33cbee2453cccf56a6441ef6fe';
    private $consumerSecret = 'cs_b091ba4fb33a6e4b10612c536db882fe0fa8c6aa';

    public function __construct()
    {
        $this->client = new HttpClient([
            'base_uri' => $this->baseUrl,
            'timeout' => 30,
            'verify' => false, // للاختبار فقط، يُفضل تعطيل هذا في الإنتاج
        ]);
    }

    public function getOrders($page = 1, $perPage = 50)
    {
        try {
            $response = $this->client->get('/wp-json/wc/v3/orders', [
                'auth' => [$this->consumerKey, $this->consumerSecret],
                'query' => [
                    'page' => $page,
                    'per_page' => $perPage,
                    'status' => 'any'
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('WooCommerce API Error: ' . $e->getMessage());
            return [];
        }
    }

    public function getCustomers($page = 1, $perPage = 50)
    {
        try {
            $response = $this->client->get('/wp-json/wc/v3/customers', [
                'auth' => [$this->consumerKey, $this->consumerSecret],
                'query' => [
                    'page' => $page,
                    'per_page' => $perPage
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('WooCommerce API Error: ' . $e->getMessage());
            return [];
        }
    }

    public function getProducts($page = 1, $perPage = 50)
    {
        try {
            $response = $this->client->get('/wp-json/wc/v3/products', [
                'auth' => [$this->consumerKey, $this->consumerSecret],
                'query' => [
                    'page' => $page,
                    'per_page' => $perPage
                ]
            ]);

            return json_decode($response->getBody(), true);
        } catch (\Exception $e) {
            Log::error('WooCommerce API Error: ' . $e->getMessage());
            return [];
        }
    }

    public function importCustomers()
    {
        $page = 1;
        $imported = 0;

        do {
            $customers = $this->getCustomers($page);
            
            foreach ($customers as $customer) {
                $existingClient = Client::where('email', $customer['email'])->first();
                
                if (!$existingClient) {
                    Client::create([
                        'name' => $customer['first_name'] . ' ' . $customer['last_name'],
                        'email' => $customer['email'],
                        'phone' => $customer['billing']['phone'] ?? null,
                        'address' => $this->formatAddress($customer['billing']),
                        'notes' => 'Imported from WooCommerce - Customer ID: ' . $customer['id'],
                    ]);
                    $imported++;
                }
            }
            
            $page++;
        } while (count($customers) >= 50);

        return $imported;
    }

    public function importOrders()
    {
        $page = 1;
        $imported = 0;

        do {
            $orders = $this->getOrders($page);
            
            foreach ($orders as $order) {
                $existingOrder = Order::where('title', 'WooCommerce Order #' . $order['id'])->first();
                
                if (!$existingOrder) {
                    // Find or create client
                    $client = Client::where('email', $order['billing']['email'])->first();
                    
                    if (!$client) {
                        $client = Client::create([
                            'name' => $order['billing']['first_name'] . ' ' . $order['billing']['last_name'],
                            'email' => $order['billing']['email'],
                            'phone' => $order['billing']['phone'] ?? null,
                            'address' => $this->formatAddress($order['billing']),
                            'notes' => 'Auto-created from WooCommerce order',
                        ]);
                    }

                    Order::create([
                        'client_id' => $client->id,
                        'title' => 'WooCommerce Order #' . $order['id'],
                        'description' => $this->formatOrderDescription($order),
                        'status' => $this->mapOrderStatus($order['status']),
                        'priority' => $this->determineOrderPriority($order),
                        'start_date' => $order['date_created'],
                        'due_date' => $this->calculateDueDate($order['date_created']),
                        'total_cost' => $order['total'],
                        'specifications' => [
                            'woocommerce_id' => $order['id'],
                            'order_key' => $order['order_key'],
                            'payment_method' => $order['payment_method'],
                            'line_items' => $order['line_items']
                        ],
                        'notes' => 'Imported from WooCommerce on ' . now(),
                    ]);
                    $imported++;
                }
            }
            
            $page++;
        } while (count($orders) >= 50);

        return $imported;
    }

    public function importProducts()
    {
        $page = 1;
        $imported = 0;

        do {
            $products = $this->getProducts($page);
            
            foreach ($products as $product) {
                $existingMaterial = Material::where('sku', 'WC-' . $product['id'])->first();
                
                if (!$existingMaterial) {
                    Material::create([
                        'name' => $product['name'],
                        'description' => strip_tags($product['description'] ?? $product['short_description'] ?? ''),
                        'sku' => 'WC-' . $product['id'],
                        'quantity' => $product['stock_quantity'] ?? 0,
                        'unit' => 'piece',
                        'cost_per_unit' => $product['price'] ?? 0,
                        'supplier' => 'WooCommerce Import',
                        'reorder_level' => 5,
                        'location' => 'Online Store',
                        'image_url' => $product['images'][0]['src'] ?? null,
                        'is_active' => $product['status'] === 'publish',
                    ]);
                    $imported++;
                }
            }
            
            $page++;
        } while (count($products) >= 50);

        return $imported;
    }

    private function formatAddress($billing)
    {
        $address = [];
        if (!empty($billing['address_1'])) $address[] = $billing['address_1'];
        if (!empty($billing['address_2'])) $address[] = $billing['address_2'];
        if (!empty($billing['city'])) $address[] = $billing['city'];
        if (!empty($billing['state'])) $address[] = $billing['state'];
        if (!empty($billing['country'])) $address[] = $billing['country'];
        
        return implode(', ', $address);
    }

    private function formatOrderDescription($order)
    {
        $items = [];
        foreach ($order['line_items'] as $item) {
            $items[] = $item['name'] . ' (x' . $item['quantity'] . ')';
        }
        
        return 'Items: ' . implode(', ', $items);
    }

    private function mapOrderStatus($wcStatus)
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

        return $statusMap[$wcStatus] ?? 'pending';
    }

    private function determineOrderPriority($order)
    {
        $total = floatval($order['total']);
        
        if ($total > 500) return 'high';
        if ($total > 200) return 'medium';
        return 'low';
    }

    private function calculateDueDate($createdDate)
    {
        return date('Y-m-d', strtotime($createdDate . ' +14 days'));
    }
} 