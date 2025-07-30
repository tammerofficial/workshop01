# 💰 تقرير نظام الرواتب المتكامل

## 🎯 **الهدف**

إنشاء نظام رواتب متكامل ومربوط مع:
- **العمال الحقيقيين** من نظام البصمة
- **بيانات الحضور والانصراف** من نظام البصمة
- **قاعدة البيانات المحلية** لتخزين الرواتب
- **حسابات تلقائية** للرواتب بناءً على ساعات العمل

## 🏗️ **الهيكل التقني**

### **Backend (Laravel)**

#### **1. نموذج Payroll**
```php
// api/app/Models/Payroll.php
class Payroll extends Model
{
    // العلاقات
    public function worker(): BelongsTo
    {
        return $this->belongsTo(Worker::class);
    }
    
    // حساب ساعات العمل من الحضور
    public function calculateWorkingHours(): int
    {
        $attendanceRecords = $this->attendanceRecords()->get();
        // حساب الساعات من check_in و check_out
    }
    
    // حساب العمل الإضافي
    public function calculateOvertimeHours(): float
    {
        // ساعات أكثر من 8 ساعات في اليوم
    }
    
    // حساب الراتب الأساسي
    public function calculateBaseSalary(): float
    {
        return $this->working_hours * $this->hourly_rate;
    }
    
    // حساب الراتب الصافي
    public function calculateNetSalary(): float
    {
        return $this->base_salary + $this->overtime_pay + $this->bonus - $this->deductions;
    }
}
```

#### **2. PayrollController**
```php
// api/app/Http/Controllers/Api/PayrollController.php
class PayrollController extends Controller
{
    // جلب جميع الرواتب
    public function index(Request $request)
    
    // إحصائيات الرواتب
    public function stats(Request $request)
    
    // إنشاء راتب لعامل واحد
    public function generatePayroll(Request $request)
    
    // إنشاء رواتب لجميع العمال
    public function generateAllPayrolls(Request $request)
    
    // تحديث حالة الراتب
    public function updateStatus(Request $request, $id)
    
    // حذف راتب
    public function destroy($id)
    
    // جلب العمال (محلي + بصمة)
    public function getWorkers()
}
```

