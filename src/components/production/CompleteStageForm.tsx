import React, { useState } from 'react';
import { useIntegratedProduction } from '../../hooks/useIntegratedProduction';
import { OrderProductionTracking } from '../../types/integratedProduction';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Textarea } from '../common/Textarea';
import { Alert } from '../common/Alert';
import { FaSpinner } from 'react-icons/fa';

interface CompleteStageFormProps {
  stage: OrderProductionTracking;
  orderId: number;
  onStageCompleted: () => void;
}

const CompleteStageForm: React.FC<CompleteStageFormProps> = ({ stage, orderId, onStageCompleted }) => {
  const { moveToNextStage, isCompleting, error } = useIntegratedProduction(orderId);
  const [actualMinutes, setActualMinutes] = useState<string>('');
  const [qualityScore, setQualityScore] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualMinutes) {
      alert('يرجى إدخال الوقت الفعلي المستغرق بالدقائق.');
      return;
    }

    try {
      await moveToNextStage(stage.production_stage_id, {
        actual_minutes: parseInt(actualMinutes, 10),
        quality_score: qualityScore ? parseInt(qualityScore, 10) : undefined,
        notes,
      });
      onStageCompleted();
    } catch (err) {
      // Error is handled in the hook, but we can log it here if needed
      console.error('Failed to complete stage:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-lg">إكمال المرحلة: {stage.production_stage.name}</h3>
      
      {error && <Alert type="error" message={error} />}

      <div>
        <label htmlFor="actual_minutes" className="block text-sm font-medium text-gray-700">
          الوقت الفعلي (بالدقائق) <span className="text-red-500">*</span>
        </label>
        <Input
          id="actual_minutes"
          type="number"
          value={actualMinutes}
          onChange={(e) => setActualMinutes(e.target.value)}
          required
          placeholder={`الوقت المقدر: ${stage.estimated_minutes} دقيقة`}
        />
      </div>

      <div>
        <label htmlFor="quality_score" className="block text-sm font-medium text-gray-700">
          تقييم الجودة (من 100)
        </label>
        <Input
          id="quality_score"
          type="number"
          min="0"
          max="100"
          value={qualityScore}
          onChange={(e) => setQualityScore(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          ملاحظات
        </label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <Button type="submit" disabled={isCompleting}>
        {isCompleting ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            جاري الإكمال...
          </>
        ) : (
          'إكمال والانتقال للمرحلة التالية'
        )}
      </Button>
    </form>
  );
};

export default CompleteStageForm;
