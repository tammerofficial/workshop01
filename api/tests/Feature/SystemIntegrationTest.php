<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\CustomOrder;
use App\Models\LoyaltyPoint;
use App\Models\PosTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class SystemIntegrationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed basic data
        $this->artisan('db:seed', ['--class' => 'RoleSeeder']);
        $this->artisan('db:seed', ['--class' => 'ProductionStageSeeder']);
        $this->artisan('db:seed', ['--class' => 'LoyaltyTierSeeder']);
    }

    /** @test */
    public function complete_pos_to_loyalty_workflow_works()
    {
        // Create customer
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        // Create product
        $product = Product::factory()->create([
            'price' => 50.000,
            'stock_quantity' => 10
        ]);

        // Create POS transaction
        $response = $this->actingAs($this->createStaffUser())
                        ->postJson('/api/pos/transactions', [
                            'customer_id' => $customer->id,
                            'items' => [
                                [
                                    'product_id' => $product->id,
                                    'quantity' => 2,
                                    'price' => 50.000
                                ]
                            ],
                            'payment_method' => 'cash',
                            'total_amount' => 100.000
                        ]);

        $response->assertStatus(201);
        
        // Verify transaction created
        $this->assertDatabaseHas('pos_transactions', [
            'customer_id' => $customer->id,
            'total_amount' => 100.000,
            'status' => 'completed'
        ]);

        // Verify stock updated
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock_quantity' => 8
        ]);

        // Verify loyalty points earned
        $this->assertDatabaseHas('loyalty_points', [
            'customer_id' => $customer->id,
            'type' => 'earned',
            'source_type' => 'purchase'
        ]);

        // Verify inventory movement
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'out',
            'quantity' => -2
        ]);
    }

    /** @test */
    public function ecommerce_to_workshop_custom_order_workflow_works()
    {
        // Create customer
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        // Create custom order from e-commerce
        $response = $this->actingAs($customer)
                        ->postJson('/api/workshop/custom-orders', [
                            'customer_id' => $customer->id,
                            'product_type' => 'shirt',
                            'measurements' => [
                                'chest' => 42,
                                'waist' => 36,
                                'sleeve_length' => 24
                            ],
                            'design_specifications' => [
                                'collar_type' => 'spread',
                                'cuff_type' => 'button',
                                'fabric_pattern' => 'solid'
                            ],
                            'fabric_type' => 'cotton',
                            'fabric_color' => 'white',
                            'special_instructions' => 'Please add monogram on pocket'
                        ]);

        $response->assertStatus(201);
        
        $orderData = $response->json('data');
        
        // Verify custom order created
        $this->assertDatabaseHas('custom_orders', [
            'customer_id' => $customer->id,
            'product_type' => 'shirt',
            'status' => 'pending_quote'
        ]);

        // Verify production stages created
        $this->assertDatabaseHas('production_progress', [
            'custom_order_id' => $orderData['id'],
            'status' => 'pending'
        ]);
    }

    /** @test */
    public function inventory_sync_across_channels_works()
    {
        $product = Product::factory()->create([
            'stock_quantity' => 20,
            'track_stock' => true
        ]);

        // Simulate POS sale
        $product->updateStock(5, 'out', 'pos_sale', 1, null, 'POS Transaction', 1);
        
        $this->assertEquals(15, $product->fresh()->stock_quantity);

        // Simulate e-commerce order
        $product->updateStock(3, 'out', 'ecommerce_order', 2, null, 'E-commerce Order', 1);
        
        $this->assertEquals(12, $product->fresh()->stock_quantity);

        // Simulate workshop material usage
        $product->updateStock(2, 'out', 'workshop_usage', 1, null, 'Custom Order Material', 1);
        
        $this->assertEquals(10, $product->fresh()->stock_quantity);

        // Verify all movements recorded
        $this->assertDatabaseCount('inventory_movements', 3);
        
        $this->assertDatabaseHas('inventory_movements', [
            'product_id' => $product->id,
            'type' => 'out',
            'reference_type' => 'pos_sale'
        ]);
    }

    /** @test */
    public function loyalty_tier_upgrade_works()
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        // Simulate spending to reach next tier
        $this->actingAs($this->createStaffUser())
             ->postJson('/api/loyalty/advanced/earn-points', [
                 'customer_id' => $customer->id,
                 'points' => 1000,
                 'source_type' => 'purchase',
                 'description' => 'Large purchase'
             ]);

        // Check tier assignment
        $response = $this->getJson("/api/loyalty/advanced/customer/{$customer->id}/profile");
        
        $response->assertStatus(200);
        $profile = $response->json('data');
        
        $this->assertNotNull($profile['current_tier']);
        $this->assertEquals(1000, $profile['loyalty_stats']['total_points']);
    }

    /** @test */
    public function analytics_data_accuracy_test()
    {
        // Create test data
        $customer = User::factory()->create();
        $customer->assignRole('customer');
        
        $product = Product::factory()->create(['price' => 100.000]);

        // Create transactions
        PosTransaction::factory()->create([
            'customer_id' => $customer->id,
            'total_amount' => 100.000,
            'status' => 'completed'
        ]);

        // Test analytics endpoints
        $salesResponse = $this->actingAs($this->createStaffUser())
                              ->getJson('/api/reports/sales-overview?period=month');
        
        $salesResponse->assertStatus(200);
        $salesData = $salesResponse->json('data.summary');
        
        $this->assertGreaterThan(0, $salesData['total_revenue']);
        $this->assertGreaterThan(0, $salesData['total_transactions']);

        // Test product analytics
        $productResponse = $this->getJson('/api/reports/product-analytics?period=month');
        $productResponse->assertStatus(200);

        // Test customer analytics
        $customerResponse = $this->getJson('/api/reports/customer-analytics?period=month');
        $customerResponse->assertStatus(200);
    }

    /** @test */
    public function digital_loyalty_card_generation_works()
    {
        $customer = User::factory()->create();
        $customer->assignRole('customer');

        $response = $this->actingAs($this->createStaffUser())
                        ->postJson('/api/loyalty/advanced/generate-digital-card', [
                            'customer_id' => $customer->id,
                            'card_type' => 'apple_wallet'
                        ]);

        $response->assertStatus(201);
        
        $this->assertDatabaseHas('digital_loyalty_cards', [
            'customer_id' => $customer->id,
            'card_type' => 'apple_wallet',
            'is_active' => true
        ]);
    }

    /** @test */
    public function stock_alerts_trigger_correctly()
    {
        $product = Product::factory()->create([
            'stock_quantity' => 10,
            'min_stock_level' => 5,
            'track_stock' => true
        ]);

        // Reduce stock to trigger low stock alert
        $product->updateStock(6, 'out', 'test_sale', null, null, 'Test reduction', 1);

        $this->assertDatabaseHas('stock_alerts', [
            'product_id' => $product->id,
            'alert_type' => 'low_stock',
            'is_resolved' => false
        ]);

        // Reduce to zero to trigger out of stock
        $product->updateStock(4, 'out', 'test_sale', null, null, 'Test reduction', 1);

        $this->assertDatabaseHas('stock_alerts', [
            'product_id' => $product->id,
            'alert_type' => 'out_of_stock',
            'is_resolved' => false
        ]);
    }

    /** @test */
    public function production_workflow_progression_works()
    {
        $customer = User::factory()->create();
        $worker = User::factory()->create();
        $worker->assignRole('worker');
        
        $customOrder = CustomOrder::factory()->create([
            'customer_id' => $customer->id,
            'status' => 'confirmed'
        ]);

        // Get first production stage
        $firstStage = $customOrder->productionProgress()->first();

        // Start production
        $response = $this->actingAs($worker)
                        ->postJson("/api/workshop/custom-orders/{$customOrder->id}/production-stage", [
                            'stage_id' => $firstStage->production_stage_id,
                            'status' => 'in_progress',
                            'notes' => 'Started cutting'
                        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('production_progress', [
            'custom_order_id' => $customOrder->id,
            'production_stage_id' => $firstStage->production_stage_id,
            'status' => 'in_progress'
        ]);

        // Complete stage
        $this->actingAs($worker)
             ->postJson("/api/workshop/custom-orders/{$customOrder->id}/production-stage", [
                 'stage_id' => $firstStage->production_stage_id,
                 'status' => 'completed',
                 'notes' => 'Cutting completed'
             ]);

        $this->assertDatabaseHas('production_progress', [
            'custom_order_id' => $customOrder->id,
            'production_stage_id' => $firstStage->production_stage_id,
            'status' => 'completed'
        ]);
    }

    /** @test */
    public function permission_system_enforces_access_control()
    {
        $unauthorizedUser = User::factory()->create();
        $authorizedUser = $this->createStaffUser();

        // Test unauthorized access
        $response = $this->actingAs($unauthorizedUser)
                        ->getJson('/api/inventory/dashboard');
        
        $response->assertStatus(403);

        // Test authorized access
        $response = $this->actingAs($authorizedUser)
                        ->getJson('/api/inventory/dashboard');
        
        $response->assertStatus(200);
    }

    private function createStaffUser()
    {
        $user = User::factory()->create();
        $user->assignRole('admin');
        return $user;
    }
}