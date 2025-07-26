import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Package } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import DepartmentAwareComponent from '../components/common/DepartmentAwareComponent';
import { useDepartment } from '../contexts/DepartmentContext';
import JsBarcode from 'jsbarcode';
import toast from 'react-hot-toast';

const ViewBarcode: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { departmentInfo } = useDepartment();
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && id) {
      try {
        JsBarcode(barcodeRef.current, id, {
          format: "CODE128",
          width: 2,
          height: 100,
          displayValue: true,
          fontSize: 16,
          margin: 10
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleDownload = () => {
    if (barcodeRef.current) {
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `barcode-${id}.png`;
        link.href = canvas.toDataURL();
        link.click();
        
        toast.success('Barcode downloaded');
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <DepartmentAwareComponent>
      {({ inventory, loading }) => {
        const item = inventory.find(i => i.id === id);

        if (loading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          );
        }

        if (!item) {
          return (
            <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
              <div className="text-center">
                <Package size={48} className="mx-auto text-orange-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Not Found</h2>
                <p className="text-gray-500 mb-4">The inventory item you're looking for doesn't exist.</p>
                <button
                  onClick={() => navigate('/inventory')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Inventory
                </button>
              </div>
            </div>
          );
        }

        return (
          <div>
            <PageHeader 
              title={`Barcode - ${item.name}`}
              subtitle={`${departmentInfo.name} • ${item.category}`}
              action={
                <div className="flex space-x-3">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download size={16} className="mr-2" />
                    Download
                  </button>
                  <button
                    onClick={handlePrint}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Printer size={16} className="mr-2" />
                    Print
                  </button>
                  <button
                    onClick={() => navigate('/inventory')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Inventory
                  </button>
                </div>
              }
            />

            <motion.div 
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white rounded-lg shadow-sm p-8">
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-lg ${departmentInfo.color} flex items-center justify-center text-white text-2xl mx-auto mb-4`}>
                    {departmentInfo.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
                  <p className="text-gray-600">{departmentInfo.name} • {item.category}</p>
                </div>

                <div className="flex justify-center mb-8">
                  <div className="bg-white p-8 border-2 border-gray-200 rounded-lg">
                    <svg ref={barcodeRef}></svg>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Item Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Item ID:</span>
                        <span className="font-medium">{item.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium capitalize">{item.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Stock:</span>
                        <span className="font-medium">{item.currentStock} {item.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Stock Level:</span>
                        <span className="font-medium">{item.minStockLevel} {item.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Barcode Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="font-medium">CODE128</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium font-mono">{item.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium">{departmentInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Generated:</span>
                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    This barcode can be used for inventory tracking and management
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        );
      }}
    </DepartmentAwareComponent>
  );
};

export default ViewBarcode;