import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Users, Star, Shield, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Worker {
  id: number;
  name: string;
  employee_code: string;
  department: string;
  position: string;
  hourly_rate?: number;
  skills?: string[];
}

interface StageRequirement {
  id: number;
  production_stage_id: number;
  production_stage?: { id: number; name: string; };
  order_sequence: number;
  estimated_hours: number;
  required_workers: number;
}

interface WorkerRequirement {
  id?: number;
  stage_requirement_id: number;
  worker_id: number;
  production_stage_id: number;
  priority: number;
  efficiency_rate: number;
  required_skills?: string[];
  certifications?: string[];
  hourly_rate?: number;
  max_concurrent_orders: number;
  is_primary: boolean;
  can_supervise: boolean;
  notes?: string;
}

interface WorkerRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  stageRequirements: StageRequirement[];
  currentWorkerRequirements: WorkerRequirement[];
  onSave: (workerRequirements: WorkerRequirement[]) => void;
}

const WorkerRequirementsModal: React.FC<WorkerRequirementsModalProps> = ({
  isOpen,
  onClose,
  productId,
  stageRequirements,
  currentWorkerRequirements,
  onSave
}) => {
  const { isDark } = useTheme();
  const [availableWorkers, setAvailableWorkers] = useState<Worker[]>([]);
  const [workerRequirements, setWorkerRequirements] = useState<WorkerRequirement[]>(currentWorkerRequirements);
  const [loading, setLoading] = useState(false);
  const [selectedStage, setSelectedStage] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      loadAvailableWorkers();
      setWorkerRequirements([...currentWorkerRequirements]);
      if (stageRequirements.length > 0) {
        setSelectedStage(stageRequirements[0].id);
      }
    }
  }, [isOpen, currentWorkerRequirements, stageRequirements]);

  const loadAvailableWorkers = async () => {
    try {
      const response = await fetch('/api/products/available-workers');
      const workers = await response.json();
      setAvailableWorkers(workers);
    } catch (error) {
      console.error('Error loading workers:', error);
      toast.error('Error loading workers');
    }
  };

  const addWorkerRequirement = (stageRequirementId: number) => {
    const stageReq = stageRequirements.find(s => s.id === stageRequirementId);
    if (!stageReq) return;

    const existingWorkers = workerRequirements.filter(wr => wr.stage_requirement_id === stageRequirementId);
    const nextPriority = Math.max(0, ...existingWorkers.map(wr => wr.priority)) + 1;

    const newWorkerReq: WorkerRequirement = {
      stage_requirement_id: stageRequirementId,
      worker_id: 0,
      production_stage_id: stageReq.production_stage_id,
      priority: nextPriority,
      efficiency_rate: 1.0,
      required_skills: [],
      certifications: [],
      hourly_rate: undefined,
      max_concurrent_orders: 1,
      is_primary: false,
      can_supervise: false,
      notes: ''
    };

    setWorkerRequirements([...workerRequirements, newWorkerReq]);
  };

  const updateWorkerRequirement = (index: number, field: keyof WorkerRequirement, value: any) => {
    const updated = [...workerRequirements];
    updated[index] = { ...updated[index], [field]: value };

    // If worker is changed, update hourly rate from worker data
    if (field === 'worker_id') {
      const worker = availableWorkers.find(w => w.id === value);
      if (worker && worker.hourly_rate) {
        updated[index].hourly_rate = worker.hourly_rate;
      }
    }

    setWorkerRequirements(updated);
  };

  const removeWorkerRequirement = (index: number) => {
    const updated = workerRequirements.filter((_, i) => i !== index);
    setWorkerRequirements(updated);
  };

  const getFilteredWorkerRequirements = (stageRequirementId: number) => {
    return workerRequirements
      .map((wr, index) => ({ ...wr, originalIndex: index }))
      .filter(wr => wr.stage_requirement_id === stageRequirementId)
      .sort((a, b) => a.priority - b.priority);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validate requirements
      for (const workerReq of workerRequirements) {
        if (!workerReq.worker_id) {
          toast.error('Please select a worker for all requirements');
          return;
        }
        if (workerReq.efficiency_rate <= 0) {
          toast.error('Efficiency rate must be greater than 0');
          return;
        }
        if (workerReq.max_concurrent_orders <= 0) {
          toast.error('Max concurrent orders must be greater than 0');
          return;
        }
      }

      const response = await fetch(`/api/products/${productId}/worker-requirements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ worker_requirements: workerRequirements }),
      });

      if (response.ok) {
        toast.success('Worker requirements updated successfully');
        onSave(workerRequirements);
        onClose();
      } else {
        throw new Error('Failed to update worker requirements');
      }
    } catch (error) {
      console.error('Error saving worker requirements:', error);
      toast.error('Error saving worker requirements');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = (workerIndex: number, skill: string) => {
    if (skill.trim()) {
      const updated = [...workerRequirements];
      const currentSkills = updated[workerIndex].required_skills || [];
      if (!currentSkills.includes(skill.trim())) {
        updated[workerIndex].required_skills = [...currentSkills, skill.trim()];
        setWorkerRequirements(updated);
      }
    }
  };

  const removeSkill = (workerIndex: number, skillIndex: number) => {
    const updated = [...workerRequirements];
    const currentSkills = updated[workerIndex].required_skills || [];
    updated[workerIndex].required_skills = currentSkills.filter((_, i) => i !== skillIndex);
    setWorkerRequirements(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold">Worker Requirements Setup</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Assign workers to production stages and define their requirements
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
        <div className="flex h-[calc(90vh-140px)]">
          {/* Stage Selector */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Production Stages</h3>
            <div className="space-y-2">
              {stageRequirements.map((stage) => {
                const assignedWorkers = getFilteredWorkerRequirements(stage.id).length;
                const isComplete = assignedWorkers >= stage.required_workers;
                
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStage(stage.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedStage === stage.id
                        ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm">
                          Step {stage.order_sequence}
                        </div>
                        {isComplete ? (
                          <div className="text-green-600">
                            <Star className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="text-yellow-600">
                            <Clock className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                    <h4 className="font-medium">{stage.production_stage?.name}</h4>
                    <div className="text-sm text-gray-500 mt-1">
                      Workers: {assignedWorkers}/{stage.required_workers}
                    </div>
                    <div className="text-sm text-gray-500">
                      Hours: {stage.estimated_hours}h
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Worker Requirements */}
          <div className="flex-1 p-4 overflow-y-auto">
            {selectedStage ? (
              <div>
                {(() => {
                  const stage = stageRequirements.find(s => s.id === selectedStage);
                  const stageWorkers = getFilteredWorkerRequirements(selectedStage);
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold">{stage?.production_stage?.name}</h3>
                          <p className="text-gray-600 dark:text-gray-400">
                            Required: {stage?.required_workers} workers | Assigned: {stageWorkers.length}
                          </p>
                        </div>
                        <button
                          onClick={() => addWorkerRequirement(selectedStage)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Worker
                        </button>
                      </div>

                      {stageWorkers.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p>No workers assigned to this stage yet</p>
                          <p className="text-sm">Click "Add Worker" to get started</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {stageWorkers.map((workerReq, index) => {
                            const worker = availableWorkers.find(w => w.id === workerReq.worker_id);
                            
                            return (
                              <div
                                key={index}
                                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-lg font-medium">
                                      Priority {workerReq.priority}
                                    </div>
                                    {workerReq.is_primary && (
                                      <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        Primary
                                      </div>
                                    )}
                                    {workerReq.can_supervise && (
                                      <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        Supervisor
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeWorkerRequirement(workerReq.originalIndex!)}
                                    className="text-red-600 hover:text-red-700 transition-colors"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {/* Worker Selection */}
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Worker</label>
                                    <select
                                      value={workerReq.worker_id}
                                      onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'worker_id', parseInt(e.target.value))}
                                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                                    >
                                      <option value={0}>Select Worker</option>
                                      {availableWorkers.map((worker) => (
                                        <option key={worker.id} value={worker.id}>
                                          {worker.name} ({worker.employee_code})
                                        </option>
                                      ))}
                                    </select>
                                  </div>

                                  {/* Priority */}
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Priority</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={workerReq.priority}
                                      onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'priority', parseInt(e.target.value) || 1)}
                                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                                    />
                                  </div>

                                  {/* Efficiency Rate */}
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Efficiency Rate</label>
                                    <input
                                      type="number"
                                      min="0.1"
                                      max="5"
                                      step="0.1"
                                      value={workerReq.efficiency_rate}
                                      onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'efficiency_rate', parseFloat(e.target.value) || 1.0)}
                                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                                    />
                                  </div>

                                  {/* Hourly Rate */}
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Hourly Rate ($)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={workerReq.hourly_rate || ''}
                                      onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'hourly_rate', parseFloat(e.target.value) || undefined)}
                                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                                      placeholder={worker?.hourly_rate ? `Default: $${worker.hourly_rate}` : 'No default'}
                                    />
                                  </div>

                                  {/* Max Concurrent Orders */}
                                  <div>
                                    <label className="block text-sm font-medium mb-1">Max Concurrent Orders</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={workerReq.max_concurrent_orders}
                                      onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'max_concurrent_orders', parseInt(e.target.value) || 1)}
                                      className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                                    />
                                  </div>

                                  {/* Flags */}
                                  <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={workerReq.is_primary}
                                        onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'is_primary', e.target.checked)}
                                        className="rounded"
                                      />
                                      <span className="text-sm">Primary Worker</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={workerReq.can_supervise}
                                        onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'can_supervise', e.target.checked)}
                                        className="rounded"
                                      />
                                      <span className="text-sm">Can Supervise</span>
                                    </label>
                                  </div>
                                </div>

                                {/* Skills Section */}
                                <div className="mt-4">
                                  <label className="block text-sm font-medium mb-2">Required Skills</label>
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {(workerReq.required_skills || []).map((skill, skillIndex) => (
                                      <span
                                        key={skillIndex}
                                        className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-sm flex items-center gap-2"
                                      >
                                        {skill}
                                        <button
                                          onClick={() => removeSkill(workerReq.originalIndex!, skillIndex)}
                                          className="text-purple-600 hover:text-purple-800"
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
                                          addSkill(workerReq.originalIndex!, e.currentTarget.value);
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
                                    value={workerReq.notes || ''}
                                    onChange={(e) => updateWorkerRequirement(workerReq.originalIndex!, 'notes', e.target.value)}
                                    rows={2}
                                    className="w-full p-2 border rounded-lg dark:bg-gray-600 dark:border-gray-500"
                                    placeholder="Optional notes about this worker assignment..."
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Select a production stage to manage worker requirements</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total assigned workers: {workerRequirements.length}
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
              Save Requirements
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default WorkerRequirementsModal;