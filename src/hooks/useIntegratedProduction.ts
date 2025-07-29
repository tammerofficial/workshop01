import { useState, useEffect, useCallback } from 'react';
import {
  ProductionProgressResponse,
  OrderProductionTracking,
  MoveToNextStageData,
  MoveToNextStageResponse,
} from '../types/integratedProduction';
import laravelApi from '../api/laravel';

export const useIntegratedProduction = (orderId: number) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProductionProgressResponse | null>(null);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const response = await laravelApi.get<ProductionProgressResponse>(
        `/integrated-production/orders/${orderId}/progress`
      );
      setProgressData(response.data);
      setError(null);
    } catch (err) {
      setError('فشل في جلب بيانات تقدم الإنتاج.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchProgress();
    }
  }, [orderId, fetchProgress]);

  const moveToNextStage = async (
    stageId: number,
    completionData: MoveToNextStageData
  ): Promise<MoveToNextStageResponse> => {
    setIsCompleting(true);
    try {
      const response = await laravelApi.post<MoveToNextStageResponse>(
        `/integrated-production/orders/${orderId}/stages/${stageId}/complete`,
        completionData
      );
      
      // Refresh progress data after moving to the next stage
      await fetchProgress();
      
      return response.data;
    } catch (err) {
      setError('فشل في الانتقال للمرحلة التالية.');
      console.error(err);
      throw err;
    } finally {
      setIsCompleting(false);
    }
  };

  const getCurrentStage = (): OrderProductionTracking | null => {
    return progressData?.progress.current_stage || null;
  };

  return {
    loading,
    error,
    progressData,
    isCompleting,
    fetchProgress,
    moveToNextStage,
    getCurrentStage,
  };
};
