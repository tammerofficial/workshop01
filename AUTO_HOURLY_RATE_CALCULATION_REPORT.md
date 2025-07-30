# ⚡ تقرير حساب سعر الساعة التلقائي

## 🎯 **الهدف المُحقق**

تم تطوير **نظام حساب سعر الساعة التلقائي** بحيث يحدد المستخدم **الراتب الشهري وساعات العمل** فقط، والنظام **يحسب سعر الساعة والإضافي تلقائياً**.

## 🔧 **التحديثات المُطبقة**

### **1. Frontend - صفحة تعديل العامل**

#### **حساب تلقائي في الوقت الفعلي**:
```typescript
// دالة حساب سعر الساعة
const calculateHourlyRate = (salary: string, monthlyHours: string) => {
  const salaryNum = parseFloat(salary) || 0;
  const hoursNum = parseFloat(monthlyHours) || 160;
  return hoursNum > 0 ? (salaryNum / hoursNum).toFixed(2) : '0.00';
};

// تحديث تلقائي عند تغيير الراتب أو الساعات
if (name === 'salary' || name === 'standardHoursPerMonth') {
  newData.hourlyRate = calculateHourlyRate(salary, monthlyHours);
  newData.overtimeRate = (parseFloat(newData.hourlyRate) * 1.5).toFixed(2);
}
```

#### **حقول غير قابلة للتعديل**:
```typescript
{/* Hourly Rate (Auto-calculated) */}
<input
  type="number"
  name="hourlyRate"
  readOnly
  className="bg-gray-50 dark:bg-gray-600 cursor-not-allowed"
  value={formData.hourlyRate}
  title="محسوب من: الراتب الشهري ÷ ساعات العمل الشهرية"
/>
<p className="text-xs text-gray-500">
  المعادلة: {formData.salary || '0'}$ ÷ {formData.standardHoursPerMonth || '160'}h = {formData.hourlyRate}$/h
</p>
```

### **2. Backend - حساب تلقائي عند الحفظ**

#### **دالة الحساب التلقائي**:
```php
private function calculateHourlyRates(array &$data): void
{
    // حساب سعر الساعة إذا توفر الراتب والساعات الشهرية
    if (isset($data['salary']) && isset($data['standard_hours_per_month'])) {
        $salary = (float) $data['salary'];
        $monthlyHours = (float) $data['standard_hours_per_month'];
        
        if ($monthlyHours > 0) {
            $data['hourly_rate'] = round($salary / $monthlyHours, 2);
            $data['overtime_rate'] = round($data['hourly_rate'] * 1.5, 2);
        }
    }
    // إذا توفر الراتب فقط، استخدم 160 ساعة كافتراضي
    elseif (isset($data['salary']) && !isset($data['standard_hours_per_month'])) {
        $salary = (float) $data['salary'];
        $defaultMonthlyHours = 160;
        
        $data['hourly_rate'] = round($salary / $defaultMonthlyHours, 2);
        $data['overtime_rate'] = round($data['hourly_rate'] * 1.5, 2);
        $data['standard_hours_per_month'] = $defaultMonthlyHours;
    }
}
```

#### **تطبيق في الـ Controller**:
```php
public function store(Request $request): JsonResponse {
    $data = $request->all();
    $this->calculateHourlyRates($data); // حساب تلقائي
    $worker = Worker::create($data);
    return response()->json($worker, 201);
}

public function update(Request $request, Worker $worker): JsonResponse {
    $data = $request->all();
    $this->calculateHourlyRates($data); // حساب تلقائي
    $worker->update($data);
    return response()->json($worker);
}
```

### **3. الترجمات المُضافة**

#### **الإنجليزية**:
```typescript
'Auto-calculated': 'Auto-calculated',
'Formula': 'Formula',
'Calculated from: Monthly Salary ÷ Monthly Working Hours': 'Calculated from: Monthly Salary ÷ Monthly Working Hours',
'Calculated as: Hourly Rate × 1.5': 'Calculated as: Hourly Rate × 1.5',
```

#### **العربية**:
```typescript
'Auto-calculated': 'محسوب تلقائياً',
'Formula': 'المعادلة',
'Calculated from: Monthly Salary ÷ Monthly Working Hours': 'محسوب من: الراتب الشهري ÷ ساعات العمل الشهرية',
'Calculated as: Hourly Rate × 1.5': 'محسوب كالتالي: سعر الساعة × 1.5',
```

## 📊 **أمثلة تطبيقية**

### **مثال 1: عامل بدوام كامل**
```json
{
  "إدخال المستخدم": {
    "salary": 2000,
    "standard_hours_per_month": 160
  },
  "الحساب التلقائي": {
    "hourly_rate": 12.50,     // 2000 ÷ 160 = 12.5
    "overtime_rate": 18.75    // 12.5 × 1.5 = 18.75
  }
}
```

