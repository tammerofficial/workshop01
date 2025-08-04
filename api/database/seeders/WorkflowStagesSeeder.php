<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\WorkflowStage;

class WorkflowStagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 🔪 مرحلة القص
        WorkflowStage::create([
            'name' => 'cutting',
            'display_name' => 'القص',
            'description' => 'قص القماش والمواد حسب الباترون المطلوب',
            'stage_order' => 1,
            'estimated_hours' => 2.00,
            'max_hours' => 4.00,
            'required_role' => 'Worker',
            'min_workers' => 1,
            'max_workers' => 2,
            'priority_score' => 90,
            'requires_quality_check' => true,
            'auto_start' => true,
            'send_notifications' => true,
            'notification_delay_minutes' => 0,
            'required_tools' => ['مقص', 'مسطرة', 'طاولة قص'],
            'work_station' => 'محطة القص الرئيسية',
            'quality_criteria' => [
                'دقة القص',
                'عدم وجود عيوب في القماش',
                'مطابقة المقاسات للباترون'
            ],
            'completion_conditions' => [
                'فحص جودة القص',
                'تأكيد مطابقة المقاسات'
            ]
        ]);

        // ✂️ مرحلة الخياطة
        WorkflowStage::create([
            'name' => 'sewing',
            'display_name' => 'الخياطة',
            'description' => 'خياطة وتجميع القطع المقصوصة',
            'stage_order' => 2,
            'estimated_hours' => 4.00,
            'max_hours' => 8.00,
            'required_role' => 'Worker',
            'min_workers' => 1,
            'max_workers' => 3,
            'priority_score' => 85,
            'requires_quality_check' => true,
            'auto_start' => true,
            'send_notifications' => true,
            'notification_delay_minutes' => 15,
            'required_tools' => ['ماكينة خياطة', 'خيوط', 'إبر', 'مقص صغير'],
            'work_station' => 'محطة الخياطة',
            'quality_criteria' => [
                'استقامة الخياطة',
                'قوة التماسك',
                'عدم وجود خيوط زائدة'
            ]
        ]);

        // 🎨 مرحلة التطريز والشك
        WorkflowStage::create([
            'name' => 'embroidery',
            'display_name' => 'التطريز والشك',
            'description' => 'إضافة التطريز والزخارف المطلوبة',
            'stage_order' => 3,
            'estimated_hours' => 3.00,
            'max_hours' => 6.00,
            'required_role' => 'Worker',
            'min_workers' => 1,
            'max_workers' => 2,
            'priority_score' => 80,
            'requires_quality_check' => true,
            'auto_start' => true,
            'send_notifications' => true,
            'notification_delay_minutes' => 30,
            'required_tools' => ['ماكينة تطريز', 'خيوط ملونة', 'إطار تطريز'],
            'work_station' => 'محطة التطريز',
            'quality_criteria' => [
                'جودة التطريز',
                'دقة التصميم',
                'ثبات الألوان'
            ]
        ]);

        // 🔍 مرحلة مراقبة الجودة
        WorkflowStage::create([
            'name' => 'quality_control',
            'display_name' => 'مراقبة الجودة',
            'description' => 'فحص شامل للمنتج النهائي',
            'stage_order' => 4,
            'estimated_hours' => 1.00,
            'max_hours' => 2.00,
            'required_role' => 'Worker',
            'min_workers' => 1,
            'max_workers' => 1,
            'priority_score' => 95,
            'requires_quality_check' => true,
            'requires_approval' => true,
            'auto_start' => true,
            'send_notifications' => true,
            'notification_delay_minutes' => 0,
            'required_tools' => ['مقياس', 'عدسة مكبرة', 'قائمة فحص'],
            'work_station' => 'محطة مراقبة الجودة',
            'quality_criteria' => [
                'مطابقة المواصفات',
                'عدم وجود عيوب',
                'جودة اللمسة النهائية',
                'مطابقة المقاسات',
                'قوة التحمل'
            ],
            'completion_conditions' => [
                'اجتياز جميع معايير الجودة',
                'موافقة مراقب الجودة'
            ]
        ]);

        // 📦 مرحلة التعبئة والتغليف
        WorkflowStage::create([
            'name' => 'packaging',
            'display_name' => 'التعبئة والتغليف',
            'description' => 'تعبئة المنتج وتحضيره للتسليم',
            'stage_order' => 5,
            'estimated_hours' => 0.50,
            'max_hours' => 1.00,
            'required_role' => 'Worker',
            'min_workers' => 1,
            'max_workers' => 2,
            'priority_score' => 70,
            'requires_quality_check' => false,
            'auto_start' => true,
            'auto_complete' => false,
            'send_notifications' => true,
            'notification_delay_minutes' => 0,
            'required_tools' => ['أكياس تغليف', 'علب', 'ملصقات'],
            'work_station' => 'محطة التعبئة',
            'quality_criteria' => [
                'سلامة التغليف',
                'وضوح البيانات',
                'حماية المنتج'
            ]
        ]);

        // 🚚 مرحلة التسليم
        WorkflowStage::create([
            'name' => 'delivery',
            'display_name' => 'التسليم',
            'description' => 'تحضير الطلبية للشحن أو التسليم للعميل',
            'stage_order' => 6,
            'estimated_hours' => 0.25,
            'max_hours' => 0.50,
            'required_role' => 'Worker',
            'min_workers' => 1,
            'max_workers' => 1,
            'priority_score' => 60,
            'requires_quality_check' => false,
            'requires_approval' => true,
            'auto_start' => true,
            'send_notifications' => true,
            'notification_delay_minutes' => 0,
            'required_tools' => ['نظام الشحن', 'طابعة ملصقات'],
            'work_station' => 'محطة التسليم',
            'completion_conditions' => [
                'تأكيد بيانات العميل',
                'طباعة فاتورة التسليم',
                'تحديث حالة الطلبية'
            ]
        ]);

        $this->command->info('✅ تم إنشاء 6 مراحل أساسية للتصنيع');
    }
}