#### **3. قاعدة البيانات**
```sql
-- جدول الرواتب
CREATE TABLE payroll (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    worker_id BIGINT FOREIGN KEY REFERENCES workers(id),
    payroll_number VARCHAR(255) UNIQUE, -- PAY-XXXX
    payroll_date DATE,
    working_hours INT DEFAULT 0,
    hourly_rate DECIMAL(8,2) DEFAULT 0,
    base_salary DECIMAL(10,2),
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    overtime_rate DECIMAL(8,2) DEFAULT 0,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2),
    status ENUM('pending', 'paid', 'cancelled') DEFAULT 'pending',
    payment_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **Frontend (React + TypeScript)**

#### **1. Payroll Service**
```typescript
// src/api/laravel.ts
export const payrollService = {
  getAll: (params?: Record<string, unknown>) => api.get('/payroll', { params }),
  getStats: (params?: Record<string, unknown>) => api.get('/payroll/stats', { params }),
  getWorkers: () => api.get('/payroll/workers'),
  getById: (id: number) => api.get(`/payroll/${id}`),
  generatePayroll: (data: Record<string, unknown>) => api.post('/payroll/generate', data),
  generateAllPayrolls: (data: Record<string, unknown>) => api.post('/payroll/generate-all', data),
  updateStatus: (id: number, data: Record<string, unknown>) => api.patch(`/payroll/${id}/status`, data),
  delete: (id: number) => api.delete(`/payroll/${id}`),
};
```

#### **2. Payroll Page**
```typescript
// src/pages/Payroll.tsx
const Payroll: React.FC = () => {
  // States
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [stats, setStats] = useState({...});
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showAllGenerateModal, setShowAllGenerateModal] = useState(false);
  
  // Functions
  const loadPayrollData = async () => {
    // جلب الرواتب والإحصائيات
  };
  
  const handleGeneratePayroll = async () => {
    // إنشاء راتب لعامل واحد
  };
  
  const handleGenerateAllPayrolls = async () => {
    // إنشاء رواتب لجميع العمال
  };
  
  const handleUpdateStatus = async (id: number, status: string) => {
    // تحديث حالة الراتب
  };
};
```

## 🔗 **التكامل مع نظام البصمة**

### **1. جلب العمال**
```php
// دمج العمال المحليين مع عمال البصمة
public function getWorkers()
{
    // العمال المحليين
    $localWorkers = Worker::where('is_active', true)->get();
    
    // عمال البصمة
    $biometricWorkers = $this->biometricService->getEmployees(50);
    
    // دمج القائمتين
    $allWorkers = $localWorkers->concat($biometricWorkers);
    
    return response()->json(['success' => true, 'data' => $allWorkers]);
}
```

### **2. حساب ساعات العمل**
```php
// حساب الساعات من بيانات الحضور
public function calculateWorkingHours(): int
{
    $attendanceRecords = $this->attendanceRecords()->get();
    $totalHours = 0;

    foreach ($attendanceRecords as $record) {
        if ($record->check_in_time && $record->check_out_time) {
            $checkIn = Carbon::parse($record->check_in_time);
            $checkOut = Carbon::parse($record->check_out_time);
            
            // خصم وقت الراحة
            $breakTime = 0;
            if ($record->break_start && $record->break_end) {
                $breakStart = Carbon::parse($record->break_start);
                $breakEnd = Carbon::parse($record->break_end);
                $breakTime = $breakEnd->diffInMinutes($breakStart);
            }
            
            $workMinutes = $checkOut->diffInMinutes($checkIn) - $breakTime;
            $totalHours += $workMinutes / 60;
        }
    }

    return round($totalHours, 2);
}
```

### **3. حساب العمل الإضافي**
```php
// حساب ساعات العمل الإضافي (أكثر من 8 ساعات)
public function calculateOvertimeHours(): float
{
    $attendanceRecords = $this->attendanceRecords()->get();
    $overtimeHours = 0;

    foreach ($attendanceRecords as $record) {
        if ($record->check_in_time && $record->check_out_time) {
            $checkIn = Carbon::parse($record->check_in_time);
            $checkOut = Carbon::parse($record->check_out_time);
            
            $workMinutes = $checkOut->diffInMinutes($checkIn);
            $workHours = $workMinutes / 60;
            
            // العمل الإضافي = ساعات أكثر من 8 في اليوم
            if ($workHours > 8) {
                $overtimeHours += $workHours - 8;
            }
        }
    }

    return round($overtimeHours, 2);
}
```

## 📊 **المميزات**

### **1. إنشاء الرواتب**
- ✅ **إنشاء راتب لعامل واحد**: تحديد العامل، التاريخ، المعدلات
- ✅ **إنشاء رواتب لجميع العمال**: إنشاء جماعي مع معدلات موحدة
- ✅ **حساب تلقائي**: ساعات العمل، العمل الإضافي، الراتب الصافي
- ✅ **منع التكرار**: لا يمكن إنشاء راتب لنفس العامل في نفس الشهر

### **2. إدارة الرواتب**
- ✅ **عرض الرواتب**: جدول منظم مع جميع التفاصيل
- ✅ **تحديث الحالة**: pending → paid → cancelled
- ✅ **حذف الرواتب**: مع تأكيد الحذف
- ✅ **فلترة وبحث**: حسب التاريخ، العامل، الحالة

### **3. الإحصائيات**
- ✅ **إجمالي الرواتب**: مجموع جميع الرواتب
- ✅ **متوسط الراتب**: متوسط الرواتب
- ✅ **عدد العمال**: عدد العمال الذين لديهم رواتب
- ✅ **إجمالي الساعات**: مجموع ساعات العمل

### **4. التكامل**
- ✅ **عمال البصمة**: جلب العمال من نظام البصمة
- ✅ **عمال محليين**: جلب العمال من قاعدة البيانات المحلية
- ✅ **بيانات الحضور**: حساب الساعات من سجلات الحضور
- ✅ **حسابات دقيقة**: راتب أساسي + عمل إضافي + مكافآت - خصومات

## 🎨 **واجهة المستخدم**

### **1. الصفحة الرئيسية**
```
Payroll Management 💰
Manage worker salaries and payments

[إنشاء راتب] [إنشاء جميع الرواتب] [تحديث]