### **مثال 2: عامل بدوام جزئي**
```json
{
  "إدخال المستخدم": {
    "salary": 1200,
    "standard_hours_per_month": 120
  },
  "الحساب التلقائي": {
    "hourly_rate": 10.00,     // 1200 ÷ 120 = 10
    "overtime_rate": 15.00    // 10 × 1.5 = 15
  }
}
```

### **مثال 3: راتب فقط (بدون تحديد ساعات)**
```json
{
  "إدخال المستخدم": {
    "salary": 1600
  },
  "الحساب التلقائي": {
    "hourly_rate": 10.00,     // 1600 ÷ 160 (افتراضي) = 10
    "overtime_rate": 15.00,   // 10 × 1.5 = 15
    "standard_hours_per_month": 160  // قيمة افتراضية
  }
}
```

## 🎯 **المميزات المُحققة**

### **1. سهولة الاستخدام**
- ✅ **إدخال مبسط**: الراتب الشهري وساعات العمل فقط
- ✅ **حساب فوري**: النتائج تظهر فور التعديل
- ✅ **واجهة بديهية**: معادلات واضحة وقابلة للفهم
- ✅ **منع الأخطاء**: لا يمكن تعديل سعر الساعة يدوياً

### **2. دقة الحسابات**
- ✅ **حسابات تلقائية**: لا أخطاء بشرية
- ✅ **تناسق**: نفس المعادلة في Frontend و Backend
- ✅ **قيم افتراضية**: 160 ساعة شهرياً كافتراضي
- ✅ **تقريب ذكي**: تقريب لـ 2 منازل عشرية

### **3. مرونة النظام**
- ✅ **ساعات مختلفة**: كل عامل له ساعات عمل مختلفة
- ✅ **رواتب متنوعة**: دعم جميع أنواع الرواتب
- ✅ **حساب فوري**: التحديث يحدث في الوقت الفعلي
- ✅ **شفافية**: المعادلات واضحة للمستخدم

## 🚀 **تجربة المستخدم الجديدة**

### **قبل التحديث**:
```
1. إدخال الراتب الشهري: 2000$
2. إدخال سعر الساعة: ؟؟ (حساب يدوي مطلوب)
3. إدخال سعر الإضافي: ؟؟ (حساب يدوي مطلوب)
4. إدخال ساعات العمل: 160
❌ معرضة للأخطاء وتحتاج حسابات يدوية
```

### **بعد التحديث**:
```
1. إدخال الراتب الشهري: 2000$
2. إدخال ساعات العمل الشهرية: 160
✅ سعر الساعة: 12.50$ (محسوب تلقائياً)
✅ سعر الإضافي: 18.75$ (محسوب تلقائياً)
✅ معادلة واضحة: 2000$ ÷ 160h = 12.50$/h
```

## 🧪 **نتائج الاختبار**

### **اختبار 1: راتب 2000$ - 160 ساعة**
```bash
curl -X PUT /api/workers/23 -d '{
  "salary": 2000,
  "standard_hours_per_month": 160
}'

النتيجة:
✅ hourly_rate: 12.50
✅ overtime_rate: 18.75
✅ المعادلة: 2000 ÷ 160 = 12.5
```

### **اختبار 2: راتب 1200$ - 120 ساعة**
```bash
curl -X PUT /api/workers/23 -d '{
  "salary": 1200,
  "standard_hours_per_month": 120
}'

النتيجة:
✅ hourly_rate: 10.00
✅ overtime_rate: 15.00
✅ المعادلة: 1200 ÷ 120 = 10
```

## 📋 **الملفات المُحدثة**

### **Frontend**:
```
src/pages/EditWorker.tsx:
- إضافة دالة calculateHourlyRate()
- تحديث handleInputChange()
- جعل hourly_rate و overtime_rate للقراءة فقط
- إضافة معادلات توضيحية

src/contexts/LanguageContext.tsx:
- إضافة ترجمات جديدة للحساب التلقائي
```

### **Backend**:
```
api/app/Http/Controllers/Api/WorkerController.php:
- إضافة دالة calculateHourlyRates()
- تطبيق الحساب في store() و update()
- دعم القيم الافتراضية
```

## 🎉 **النتيجة النهائية**

### **المشكلة السابقة**:
```
❌ المستخدم يحتاج لحساب سعر الساعة يدوياً
❌ احتمالية حدوث أخطاء في الحسابات
❌ عدم تناسق بين سعر الساعة والراتب
❌ صعوبة في إدارة رواتب مختلفة
```

### **الحل الجديد**:
```
✅ إدخال الراتب الشهري وساعات العمل فقط
✅ حساب سعر الساعة والإضافي تلقائياً
✅ دقة 100% في الحسابات
✅ شفافية كاملة مع عرض المعادلات
✅ تناسق تام بين جميع القيم
✅ سهولة في الاستخدام
```

**🚀 هدفك تحقق بالكامل: الآن المستخدم يحدد الراتب وساعات العمل فقط، والنظام يحسب سعر الساعة تلقائياً!**

---

**تم بواسطة:** tammer ❤️  
**التاريخ:** 31 يوليو 2025  
**الحالة:** ✅ مكتمل ومُختبر وجاهز للاستخدام