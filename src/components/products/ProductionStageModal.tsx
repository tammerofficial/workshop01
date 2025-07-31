import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Clock, Users, Settings, AlertTriangle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface ProductionStage {
  id: number;
  name: string;
  description?: string;
  order_sequence: number;
  estimated_hours: number;
}

interface StageRequirement {
  id?: number;
  production_stage_id: number;
  order_sequence: number;
  estimated_hours: number;
  required_workers: number;
  skill_requirements?: string[];
  equipment_requirements?: string[];
  is_parallel: boolean;
  parallel_stages?: number[];
  is_critical: boolean;
  buffer_time_hours: number;
  notes?: string;
}

interface ProductionStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  currentStages: StageRequirement[];
  onSave: (stages: StageRequirement[]) => void;
}

const ProductionStageModal: React.FC<ProductionStageModalProps> = ({
  isOpen,
  onClose,
  productId,
  currentStages,
  onSave
}) => {
  const { isDark } = useTheme();
  const [availableStages, setAvailableStages] = useState<ProductionStage[]>([]);
  const [stageRequirements, setStageRequirements] = useState<StageRequirement[]>(currentStages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAvailableStages();
      setStageRequirements([...currentStages]);
    }
  }, [isOpen, currentStages]);

  const loadAvailableStages = async () => {
    try {
      const response = await fetch('/api/products/production-stages');
      const stages = await response.json();
      setAvailableStages(stages);
    } catch (error) {
      console.error('Error loading production stages:', error);
      toast.error('Error loading production stages');
    }
  };

  const addStageRequirement = () => {
    const nextSequence = Math.max(0, ...stageRequirements.map(s => s.order_sequence)) + 1;
    const newStage: StageRequirement = {
      production_stage_id: 0,
      order_sequence: nextSequence,
      estimated_hours: 0,
      required_workers: 1,
      skill_requirements: [],
      equipment_requirements: [],
      is_parallel: false,
      parallel_stages: [],
      is_critical: false,
      buffer_time_hours: 0,
      notes: ''
    };
    setStageRequirements([...stageRequirements, newStage]);
  };

  const updateStageRequirement = (index: number, field: keyof StageRequirement, value: any) => {
    const updated = [...stageRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setStageRequirements(updated);
  };

  const removeStageRequirement = (index: number) => {
    const updated = stageRequirements.filter((_, i) => i !== index);
    // Re-order sequences
    updated.forEach((stage, i) => {
      stage.order_sequence = i + 1;
    });
    setStageRequirements(updated);
  };

  const moveStage = (index: number, direction: 'up' | 'down') => {
    const updated = [...stageRequirements];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < updated.length) {
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      // Update order sequences
      updated[index].order_sequence = index + 1;
      updated[newIndex].order_sequence = newIndex + 1;
      setStageRequirements(updated);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate requirements
      for (const stage of stageRequirements) {
        if (!stage.production_stage_id) {
          toast.error('Please select a production stage for all requirements');
          return;
        }
        if (stage.estimated_hours <= 0) {
          toast.error('Estimated hours must be greater than 0');
          return;
        }
        if (stage.required_workers <= 0) {
          toast.error('Required workers must be greater than 0');
          return;
        }
      }

      const response = await fetch(`/api/products/${productId}/production-stages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stages: stageRequirements }),
      });

      if (response.ok) {
        toast.success('Production stages updated successfully');
        onSave(stageRequirements);
        onClose();
      } else {
        throw new Error('Failed to update production stages');
      }
    } catch (error) {
      console.error('Error saving production stages:', error);
      toast.error('Error saving production stages');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (stageIndex: number, skill: string) => {
    if (skill.trim()) {
      const updated = [...stageRequirements];
      const currentSkills = updated[stageIndex].skill_requirements || [];
      if (!currentSkills.includes(skill.trim())) {
        updated[stageIndex].skill_requirements = [...currentSkills, skill.trim()];
        setStageRequirements(updated);
      }
    }
  };

  const removeSkill = (stageIndex: number, skillIndex: number) => {
    const updated = [...stageRequirements];
    const currentSkills = updated[stageIndex].skill_requirements || [];
    updated[stageIndex].skill_requirements = currentSkills.filter((_, i) => i !== skillIndex);
    setStageRequirements(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">Production Stages Setup</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Define the production stages and requirements for this product
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Add Stage Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Stage Requirements</h3>
              <button
                onClick={addStageRequirement}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Stage
              </button>
            </div>

            {/* Stage Requirements List */}
            {stageRequirements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>No production stages defined yet</p>
                <p className="text-sm">Click "Add Stage" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stageRequirements.map((stage, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg font-medium">
                          Stage {stage.order_sequence}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveStage(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveStage(index, 'down')}
                            disabled={index === stageRequirements.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStageRequirement(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Production Stage Selection */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Production Stage</label>
                        <select
                          value={stage.production_stage_id}
                          onChange={(e) => updateStageRequirement(index, 'production_stage_id', parseInt(e.target.value))}
                          className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        >
                          <option value={0}>Select Stage</option>
                          {availableStages.map((availableStage) => (
                            <option key={availableStage.id} value={availableStage.id}>
                              {availableStage.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Estimated Hours */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Estimated Hours</label>
                        <input
                          type="number"
                          min="0"
                          value={stage.estimated_hours}
                          onChange={(e) => updateStageRequirement(index, 'estimated_hours', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        />
                      </div>

                      {/* Required Workers */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Required Workers</label>
                        <input
                          type="number"
                          min="1"
                          value={stage.required_workers}
                          onChange={(e) => updateStageRequirement(index, 'required_workers', parseInt(e.target.value) || 1)}
                          className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        />
                      </div>

                      {/* Buffer Time */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Buffer Time (hours)</label>
                        <input
                          type="number"
                          min="0"
                          value={stage.buffer_time_hours}
                          onChange={(e) => updateStageRequirement(index, 'buffer_time_hours', parseInt(e.target.value) || 0)}
                          className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        />
                      </div>

                      {/* Flags */}
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={stage.is_critical}
                            onChange={(e) => updateStageRequirement(index, 'is_critical', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Critical Stage</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={stage.is_parallel}
                            onChange={(e) => updateStageRequirement(index, 'is_parallel', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm">Can Run in Parallel</span>
                        </label>
                      </div>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Required Skills</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(stage.skill_requirements || []).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm flex items-center gap-2"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(index, skillIndex)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add skill..."
                          className="flex-1 p-2 text-sm border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addSkill(index, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        value={stage.notes || ''}
                        onChange={(e) => updateStageRequirement(index, 'notes', e.target.value)}
                        rows={2}
                        className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                        placeholder="Optional notes about this stage..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total estimated time: {stageRequirements.reduce((total, stage) => total + stage.estimated_hours + stage.buffer_time_hours, 0)} hours
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              Save Stages
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductionStageModal;