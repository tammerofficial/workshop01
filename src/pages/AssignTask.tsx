import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { workerService, orderService, taskService } from '../api/laravel';
import { Task, Worker, Order } from '../types';
import toast from 'react-hot-toast';

const AssignTask: React.FC = () => {
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notes, setNotes] = useState('');

  // Filter available workers (status: active)
  const availableWorkers = mockWorkers.filter(worker => worker.status === 'active');

  // Filter orders that need assignment (status: in progress)
  const pendingOrders = mockOrders.filter(order => order.status === 'in progress');

  const handleAssignTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorker || !selectedOrder) return;

    // Here you would typically make an API call to assign the task
    console.log('Assigning task:', {
      workerId: selectedWorker.id,
      orderId: selectedOrder.id,
      notes,
    });

    // Reset form
    setSelectedWorker(null);
    setSelectedOrder(null);
    setNotes('');
  };

  return (
    <div>
      <PageHeader 
        title="Assign Task" 
        subtitle="Assign production tasks to available workers" 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Workers */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Available Workers</h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {availableWorkers.map((worker) => (
                <div
                  key={worker.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedWorker?.id === worker.id ? 'bg-secondary-50 border-l-4 border-secondary' : ''
                  }`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <div className="flex items-center">
                    <img
                      src={worker.imageUrl}
                      alt={worker.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{worker.name}</p>
                      <p className="text-sm text-gray-500">{worker.role}</p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        <CheckCircle size={12} className="mr-1" />
                        Available
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {worker.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Pending Orders */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Pending Orders</h3>
            </div>
            
            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 ${
                    selectedOrder?.id === order.id ? 'bg-secondary-50 border-l-4 border-secondary' : ''
                  }`}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-500">{order.clientName}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      <Clock size={12} className="mr-1" />
                      {order.currentStage.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Suit Type: {order.suitType}</p>
                    <p className="text-sm text-gray-500">
                      Deadline: {new Date(order.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Assignment Form */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Task Assignment</h3>
            </div>
            
            <form onSubmit={handleAssignTask} className="p-4">
              {selectedWorker && selectedOrder ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Worker</h4>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <img
                        src={selectedWorker.imageUrl}
                        alt={selectedWorker.name}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{selectedWorker.name}</p>
                        <p className="text-sm text-gray-500">{selectedWorker.role}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Order</h4>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{selectedOrder.id}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.clientName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Stage: {selectedOrder.currentStage.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm"
                      placeholder="Add any special instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                  >
                    Assign Task
                  </button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <AlertTriangle size={24} className="mx-auto text-warning mb-2" />
                  <p className="text-sm text-gray-500">
                    Please select both a worker and an order to assign a task
                  </p>
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AssignTask;