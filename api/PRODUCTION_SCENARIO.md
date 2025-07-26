# 🏭 Production System Scenario Documentation

## 📋 السيناريو: رحلة بدلة Ali Abdullah

### 🎯 الخطوات المطلوبة:

#### 1. **تسجيل العميل**
```sql
-- إنشاء عميل جديد
INSERT INTO clients (name, email, phone) 
VALUES ('Ali Abdullah', 'ali@example.com', '+96512345678');
```

#### 2. **إنشاء الطلب**
```sql
-- إنشاء طلب Haute Couture
INSERT INTO orders (client_id, category_id, title, status, specifications) 
VALUES (1, 1, 'ODR-0001', 'pending', '{"color": "grey", "fabric": "wool"}');
```

#### 3. **تسجيل المقاسات**
```sql
-- ربط المقاسات بالطلب
INSERT INTO measurements (client_id, order_id, chest, waist, hip, shoulder, arm_length, leg_length, neck) 
VALUES (1, 1, 42.5, 38.0, 42.0, 18.5, 25.0, 32.0, 16.0);
```

#### 4. **خصم القماش من المخزون**
```sql
-- تسجيل استخدام القماش
INSERT INTO material_transactions (material_id, order_id, transaction_type, quantity, unit_cost, total_cost) 
VALUES (1, 1, 'out', 3.5, 15.00, 52.50);

-- تحديث كمية المخزون
UPDATE materials SET quantity = quantity - 3.5 WHERE id = 1;
```

#### 5. **تعيين الخياط**
```sql
-- تعيين Youssef للطلب
UPDATE orders SET assigned_worker_id = 1 WHERE id = 1;
```

#### 6. **بدء الإنتاج**
```bash
# بدء تتبع الإنتاج
POST /api/production/orders/1/start
{
  "worker_id": 1
}
```

#### 7. **تسجيل الحضور (ZKTeco)**
```bash
# تسجيل دخول Youssef
POST /api/production/attendance
{
  "worker_id": 1,
  "check_in_time": "09:00",
  "device_id": "ZKTeco-001"
}

# تسجيل خروج Youssef
POST /api/production/attendance
{
  "worker_id": 1,
  "check_out_time": "17:00",
  "device_id": "ZKTeco-001"
}
```

#### 8. **تتبع مراحل الإنتاج**
```bash
# بدء مرحلة القص
POST /api/production/stages/1/start
{
  "worker_id": 1,
  "station_id": 3
}

# إكمال مرحلة القص
POST /api/production/stages/1/complete

# بدء مرحلة الخياطة
POST /api/production/stages/3/start
{
  "worker_id": 1,
  "station_id": 5
}

# إكمال مرحلة الخياطة
POST /api/production/stages/3/complete
```

#### 9. **تسجيل المبيعات**
```bash
# تسجيل البيع
POST /api/production/orders/1/sales
{
  "amount": 80.00,
  "payment_method": "cash",
  "worker_id": 1
}
```

#### 10. **احتساب الرواتب**
```sql
-- إنشاء راتب Youssef
INSERT INTO payroll (worker_id, payroll_number, payroll_date, working_hours, hourly_rate, base_salary, net_salary) 
VALUES (1, 'PAY-0001', '2025-07-26', 8, 5.00, 40.00, 40.00);
```

## 🗄️ الجداول الجديدة:

### 1. **sales** - المبيعات
- `order_id` - ربط بالطلب
- `client_id` - ربط بالعميل  
- `worker_id` - ربط بالخياط
- `sale_number` - رقم البيع (SALE-XXXX)
- `amount` - المبلغ (80 KWD)
- `payment_method` - طريقة الدفع
- `status` - حالة البيع

### 2. **payroll** - الرواتب
- `worker_id` - ربط بالعامل
- `payroll_number` - رقم الراتب (PAY-XXXX)
- `working_hours` - ساعات العمل
- `hourly_rate` - معدل الساعة
- `base_salary` - الراتب الأساسي
- `net_salary` - الراتب الصافي