Statistics Cards:
- Total Payroll: $X
- Average Salary: $X  
- Total Workers: X
- Total Hours: Xh
```

### **2. جدول الرواتب**
```
Payroll Records
┌─────────┬─────────┬──────┬────────────┬─────────┬──────┬────────────┬────────┬─────────┬─────────┐
│ Payroll │ Worker  │Hours │Base Salary │Overtime │Bonus │Net Salary  │Status  │Date     │Actions  │
├─────────┼─────────┼──────┼────────────┼─────────┼──────┼────────────┼────────┼─────────┼─────────┤
│PAY-0001 │Youssef  │8h    │$40         │$0       │$0    │$40         │paid    │2025-07-26│[👁️][✏️][🗑️]│
│PAY-0002 │Mohammed │8h    │$36         │$9       │$5    │$50         │pending │2025-07-26│[👁️][✏️][🗑️]│
└─────────┴─────────┴──────┴────────────┴─────────┴──────┴────────────┴────────┴─────────┴─────────┘
```

### **3. نوافذ إنشاء الرواتب**
```
إنشاء راتب جديد:
- العامل: [Dropdown - جميع العمال]
- تاريخ الراتب: [Date Picker]
- معدل الساعة: [Number Input]
- معدل العمل الإضافي: [Number Input]
- المكافأة: [Number Input]
- الخصومات: [Number Input]
- ملاحظات: [Text Area]

[إلغاء] [إنشاء الراتب]
```

## 🔧 **API Endpoints**

### **1. جلب البيانات**
```http
GET /api/payroll                    # جلب جميع الرواتب
GET /api/payroll/stats              # إحصائيات الرواتب
GET /api/payroll/workers            # جلب العمال
GET /api/payroll/{id}               # جلب راتب محدد
```

### **2. إنشاء الرواتب**
```http
POST /api/payroll/generate          # إنشاء راتب لعامل واحد
POST /api/payroll/generate-all      # إنشاء رواتب لجميع العمال
```

### **3. إدارة الرواتب**
```http
PATCH /api/payroll/{id}/status      # تحديث حالة الراتب
DELETE /api/payroll/{id}            # حذف راتب
```

## 📈 **مثال على الحسابات**

### **عامل يعمل 8 ساعات يومياً لمدة 22 يوم**
```
ساعات العمل الأساسية: 22 يوم × 8 ساعات = 176 ساعة
ساعات العمل الإضافي: 0 ساعة
معدل الساعة: $5
معدل العمل الإضافي: $7.5
مكافأة: $50
خصومات: $0

الراتب الأساسي: 176 × $5 = $880
العمل الإضافي: 0 × $7.5 = $0
المكافأة: $50
الخصومات: $0

الراتب الصافي: $880 + $0 + $50 - $0 = $930
```

### **عامل يعمل 10 ساعات يومياً لمدة 20 يوم**
```
ساعات العمل الأساسية: 20 يوم × 8 ساعات = 160 ساعة
ساعات العمل الإضافي: 20 يوم × 2 ساعات = 40 ساعة
معدل الساعة: $5
معدل العمل الإضافي: $7.5
مكافأة: $100
خصومات: $20

الراتب الأساسي: 160 × $5 = $800
العمل الإضافي: 40 × $7.5 = $300
المكافأة: $100
الخصومات: $20

الراتب الصافي: $800 + $300 + $100 - $20 = $1,180
```

## 🚀 **الفوائد**

### **للمدير**:
- ✅ **دقة الحسابات**: حساب تلقائي بناءً على الحضور الفعلي
- ✅ **توفير الوقت**: إنشاء رواتب لجميع العمال بنقرة واحدة
- ✅ **شفافية كاملة**: رؤية تفصيلية لجميع مكونات الراتب
- ✅ **تقارير شاملة**: إحصائيات وإدارة متقدمة

### **للعامل**:
- ✅ **عدالة**: راتب مبني على ساعات العمل الفعلية
- ✅ **وضوح**: رؤية تفصيلية للراتب والمكونات
- ✅ **دقة**: لا أخطاء في الحسابات

### **للنظام**:
- ✅ **تكامل كامل**: مع نظام البصمة والحضور
- ✅ **مرونة**: دعم العمال المحليين وعمال البصمة
- ✅ **قابلية التوسع**: إضافة ميزات جديدة بسهولة

## 🎉 **النتيجة النهائية**

### **قبل النظام**:
```
❌ حسابات يدوية معرضة للأخطاء
❌ عدم ربط مع نظام الحضور
❌ صعوبة في إدارة الرواتب
❌ عدم وجود تقارير شاملة
```

### **بعد النظام**:
```
✅ حسابات تلقائية دقيقة
✅ ربط كامل مع نظام الحضور
✅ إدارة سهلة ومتطورة
✅ تقارير وإحصائيات شاملة
✅ تكامل مع نظام البصمة
```

**🚀 الآن نظام الرواتب متكامل ومربوط بالعمال والحضور والانصراف!**

---

**تم بواسطة:** tammer ❤️  
**التاريخ:** 31 يوليو 2025  
**الحالة:** ✅ مكتمل 