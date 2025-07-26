import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Save, X, Clock, User, 
  CheckCircle, AlertTriangle, Camera, FileText,
  Settings, ArrowRight, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

export interface ProductionStage {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDuration: number; // in minutes
  requiredMaterials: Array<{
    materialId: string;
    materialName: string;
    quantity: number;
  }>;
  isActive: boolean;
}

interface StageProgress {
  stageId: string;
  workerId?: string;
  workerName?: string;
  startTime?: string;
  endTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  notes: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: 'image' | 'document';
    uploadedAt: string;
  }>;
}

interface ProductionStageManagerProps {
  orderId: string;
  orderType: string;
  onStageUpdate?: (stageId: string, progress: StageProgress) => void;
}

const ProductionStageManager: React.FC<ProductionStageManagerProps> = ({
  orderId,
  orderType,
  onStageUpdate
}) => {
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [stageProgress, setStageProgress] = useState<Record<string, StageProgress>>({});
  const [showStageModal, setShowStageModal] = useState(false);
  const [editingStage, setEditingStage] = useState<ProductionStage | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string>('');

  useEffect(() => {
    loadDefaultStages();
    loadStageProgress();
  }, [orderId]);

  const loadDefaultStages = () => {
    const defaultStages: ProductionStage[] = [
      {
        id: 'stage-1',
        name: 'Order Received',
        description: 'Initial order processing and verification',
        order: 1,
        estimatedDuration: 30,
        requiredMaterials: [],
        isActive: true
      },
      {
        id: 'stage-2',
        name: 'Cutting',
        description: 'Fabric cutting according to measurements',
        order: 2,
        estimatedDuration: 120,
        requiredMaterials: [
          { materialId: 'fabric-1', materialName: 'Premium Wool Fabric', quantity: 3 },
          { materialId: 'tool-1', materialName: 'Tailoring Scissors', quantity: 1 }
        ],
        isActive: true
      },
      {
        id: 'stage-3',
        name: 'Sewing',
        description: 'Main sewing and construction work',
        order: 3,
        estimatedDuration: 240,
        requiredMaterials: [
          { materialId: 'thread-1', materialName: 'Thread Spools', quantity: 2 },
          { materialId: 'lining-1', materialName: 'Silk Lining', quantity: 1 }
        ],
        isActive: true
      },
      {
        id: 'stage-4',
        name: 'Finishing',
        description: 'Final touches and quality checks',
        order: 4,
        estimatedDuration: 90,
        requiredMaterials: [
          { materialId: 'button-1', materialName: 'Metal Buttons', quantity: 8 }
        ],
        isActive: true
      },
      {
        id: 'stage-5',
        name: 'Quality Check',
        description: 'Final quality inspection',
        order: 5,
        estimatedDuration: 30,
        requiredMaterials: [],
        isActive: true
      },
      {
        id: 'stage-6',
        name: 'Ready for Delivery',
        description: 'Packaging and preparation for delivery',
        order: 6,
        estimatedDuration: 15,
        requiredMaterials: [],
        isActive: true
      }
    ];
    
    setStages(defaultStages);
  };

  const loadStageProgress = () => {
    // Initialize progress for all stages
    const progress: Record<string, StageProgress> = {};
    stages.forEach(stage => {
      progress[stage.id] = {
        stageId: stage.id,
        status: 'pending',
        notes: '',
        attachments: []
      };
    });
    
    // Set first stage as in progress
    if (stages.length > 0) {
      progress[stages[0].id] = {
        ...progress[stages[0].id],
        status: 'in_progress',
        startTime: new Date().toISOString()
      };
    }
    
    setStageProgress(progress);
  };

  const handleStageTransition = (stageId: string, action: 'start' | 'complete') => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;

    const currentProgress = stageProgress[stageId];
    let updatedProgress: StageProgress;

    if (action === 'start') {
      updatedProgress = {
        ...currentProgress,
        status: 'in_progress',
        startTime: new Date().toISOString()
      };
    } else {
      updatedProgress = {
        ...currentProgress,
        status: 'completed',
        endTime: new Date().toISOString()
      };

      // Auto-deduct materials
      stage.requiredMaterials.forEach(material => {
        console.log(`Auto-deducting ${material.quantity} units of ${material.materialName}`);
        // Here you would call your inventory API to deduct materials
      });

      // Start next stage if available
      const nextStage = stages.find(s => s.order === stage.order + 1);
      if (nextStage) {
        setStageProgress(prev => ({
          ...prev,
          [nextStage.id]: {
            ...prev[nextStage.id],
            status: 'in_progress',
            startTime: new Date().toISOString()
          }
        }));

        // Send notification to next worker
        toast.success(`Stage "${nextStage.name}" started. Worker notification sent.`);
      }
    }

    setStageProgress(prev => ({
      ...prev,
      [stageId]: updatedProgress
    }));

    onStageUpdate?.(stageId, updatedProgress);
    toast.success(`Stage "${stage.name}" ${action === 'start' ? 'started' : 'completed'}`);
  };

  const addStageNote = (stageId: string, note: string) => {
    setStageProgress(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        notes: note
      }
    }));
  };

  const addStageAttachment = (stageId: string, file: File) => {
    // Simulate file upload
    const attachment = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' as const : 'document' as const,
      uploadedAt: new Date().toISOString()
    };

    setStageProgress(prev => ({
      ...prev,
      [stageId]: {
        ...prev[stageId],
        attachments: [...prev[stageId].attachments, attachment]
      }
    }));

    toast.success('Attachment uploaded successfully');
  };

  const getStageStatus = (stage: ProductionStage) => {
    const progress = stageProgress[stage.id];
    if (!progress) return 'pending';

    // Check if overdue
    if (progress.status === 'in_progress' && progress.startTime) {
      const startTime = new Date(progress.startTime);
      const now = new Date();
      const elapsedMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
      
      if (elapsedMinutes > stage.estimatedDuration * 1.5) {
        return 'overdue';
      }
    }

    return progress.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success bg-success-100 border-success-200';
      case 'in_progress': return 'text-secondary bg-secondary-100 border-secondary-200';
      case 'overdue': return 'text-danger bg-danger-100 border-danger-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={20} className="text-success" />;
      case 'in_progress': return <Clock size={20} className="text-secondary" />;
      case 'overdue': return <AlertTriangle size={20} className="text-danger" />;
      default: return <Clock size={20} className="text-gray-400" />;
    }
  };

  const NotesModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Stage Notes & Attachments</h3>
          <button onClick={() => setShowNotesModal(false)} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        {selectedStageId && (
          <div className="space-y-6">
            {/* Notes Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"
                placeholder="Add notes about this stage..."
                value={stageProgress[selectedStageId]?.notes || ''}
                onChange={(e) => addStageNote(selectedStageId, e.target.value)}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">Upload photos or documents</p>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(file => {
                        addStageAttachment(selectedStageId, file);
                      });
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-700 cursor-pointer"
                >
                  Choose Files
                </label>
              </div>
            </div>

            {/* Existing Attachments */}
            {stageProgress[selectedStageId]?.attachments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h4>
                <div className="space-y-2">
                  {stageProgress[selectedStageId].attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {attachment.type === 'image' ? (
                          <Camera size={16} className="text-gray-400 mr-2" />
                        ) : (
                          <FileText size={16} className="text-gray-400 mr-2" />
                        )}
                        <span className="text-sm text-gray-900">{attachment.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(attachment.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Timeline View */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Production Timeline</h3>
          <div className="text-sm text-gray-500">Order: {orderId}</div>
        </div>

        <div className="relative">
          {stages.map((stage, index) => {
            const status = getStageStatus(stage);
            const progress = stageProgress[stage.id];
            const isLast = index === stages.length - 1;

            return (
              <div key={stage.id} className="relative pb-8">
                {!isLast && (
                  <div className="absolute left-6 top-12 h-full w-0.5 bg-gray-300"></div>
                )}
                
                <div className="flex items-start">
                  {/* Stage Icon */}
                  <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                    status === 'completed' ? 'bg-success-100 border-success' :
                    status === 'in_progress' ? 'bg-secondary-100 border-secondary' :
                    status === 'overdue' ? 'bg-danger-100 border-danger' :
                    'bg-gray-100 border-gray-300'
                  }`}>
                    {getStatusIcon(status)}
                  </div>

                  {/* Stage Content */}
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{stage.name}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
                    
                    {/* Stage Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">Estimated Duration:</span>
                        <span className="ml-2 font-medium">{stage.estimatedDuration} min</span>
                      </div>
                      
                      {progress?.workerId && (
                        <div className="text-sm">
                          <span className="text-gray-500">Assigned to:</span>
                          <span className="ml-2 font-medium">{progress.workerName}</span>
                        </div>
                      )}
                      
                      {progress?.startTime && (
                        <div className="text-sm">
                          <span className="text-gray-500">Started:</span>
                          <span className="ml-2 font-medium">
                            {new Date(progress.startTime).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Required Materials */}
                    {stage.requiredMaterials.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Required Materials:</h5>
                        <div className="flex flex-wrap gap-2">
                          {stage.requiredMaterials.map(material => (
                            <span key={material.materialId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {material.materialName} ({material.quantity})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      {status === 'pending' && (
                        <button
                          onClick={() => handleStageTransition(stage.id, 'start')}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-secondary hover:bg-secondary-700"
                        >
                          <ArrowRight size={16} className="mr-1" />
                          Start Stage
                        </button>
                      )}
                      
                      {status === 'in_progress' && (
                        <button
                          onClick={() => handleStageTransition(stage.id, 'complete')}
                          className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-white bg-success hover:bg-success-700"
                        >
                          <CheckCircle size={16} className="mr-1" />
                          Complete Stage
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedStageId(stage.id);
                          setShowNotesModal(true);
                        }}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FileText size={16} className="mr-1" />
                        Notes & Files
                      </button>
                    </div>

                    {/* Notes Preview */}
                    {progress?.notes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">{progress.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showNotesModal && <NotesModal />}
      </AnimatePresence>
    </div>
  );
};

export default ProductionStageManager;