### 3. **attendance** - الحضور والانصراف
- `worker_id` - ربط بالعامل
- `attendance_date` - تاريخ الحضور
- `check_in_time` - وقت الدخول (9:00)
- `check_out_time` - وقت الخروج (17:00)
- `device_id` - معرف الجهاز (ZKTeco)
- `total_hours` - إجمالي الساعات

### 4. **production_stages** - مراحل الإنتاج
- `name` - اسم المرحلة (Cutting, Sewing, Fitting, Finishing)
- `order_sequence` - ترتيب المرحلة
- `estimated_hours` - الساعات المتوقعة

### 5. **stations** - محطات العمل
- `name` - اسم المحطة
- `production_stage_id` - ربط بمرحلة الإنتاج
- `assigned_worker_id` - العامل المسؤول
- `status` - حالة المحطة (available, busy)

### 6. **material_transactions** - حركة المخزون
- `material_id` - ربط بالمادة
- `order_id` - ربط بالطلب
- `transaction_type` - نوع الحركة (in/out)
- `quantity` - الكمية
- `total_cost` - التكلفة الإجمالية

### 7. **order_production_tracking** - تتبع إنتاج الطلبات
- `order_id` - ربط بالطلب
- `production_stage_id` - ربط بمرحلة الإنتاج
- `station_id` - ربط بالمحطة
- `worker_id` - ربط بالعامل
- `status` - حالة المرحلة
- `started_at` - وقت البدء
- `completed_at` - وقت الإكمال

## 🔗 العلاقات المضافة:

### Order Model:
- `sales()` - علاقة مع المبيعات
- `productionTracking()` - علاقة مع تتبع الإنتاج
- `materialTransactions()` - علاقة مع حركة المخزون

### Worker Model:
- `sales()` - علاقة مع المبيعات
- `payroll()` - علاقة مع الرواتب
- `attendance()` - علاقة مع الحضور
- `stations()` - علاقة مع المحطات
- `productionTracking()` - علاقة مع تتبع الإنتاج

### Material Model:
- `transactions()` - علاقة مع حركة المخزون
- `updateQuantity()` - تحديث الكمية

## 🚀 API Endpoints:

### Production Management:
- `POST /api/production/orders/{order}/start` - بدء الإنتاج
- `POST /api/production/stages/{trackingId}/start` - بدء مرحلة
- `POST /api/production/stages/{trackingId}/complete` - إكمال مرحلة
- `GET /api/production/orders/{order}/progress` - تقدم الإنتاج

### Material Management:
- `POST /api/production/orders/{order}/materials` - تسجيل استخدام المواد

### Sales Management:
- `POST /api/production/orders/{order}/sales` - تسجيل البيع

### Attendance Management:
- `POST /api/production/attendance` - تسجيل الحضور

### Dashboard:
- `GET /api/production/dashboard` - بيانات لوحة التحكم

## ✅ النتيجة النهائية:

1. ✅ **Ali Abdullah** مسجل كعميل
2. ✅ **طلب بدلة** برقم ODR-0001
3. ✅ **مقاساته** مسجلة ومربوطة بالطلب
4. ✅ **قماش صوف رمادي** مخصوم من المخزون
5. ✅ **Youssef** مسؤول عن الخياطة
6. ✅ **الحضور والانصراف** مسجل (9:00 - 17:00)
7. ✅ **مراحل الإنتاج** متتبعة بالكامل
8. ✅ **البيع** مسجل بقيمة 80 KWD
9. ✅ **الراتب** محتسب لـ Youssef

## 🎯 المراقبة الكاملة:

- 📊 **تتبع الإنتاج** من الاستلام للتسليم
- 👥 **مراقبة العمال** والحضور
- 📦 **إدارة المخزون** وحركة المواد
- 💰 **المبيعات والرواتب** محسوبة
- 📈 **تقارير وإحصائيات** شاملة 