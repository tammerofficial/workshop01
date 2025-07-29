import React from 'react';
import { useIntegratedProduction } from '../../hooks/useIntegratedProduction';
import { FaSpinner, FaCheckCircle, FaHourglassHalf, FaClipboardList, FaBoxOpen, FaDollarSign } from 'react-icons/fa';
import { Alert } from '../common/Alert';
import CompleteStageForm from './CompleteStageForm';
import { OrderProductionTracking } from '../../types/integratedProduction';

interface IntegratedProductionProgressProps {
  orderId: number;
}

const StageStatusIcon = ({ status }: { status: OrderProductionTracking['status'] }) => {
  switch (status) {
    case 'completed':
      return <FaCheckCircle className="text-green-500" />;
    case 'in_progress':
      return <FaSpinner className="text-blue-500 animate-spin" />;
    case 'pending':
      return <FaHourglassHalf className="text-yellow-500" />;
    default:
      return null;
  }
};

const IntegratedProductionProgress: React.FC<IntegratedProductionProgressProps> = ({ orderId }) => {
  const { loading, error, progressData, fetchProgress } = useIntegratedProduction(orderId);

  if (loading) {
    return <div className="flex justify-center items-center p-8"><FaSpinner className="animate-spin text-2xl" /></div>;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!progressData) {
    return <Alert type="info" message="لا توجد بيانات لعرضها." />;
  }

  const { order, progress } = progressData;
  const currentStage = progress.current_stage;

  const totalCost = order.cost_breakdown.reduce((sum, item) => sum + parseFloat(item.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-700">تقدم الطلب: #{order.id} - {order.title}</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${progress.progress_percentage}%` }}
          ></div>
        </div>
        <p className="text-center mt-1">{progress.progress_percentage.toFixed(2)}% مكتمل</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 text-center">
        <div className="p-4 bg-gray-100 rounded-lg">
          <FaClipboardList className="mx-auto text-2xl text-blue-500 mb-2" />
          <p className="font-semibold">المرحلة الحالية</p>
          <p>{currentStage ? currentStage.production_stage.name : 'اكتمل الإنتاج'}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg">
          <FaBoxOpen className="mx-auto text-2xl text-green-500 mb-2" />
          <p className="font-semibold">المواد المحجوزة</p>
          <p>{order.material_reservations.length} مادة</p>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg">
          <FaDollarSign className="mx-auto text-2xl text-yellow-500 mb-2" />
          <p className="font-semibold">التكلفة الإجمالية حتى الآن</p>
          <p>{totalCost.toFixed(2)} ريال</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">مراحل الإنتاج</h3>
        <ul className="space-y-2">
          {order.production_tracking.map((stage) => (
            <li key={stage.id} className="flex items-center p-3 bg-white rounded shadow-sm">
              <StageStatusIcon status={stage.status} />
              <span className="mr-3">{stage.production_stage.name}</span>
              <span className="text-sm text-gray-500 ml-auto">
                {stage.status === 'completed' && stage.completed_at && `اكتمل في: ${new Date(stage.completed_at).toLocaleString()}`}
                {stage.status === 'in_progress' && stage.started_at && `بدأ في: ${new Date(stage.started_at).toLocaleString()}`}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {currentStage && (
        <CompleteStageForm
          stage={currentStage}
          orderId={orderId}
          onStageCompleted={fetchProgress}
        />
      )}

      {!currentStage && progress.progress_percentage === 100 && (
         <Alert type="success" message="اكتمل إنتاج هذا الطلب بنجاح!" />
      )}
    </div>
  );
};

export default IntegratedProductionProgress;
