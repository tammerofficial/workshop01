<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class KuwaitiTailoringFinancialsSeeder extends Seeder
{
    /**
     * Run the database seeds for financial and analytics data
     */
    public function run(): void
    {
        $this->seedSalesRecords();
        $this->seedExpenses();
        $this->seedWorkshopAnalytics();
        $this->seedAttendanceRecords();
        $this->seedQualityControlData();
    }

    /**
     * Seed sales records
     */
    private function seedSalesRecords(): void
    {
        $salesData = [
            ['date' => '2024-01-15', 'amount' => 1250.000, 'items' => 3, 'customer' => 'فاطمة الرشيد', 'payment_method' => 'كاش'],
            ['date' => '2024-01-18', 'amount' => 850.000, 'items' => 2, 'customer' => 'نورا العنزي', 'payment_method' => 'كنت'],
            ['date' => '2024-01-22', 'amount' => 450.000, 'items' => 5, 'customer' => 'مريم الصباح', 'payment_method' => 'كاش'],
            ['date' => '2024-01-25', 'amount' => 320.000, 'items' => 2, 'customer' => 'عائشة المطيري', 'payment_method' => 'تحويل'],
            ['date' => '2024-01-28', 'amount' => 675.000, 'items' => 4, 'customer' => 'هدى الخالد', 'payment_method' => 'كاش'],
            ['date' => '2024-02-02', 'amount' => 1450.000, 'items' => 2, 'customer' => 'ليلى الدوسري', 'payment_method' => 'كنت'],
            ['date' => '2024-02-05', 'amount' => 280.000, 'items' => 3, 'customer' => 'زينب العجمي', 'payment_method' => 'كاش'],
            ['date' => '2024-02-08', 'amount' => 920.000, 'items' => 1, 'customer' => 'رقية السعد', 'payment_method' => 'تحويل'],
            ['date' => '2024-02-12', 'amount' => 380.000, 'items' => 4, 'customer' => 'فاطمة الرشيد', 'payment_method' => 'كاش'],
            ['date' => '2024-02-15', 'amount' => 750.000, 'items' => 2, 'customer' => 'نورا العنزي', 'payment_method' => 'كنت']
        ];

        foreach ($salesData as $sale) {
            DB::table('sales')->insert([
                'sale_date' => $sale['date'],
                'total_amount' => $sale['amount'],
                'items_count' => $sale['items'],
                'customer_name' => $sale['customer'],
                'payment_method' => $sale['payment_method'],
                'currency' => 'KWD',
                'tax_amount' => 0, // Kuwait typically doesn't have sales tax
                'discount_amount' => rand(0, 50),
                'net_amount' => $sale['amount'] - rand(0, 50),
                'sales_person' => 'نادية المبيعات',
                'notes' => 'بيع منتجات تفصيل نسائية',
                'created_at' => Carbon::parse($sale['date']),
                'updated_at' => Carbon::parse($sale['date'])
            ]);
        }
    }

    /**
     * Seed expense records
     */
    private function seedExpenses(): void
    {
        $expenseData = [
            ['date' => '2024-01-01', 'category' => 'خامات', 'amount' => 450.000, 'description' => 'شراء أقمشة وخيوط'],
            ['date' => '2024-01-01', 'category' => 'رواتب', 'amount' => 1200.000, 'description' => 'رواتب العاملات شهر يناير'],
            ['date' => '2024-01-05', 'category' => 'أدوات', 'amount' => 150.000, 'description' => 'مقصات ومساطر جديدة'],
            ['date' => '2024-01-10', 'category' => 'كهرباء', 'amount' => 85.000, 'description' => 'فاتورة الكهرباء'],
            ['date' => '2024-01-15', 'category' => 'صيانة', 'amount' => 120.000, 'description' => 'صيانة ماكينات الخياطة'],
            ['date' => '2024-02-01', 'category' => 'رواتب', 'amount' => 1250.000, 'description' => 'رواتب العاملات شهر فبراير'],
            ['date' => '2024-02-03', 'category' => 'تسويق', 'amount' => 200.000, 'description' => 'إعلانات وسائل التواصل'],
            ['date' => '2024-02-08', 'category' => 'خامات', 'amount' => 380.000, 'description' => 'شراء خرز وإكسسوارات'],
            ['date' => '2024-02-12', 'category' => 'إيجار', 'amount' => 500.000, 'description' => 'إيجار الورشة شهر فبراير'],
            ['date' => '2024-02-15', 'category' => 'تدريب', 'amount' => 300.000, 'description' => 'دورة تدريبية تطريز متقدم']
        ];

        foreach ($expenseData as $expense) {
            DB::table('expenses')->insert([
                'expense_date' => $expense['date'],
                'category' => $expense['category'],
                'amount' => $expense['amount'],
                'description' => $expense['description'],
                'currency' => 'KWD',
                'payment_method' => collect(['كاش', 'تحويل بنكي', 'شيك'])->random(),
                'vendor' => $this->getRandomVendor($expense['category']),
                'approved_by' => 'مديرة الورشة',
                'receipt_number' => 'RCP-' . str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT),
                'created_at' => Carbon::parse($expense['date']),
                'updated_at' => Carbon::parse($expense['date'])
            ]);
        }
    }

    /**
     * Seed workshop analytics data
     */
    private function seedWorkshopAnalytics(): void
    {
        // Daily production metrics for last 30 days
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            
            DB::table('daily_analytics')->insert([
                'date' => $date->toDateString(),
                'orders_received' => rand(1, 5),
                'orders_completed' => rand(0, 3),
                'revenue' => rand(200, 1500) + (rand(0, 999) / 1000),
                'expenses' => rand(100, 500) + (rand(0, 999) / 1000),
                'active_workers' => rand(4, 6),
                'production_hours' => rand(32, 48),
                'efficiency_percentage' => rand(75, 95),
                'quality_score' => rand(85, 98),
                'customer_satisfaction' => rand(88, 100),
                'created_at' => $date,
                'updated_at' => $date
            ]);
        }
    }

    /**
     * Seed attendance records
     */
    private function seedAttendanceRecords(): void
    {
        $workers = ['TW001', 'TW002', 'TW003', 'TW004', 'TW005', 'TW006'];
        
        // Generate attendance for last 30 days
        for ($i = 30; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            
            foreach ($workers as $workerCode) {
                $isWorkDay = $date->dayOfWeek >= 1 && $date->dayOfWeek <= 5; // Monday to Friday
                
                if ($isWorkDay && rand(1, 10) > 1) { // 90% attendance rate
                    $checkIn = $date->copy()->setTime(8, rand(0, 30), 0);
                    $checkOut = $date->copy()->setTime(16 + rand(0, 2), rand(0, 59), 0);
                    
                    DB::table('attendance')->insert([
                        'worker_code' => $workerCode,
                        'date' => $date->toDateString(),
                        'check_in' => $checkIn,
                        'check_out' => $checkOut,
                        'hours_worked' => $checkOut->diffInHours($checkIn),
                        'status' => 'present',
                        'overtime_hours' => max(0, $checkOut->diffInHours($checkIn) - 8),
                        'notes' => rand(1, 10) > 8 ? 'عمل إضافي لإنهاء طلبية عاجلة' : null,
                        'created_at' => $checkIn,
                        'updated_at' => $checkOut
                    ]);
                }
            }
        }
    }

    /**
     * Seed quality control data
     */
    private function seedQualityControlData(): void
    {
        $qualityChecks = [
            ['order' => 'ORD-2024-001', 'inspector' => 'منيرة الفضلي', 'score' => 96, 'notes' => 'جودة عالية، تطريز ممتاز'],
            ['order' => 'ORD-2024-002', 'inspector' => 'خديجة المهنا', 'score' => 98, 'notes' => 'فستان زفاف بمعايير فاخرة'],
            ['order' => 'ORD-2024-003', 'inspector' => 'سارة الكندري', 'score' => 94, 'notes' => 'دراعة تراثية أصيلة'],
            ['order' => 'ORD-2024-004', 'inspector' => 'نادية الرشيد', 'score' => 92, 'notes' => 'طقم فساتين جيد مع ملاحظات بسيطة'],
            ['order' => 'ORD-2024-005', 'inspector' => 'فاطمة العبدالله', 'score' => 95, 'notes' => 'عباية مفتوحة بتصميم أنيق'],
            ['order' => 'ORD-2024-006', 'inspector' => 'أم سارة الحسيني', 'score' => 90, 'notes' => 'جلابية صيفية مريحة']
        ];

        foreach ($qualityChecks as $check) {
            DB::table('quality_control')->insert([
                'order_number' => $check['order'],
                'inspector_name' => $check['inspector'],
                'quality_score' => $check['score'],
                'inspection_date' => Carbon::now()->subDays(rand(1, 15)),
                'passed' => $check['score'] >= 85,
                'defects_found' => $check['score'] < 95 ? rand(1, 3) : 0,
                'notes' => $check['notes'],
                'recommendations' => $check['score'] < 90 ? 'تحسين بعض التفاصيل الصغيرة' : 'مطابق للمعايير',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now()
            ]);
        }
    }

    /**
     * Get random vendor based on category
     */
    private function getRandomVendor(string $category): string
    {
        $vendors = [
            'خامات' => ['شركة الأقمشة الكويتية', 'مؤسسة الحرير الخليجي', 'معرض الأقمشة العصرية'],
            'رواتب' => ['إدارة الموارد البشرية'],
            'أدوات' => ['مكتبة الخياطة المتقدمة', 'محل أدوات التفصيل'],
            'كهرباء' => ['وزارة الكهرباء والماء'],
            'صيانة' => ['مركز صيانة الماكينات', 'خدمات الصيانة السريعة'],
            'تسويق' => ['شركة التسويق الرقمي', 'إعلانات الخليج'],
            'إيجار' => ['شركة العقارات الكويتية'],
            'تدريب' => ['معهد التدريب المهني', 'أكاديمية الخياطة']
        ];

        return $vendors[$category][array_rand($vendors[$category])] ?? 'مورد عام';
    }
}