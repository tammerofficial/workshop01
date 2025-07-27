<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Worker;

class WorkersWithSpecialtiesSeeder extends Seeder
{
    public function run(): void
    {
        $workers = [
            // مصممين
            [
                'name' => 'Sarah Al-Mansouri',
                'email' => 'sarah.designer@workshop.com',
                'phone' => '+965-9991-0001',
                'role' => 'Senior Designer',
                'department' => 'Design',
                'specialty' => 'design',
                'production_stages' => ['design'],
                'salary' => 800.00,
                'hourly_rate' => 12.00,
                'hire_date' => '2023-01-15',
                'is_active' => true,
                'skills' => ['fashion_design', 'pattern_making', 'sketching', 'adobe_illustrator'],
                'notes' => 'خبيرة في التصميم الراقي والأزياء التقليدية'
            ],
            [
                'name' => 'Khalid Al-Rashid',
                'email' => 'khalid.designer@workshop.com',
                'phone' => '+965-9991-0002',
                'role' => 'Junior Designer',
                'department' => 'Design',
                'specialty' => 'design',
                'production_stages' => ['design'],
                'salary' => 600.00,
                'hourly_rate' => 10.00,
                'hire_date' => '2023-06-01',
                'is_active' => true,
                'skills' => ['pattern_making', 'sketching', 'cad_design'],
                'notes' => 'متخصص في تصميم البدل الرجالية'
            ],

            // قصاصين
            [
                'name' => 'Ahmed Al-Kuwaiti',
                'email' => 'ahmed.cutter@workshop.com',
                'phone' => '+965-9991-0003',
                'role' => 'Master Cutter',
                'department' => 'Production',
                'specialty' => 'cutting',
                'production_stages' => ['cutting'],
                'salary' => 700.00,
                'hourly_rate' => 11.00,
                'hire_date' => '2022-03-10',
                'is_active' => true,
                'skills' => ['precision_cutting', 'fabric_handling', 'pattern_layout'],
                'notes' => 'خبير في قص الأقمشة الحساسة والثمينة'
            ],
            [
                'name' => 'Omar Al-Sabah',
                'email' => 'omar.cutter@workshop.com',
                'phone' => '+965-9991-0004',
                'role' => 'Fabric Cutter',
                'department' => 'Production',
                'specialty' => 'cutting',
                'production_stages' => ['cutting'],
                'salary' => 550.00,
                'hourly_rate' => 9.00,
                'hire_date' => '2023-02-20',
                'is_active' => true,
                'skills' => ['cutting', 'measuring', 'quality_control'],
                'notes' => 'متخصص في القص السريع والدقيق'
            ],

            // خياطين
            [
                'name' => 'Fatima Al-Zahra',
                'email' => 'fatima.seamstress@workshop.com',
                'phone' => '+965-9991-0005',
                'role' => 'Master Seamstress',
                'department' => 'Production',
                'specialty' => 'sewing',
                'production_stages' => ['sewing', 'finishing'],
                'salary' => 900.00,
                'hourly_rate' => 14.00,
                'hire_date' => '2021-05-01',
                'is_active' => true,
                'skills' => ['hand_sewing', 'machine_sewing', 'embroidery', 'beadwork'],
                'notes' => 'خبيرة في التطريز اليدوي والخياطة الراقية'
            ],
            [
                'name' => 'Youssef Al-Tamimi',
                'email' => 'youssef.tailor@workshop.com',
                'phone' => '+965-9991-0006',
                'role' => 'Senior Tailor',
                'department' => 'Production',
                'specialty' => 'sewing',
                'production_stages' => ['sewing'],
                'salary' => 750.00,
                'hourly_rate' => 12.00,
                'hire_date' => '2022-01-15',
                'is_active' => true,
                'skills' => ['tailoring', 'alterations', 'machine_operation'],
                'notes' => 'متخصص في خياطة البدل والملابس الرجالية'
            ],
            [
                'name' => 'Maryam Al-Mutairi',
                'email' => 'maryam.seamstress@workshop.com',
                'phone' => '+965-9991-0007',
                'role' => 'Seamstress',
                'department' => 'Production',
                'specialty' => 'sewing',
                'production_stages' => ['sewing'],
                'salary' => 650.00,
                'hourly_rate' => 10.00,
                'hire_date' => '2023-03-01',
                'is_active' => true,
                'skills' => ['sewing', 'pattern_following', 'detail_work'],
                'notes' => 'خياطة ماهرة في التفاصيل الدقيقة'
            ],

            // متخصصي التجربة والقياس
            [
                'name' => 'Layla Al-Ahmad',
                'email' => 'layla.fitting@workshop.com',
                'phone' => '+965-9991-0008',
                'role' => 'Fitting Specialist',
                'department' => 'Customer Service',
                'specialty' => 'fitting',
                'production_stages' => ['fitting'],
                'salary' => 600.00,
                'hourly_rate' => 10.00,
                'hire_date' => '2023-04-15',
                'is_active' => true,
                'skills' => ['measuring', 'fitting', 'customer_service', 'alterations'],
                'notes' => 'خبيرة في أخذ المقاسات والتجربة'
            ],
            [
                'name' => 'Nasser Al-Dosari',
                'email' => 'nasser.fitting@workshop.com',
                'phone' => '+965-9991-0009',
                'role' => 'Men\'s Fitting Expert',
                'department' => 'Customer Service',
                'specialty' => 'fitting',
                'production_stages' => ['fitting'],
                'salary' => 650.00,
                'hourly_rate' => 11.00,
                'hire_date' => '2022-09-01',
                'is_active' => true,
                'skills' => ['men_fitting', 'alterations', 'precision_measuring'],
                'notes' => 'متخصص في تجربة الملابس الرجالية'
            ],

            // متخصصي التشطيب
            [
                'name' => 'Aisha Al-Kandari',
                'email' => 'aisha.finishing@workshop.com',
                'phone' => '+965-9991-0010',
                'role' => 'Finishing Specialist',
                'department' => 'Production',
                'specialty' => 'finishing',
                'production_stages' => ['finishing'],
                'salary' => 700.00,
                'hourly_rate' => 11.00,
                'hire_date' => '2022-11-01',
                'is_active' => true,
                'skills' => ['pressing', 'ironing', 'final_touches', 'packaging'],
                'notes' => 'خبيرة في التشطيب النهائي والكي المحترف'
            ],
            [
                'name' => 'Hamad Al-Shammari',
                'email' => 'hamad.finishing@workshop.com',
                'phone' => '+965-9991-0011',
                'role' => 'Pressing Expert',
                'department' => 'Production',
                'specialty' => 'finishing',
                'production_stages' => ['finishing'],
                'salary' => 550.00,
                'hourly_rate' => 9.00,
                'hire_date' => '2023-07-01',
                'is_active' => true,
                'skills' => ['steam_pressing', 'garment_care', 'detail_finishing'],
                'notes' => 'متخصص في الكي والتشطيب النهائي'
            ],

            // مراقبي الجودة
            [
                'name' => 'Dr. Noura Al-Saleh',
                'email' => 'noura.quality@workshop.com',
                'phone' => '+965-9991-0012',
                'role' => 'Quality Control Manager',
                'department' => 'Quality Assurance',
                'specialty' => 'quality_check',
                'production_stages' => ['quality_check'],
                'salary' => 1000.00,
                'hourly_rate' => 15.00,
                'hire_date' => '2021-01-01',
                'is_active' => true,
                'skills' => ['quality_inspection', 'standards_compliance', 'defect_detection'],
                'notes' => 'خبيرة في مراقبة الجودة ومعايير الإنتاج'
            ],

            // عمال متعددي المهارات
            [
                'name' => 'Ali Al-Mutawa',
                'email' => 'ali.multicraft@workshop.com',
                'phone' => '+965-9991-0013',
                'role' => 'Multi-skill Craftsman',
                'department' => 'Production',
                'specialty' => 'sewing',
                'production_stages' => ['cutting', 'sewing', 'finishing'],
                'salary' => 800.00,
                'hourly_rate' => 13.00,
                'hire_date' => '2021-08-15',
                'is_active' => true,
                'skills' => ['cutting', 'sewing', 'finishing', 'problem_solving'],
                'notes' => 'عامل متعدد المهارات يمكنه العمل في مراحل مختلفة'
            ],
            [
                'name' => 'Hind Al-Qadri',
                'email' => 'hind.specialist@workshop.com',
                'phone' => '+965-9991-0014',
                'role' => 'Production Specialist',
                'department' => 'Production',
                'specialty' => 'finishing',
                'production_stages' => ['sewing', 'fitting', 'finishing'],
                'salary' => 750.00,
                'hourly_rate' => 12.00,
                'hire_date' => '2022-02-01',
                'is_active' => true,
                'skills' => ['sewing', 'fitting_assistance', 'finishing', 'customer_service'],
                'notes' => 'متخصصة في مراحل متعددة من الإنتاج'
            ],

            // مساعدين ومتدربين
            [
                'name' => 'Bader Al-Enezi',
                'email' => 'bader.assistant@workshop.com',
                'phone' => '+965-9991-0015',
                'role' => 'Production Assistant',
                'department' => 'Production',
                'specialty' => 'cutting',
                'production_stages' => ['cutting'],
                'salary' => 450.00,
                'hourly_rate' => 7.00,
                'hire_date' => '2024-01-01',
                'is_active' => true,
                'skills' => ['basic_cutting', 'material_handling', 'organization'],
                'notes' => 'مساعد في قسم القص - تحت التدريب'
            ],
            [
                'name' => 'Reem Al-Hajri',
                'email' => 'reem.trainee@workshop.com',
                'phone' => '+965-9991-0016',
                'role' => 'Sewing Trainee',
                'department' => 'Production',
                'specialty' => 'sewing',
                'production_stages' => ['sewing'],
                'salary' => 400.00,
                'hourly_rate' => 6.50,
                'hire_date' => '2024-02-01',
                'is_active' => true,
                'skills' => ['basic_sewing', 'learning_techniques'],
                'notes' => 'متدربة في الخياطة - مستوى مبتدئ'
            ]
        ];

        foreach ($workers as $workerData) {
            Worker::create($workerData);
        }
    }
}
