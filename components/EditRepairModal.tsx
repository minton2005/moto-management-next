'use client';

import { useState, useEffect } from 'react';
import { X, Calculator } from 'lucide-react';

interface RepairOrder {
  id: string;
  customerName: string;
  phone: string;
  licensePlate: string;
  brandModel: string;
  symptom: string;
  spareParts?: string;
  partsCost?: number;
  laborCost?: number;
  mileage?: number | string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedCost: number;
  createdAt: string;
}

interface EditRepairModalProps {
  isOpen: boolean;
  editingItem: RepairOrder | null;
  onClose: () => void;
  onSave: (updatedItem: RepairOrder) => void;
}

export default function EditRepairModal({
  isOpen,
  editingItem,
  onClose,
  onSave,
}: EditRepairModalProps) {
  const [spareParts, setSpareParts] = useState('');
  const [partsCost, setPartsCost] = useState<number | string>('');
  const [laborCost, setLaborCost] = useState<number | string>('');
  const [status, setStatus] = useState<RepairOrder['status']>('PENDING');

  useEffect(() => {
    if (editingItem) {
      setSpareParts(editingItem.spareParts || '');
      setPartsCost(editingItem.partsCost ?? '');
      setLaborCost(editingItem.laborCost ?? '');
      setStatus(editingItem.status || 'PENDING');
    }
  }, [editingItem]);

  if (!isOpen || !editingItem) return null;

  const numPartsCost = Number(partsCost) || 0;
  const numLaborCost = Number(laborCost) || 0;
  const totalCost = numPartsCost + numLaborCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedItem: RepairOrder = {
      ...editingItem,
      spareParts: spareParts.trim(),
      partsCost: numPartsCost,
      laborCost: numLaborCost,
      estimatedCost: totalCost > 0 ? totalCost : editingItem.estimatedCost,
      status,
    };

    onSave(updatedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              สรุปงานซ่อม #{editingItem.id.slice(0, 8)}
            </h2>
            <p className="text-xs text-gray-500">
              {editingItem.customerName} - {editingItem.licensePlate}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              อาการแจ้งซ่อมเดิม
            </label>
            <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700">
              {editingItem.symptom}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              รายการอะไหล่ที่เปลี่ยนจริง
            </label>
            <textarea
              value={spareParts}
              onChange={(e) => setSpareParts(e.target.value)}
              rows={3}
              placeholder="เช่น ยาง และ น้ำมันเครื่อง..."
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ค่าอะไหล่ (บาท)
              </label>
              <input
                type="number"
                min="0"
                value={partsCost}
                onChange={(e) => setPartsCost(e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ค่าแรงช่าง (บาท)
              </label>
              <input
                type="number"
                min="0"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                placeholder="0"
                className="w-full p-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* สรุปราคารวม Real-time */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-900 text-xs font-semibold">
              <Calculator className="w-4 h-4" /> ราคารวมประเมินสุทธิ:
            </div>
            <div className="text-lg font-bold text-blue-700">
              ฿{totalCost.toLocaleString()}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              อัปเดตสถานะงานซ่อม
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
            >
              <option value="PENDING">รอการซ่อม</option>
              <option value="IN_PROGRESS">กำลังซ่อม</option>
              <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              บันทึกการสรุปงาน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}