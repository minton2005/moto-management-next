'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { repairOrderSchema, RepairOrderInput } from '@/lib/validations';
import { mockRepairs as initialMockData } from '@/lib/mockData';
import { 
  Search, Plus, Wrench, RefreshCw, X, AlertCircle, 
  Trash2, LogOut, Printer, CheckCircle2, Clock, DollarSign, Edit3 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import EditRepairModal from '@/components/EditRepairModal';

export interface RepairOrder {
  id: string;
  customerName: string;
  phone: string;
  licensePlate: string;
  brandModel: string;
  symptom: string;
  spareParts?: string;
  partsCost?: number;
  laborCost?: number;
  mileage?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedCost: number;
  createdAt: string;
}

export default function HomePage() {
  const [repairs, setRepairs] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // State สำหรับ Modal ช่างสรุปงานซ่อม
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<RepairOrder | null>(null);

  const router = useRouter();

  // 1. โหลดข้อมูลจาก localStorage เมื่อเปิดหน้าเว็บครั้งแรก
  const loadRepairsFromStorage = () => {
    setLoading(true);
    try {
      const saved = localStorage.getItem('moto_repairs');
      if (saved) {
        setRepairs(JSON.parse(saved));
      } else {
        // ถ้าเพิ่งเปิดครั้งแรกสุด ใช้ข้อมูลจาก mockData แล้วเซฟลง localStorage
        localStorage.setItem('moto_repairs', JSON.stringify(initialMockData));
        setRepairs(initialMockData as RepairOrder[]);
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
      setRepairs(initialMockData as RepairOrder[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairsFromStorage();
  }, []);

  // ฟังก์ชันบันทึกข้อมูลกลับลง localStorage
  const saveRepairsToStorage = (updatedData: RepairOrder[]) => {
    setRepairs(updatedData);
    localStorage.setItem('moto_repairs', JSON.stringify(updatedData));
  };

  // กรองข้อมูลตามคำค้นหา และสถานะ
  const filteredRepairs = repairs.filter((item) => {
    const matchesSearch =
      !search ||
      item.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      item.customerName.toLowerCase().includes(search.toLowerCase()) ||
      item.phone.includes(search) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ตัวแปรคำนวณการ์ดสรุปภาพรวม (Summary Widgets)
  const totalOrders = repairs.length;
  const pendingOrders = repairs.filter((r) => r.status === 'PENDING' || r.status === 'IN_PROGRESS').length;
  const completedOrders = repairs.filter((r) => r.status === 'COMPLETED').length;
  const totalEstimatedCost = repairs.reduce((acc, curr) => acc + (curr.estimatedCost || 0), 0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RepairOrderInput>({
    // @ts-ignore
    resolver: zodResolver(repairOrderSchema),
    defaultValues: {
      status: 'PENDING',
      estimatedCost: 0,
    },
  });

  const selectedBrand = watch('brand');

  const modelsByBrand: Record<string, string[]> = {
    Honda: ['Wave 110i', 'Wave 125i', 'Click 160', 'PCX 160', 'ADV 160', 'Forza 350', 'Grom', 'Scoopy i'],
    Yamaha: ['Grand Filano', 'Aerox', 'NMAX', 'XMAX 300', 'Exciter 155', 'R15', 'MT-15', 'Fazzio'],
    Kawasaki: ['Ninja 400', 'Z400', 'ZX-25R', 'KLX 140', 'D-Tracker 150'],
    Suzuki: ['Raider R150', 'Burgman 400', 'GSX-R150', 'Smash 115'],
    Vespa: ['Sprint 150', 'Primavera 150', 'GTS Super 300', 'LX 125'],
    GPX: ['Demon 150GR', 'DRONE 150', 'TUSCANY 150', 'LEGEND 250'],
    'Royal Enfield': ['Hunter 350', 'Classic 350', 'Meteor 350', 'Interceptor 650'],
  };

  const availableModels = selectedBrand && modelsByBrand[selectedBrand] ? modelsByBrand[selectedBrand] : [];

  const handleLogout = async () => {
    await fetch('/api/auth/login', { method: 'DELETE' });
    router.push('/login');
    router.refresh();
  };

  // เปิดใบซ่อมใหม่ -> บันทึกลง localStorage
  const onSubmit = async (data: any) => {
    setSubmitError('');
    try {
      // หา ID ล่าสุด
      const maxId = repairs.reduce((max, item) => {
        const num = parseInt(item.id.replace('REP-', ''), 10) || 0;
        return num > max ? num : max;
      }, 0);

      const newId = `REP-${String(maxId + 1).padStart(3, '0')}`;

      const newOrder: RepairOrder = {
        id: newId,
        customerName: data.customerName,
        phone: data.phone,
        licensePlate: data.licensePlate,
        brandModel: `${data.brand} ${data.model}`,
        symptom: data.symptom,
        spareParts: data.spareParts || '',
        partsCost: Number(data.partsCost) || 0,
        laborCost: Number(data.laborCost) || 0,
        mileage: data.mileage ? Number(data.mileage) : undefined,
        status: data.status,
        estimatedCost: Number(data.estimatedCost) || 0,
        createdAt: new Date().toISOString(),
      };

      const updated = [newOrder, ...repairs];
      saveRepairsToStorage(updated);

      reset();
      setIsModalOpen(false);
    } catch (error) {
      setSubmitError('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  // เปลี่ยนสถานะด่วนในตาราง -> บันทึกลง localStorage
  const handleUpdateStatus = (id: string, newStatus: any) => {
    const updated = repairs.map((item) =>
      item.id === id ? { ...item, status: newStatus } : item
    );
    saveRepairsToStorage(updated);
  };

  // ลบรายการ -> บันทึกลง localStorage
  const handleDelete = (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;
    const updated = repairs.filter((item) => item.id !== id);
    saveRepairsToStorage(updated);
  };

  // เปิด Modal แก้ไข
  const handleOpenEdit = (item: RepairOrder) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // บันทึกแก้ไขจาก Modal -> บันทึกลง localStorage
  const handleSaveEdit = (updatedItem: RepairOrder) => {
    const updated = repairs.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    saveRepairsToStorage(updated);
  };

  // ฟังก์ชันพิมพ์ใบสั่งซ่อม
  const handlePrint = (item: RepairOrder) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const partsCost = item.partsCost || 0;
    const laborCost = item.laborCost || 0;
    const hasSparePartsText = Boolean(item.spareParts && item.spareParts.trim() !== '');

    printWindow.document.write(`
      <html>
        <head>
          <title>ใบสั่งซ่อม - ${item.id}</title>
          <style>
            body { font-family: sans-serif; padding: 25px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .header h2 { margin: 0; color: #1e3a8a; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 14px; }
            .label { font-weight: bold; color: #4b5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; }
            th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            th { background-color: #f8fafc; color: #1e293b; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; background-color: #f1f5f9; }
            .signature { margin-top: 60px; display: flex; justify-content: space-between; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>ใบรับรองการแจ้งซ่อม / ใบเสนอราคา</h2>
            <p style="margin: 5px 0 0 0; color: #6b7280;">เลขที่ใบซ่อม: <strong>${item.id}</strong></p>
          </div>
          
          <div class="info-grid">
            <div><span class="label">ชื่อลูกค้า:</span> ${item.customerName}</div>
            <div><span class="label">เบอร์โทรศัพท์:</span> ${item.phone}</div>
            <div><span class="label">ทะเบียน / รุ่นรถ:</span> ${item.licensePlate} (${item.brandModel})</div>
            <div><span class="label">เลขไมล์:</span> ${item.mileage ? item.mileage.toLocaleString() + ' กม.' : '-'}</div>
          </div>

          <div style="margin-bottom: 15px;">
            <span class="label">อาการแจ้งซ่อมจากลูกค้า:</span>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 10px; border-radius: 6px; margin-top: 5px;">
              ${item.symptom}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>รายการรายละเอียดการซ่อม / อะไหล่</th>
                <th class="text-right" style="width: 150px;">จำนวนเงิน (บาท)</th>
              </tr>
            </thead>
            <tbody>
              ${
                hasSparePartsText || partsCost > 0 || laborCost > 0
                  ? `
                <tr>
                  <td>
                    <strong>รายการอะไหล่ / อุปกรณ์ที่เปลี่ยน:</strong><br/>
                    <span style="color: #4b5563;">${item.spareParts || 'ไม่มีรายการอะไหล่เปลี่ยน'}</span>
                  </td>
                  <td class="text-right">฿${partsCost.toLocaleString()}</td>
                </tr>
                <tr>
                  <td><strong>ค่าบริการ / ค่าแรงช่างตรวจเช็กซ่อมแซม</strong></td>
                  <td class="text-right">฿${laborCost.toLocaleString()}</td>
                </tr>
              `
                  : `
                <tr>
                  <td>
                    <strong>ประมาณการค่าซ่อมแซมและค่าบริการเบื้องต้น:</strong><br/>
                    <span style="color: #4b5563;">รอช่างตรวจเช็กสรุปรายการอะไหล่</span>
                  </td>
                  <td class="text-right">฿${item.estimatedCost.toLocaleString()}</td>
                </tr>
              `
              }
              <tr class="total-row">
                <td class="text-right">ราคารวมประเมินทั้งสิ้น:</td>
                <td class="text-right" style="color: #2563eb; font-size: 16px;">฿${item.estimatedCost.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="signature">
            <div style="text-align: center;">
              ............................................<br/>
              ( ${item.customerName} )<br/>
              <span style="font-size: 12px; color: #6b7280;">ลงชื่อลูกค้า</span>
            </div>
            <div style="text-align: center;">
              ............................................<br/>
              ( ช่างผู้รับซ่อม )<br/>
              <span style="font-size: 12px; color: #6b7280;">ผู้ประเมินราคา</span>
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-medium">รอการซ่อม</span>;
      case 'IN_PROGRESS':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">กำลังซ่อม</span>;
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-medium">ซ่อมเสร็จสิ้น</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-medium">ยกเลิก</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ระบบจัดการงานซ่อมมอเตอร์ไซค์</h1>
              <p className="text-sm text-gray-500">ติดตามและจัดการรายการแจ้งซ่อมของลูกค้า</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> เปิดใบซ่อมใหม่
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">ใบซ่อมทั้งหมด</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders} รายการ</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">กำลังดำเนินการ/รอซ่อม</p>
              <h3 className="text-2xl font-bold text-yellow-600 mt-1">{pendingOrders} รายการ</h3>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">ซ่อมเสร็จสิ้น</p>
              <h3 className="text-2xl font-bold text-green-600 mt-1">{completedOrders} รายการ</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">ประเมินรายรับรวม</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">฿{totalEstimatedCost.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
            <input
              type="text"
              placeholder="ค้นหาตาม ทะเบียนรถ, ชื่อลูกค้า หรือเบอร์โทรศัพท์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทุกสถานะงานซ่อม</option>
              <option value="PENDING">รอการซ่อม</option>
              <option value="IN_PROGRESS">กำลังซ่อม</option>
              <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
            <button
              onClick={loadRepairsFromStorage}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
                <tr>
                  <th className="p-4">เลขที่ใบซ่อม</th>
                  <th className="p-4">ข้อมูลลูกค้า</th>
                  <th className="p-4">ทะเบียน / รุ่นรถ</th>
                  <th className="p-4">อาการแจ้งซ่อม</th>
                  <th className="p-4">ราคาประเมิน</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">กำลังโหลดข้อมูล...</td>
                  </tr>
                ) : filteredRepairs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">ไม่พบข้อมูลรายการสั่งซ่อม</td>
                  </tr>
                ) : (
                  filteredRepairs.map((item, index) => (
                    <tr key={`${item.id}-${index}`} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-semibold text-blue-600">{item.id}</td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{item.customerName}</div>
                        <div className="text-xs text-gray-500">{item.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{item.licensePlate}</div>
                        <div className="text-xs text-gray-500">{item.brandModel}</div>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{item.symptom}</td>
                      <td className="p-4 font-medium text-gray-900">฿{item.estimatedCost.toLocaleString()}</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            title="เปลี่ยนสถานะ"
                          >
                            <option value="PENDING">รอการซ่อม</option>
                            <option value="IN_PROGRESS">กำลังซ่อม</option>
                            <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
                            <option value="CANCELLED">ยกเลิก</option>
                          </select>

                          {/* ปุ่มดินสอ สำหรับช่างกดเข้าสรุปรายการอะไหล่/ค่าแรง */}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="สรุปรายการซ่อม / แก้ไข"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePrint(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="พิมพ์ใบซ่อม"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal ฟอร์มเปิดใบซ่อมใหม่ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เปิดใบสั่งซ่อมมอเตอร์ไซค์ใหม่</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* @ts-ignore */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4"/> {submitError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ชื่อ-นามสกุล ลูกค้า *</label>
                <input
                  type="text"
                  {...register('customerName')}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น สมชาย ใจดี"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">เบอร์โทรศัพท์ *</label>
                <input
                  type="text"
                  {...register('phone')}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น 0812345678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* ทะเบียนรถ + ยี่ห้อ + รุ่นรถ */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ทะเบียนรถ *</label>
                  <input
                    type="text"
                    {...register('licensePlate')}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="เช่น 1กข 1234"
                  />
                  {errors.licensePlate && (
                    <p className="text-red-500 text-xs mt-1">{errors.licensePlate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ยี่ห้อรถ *</label>
                  <input
                    type="text"
                    list="brand-list"
                    {...register('brand', {
                      onChange: () => {
                        setValue('model', '');
                      },
                    })}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="เลือก/พิมพ์ยี่ห้อ..."
                  />
                  <datalist id="brand-list">
                    {Object.keys(modelsByBrand).map((b) => (
                      <option key={b} value={b} />
                    ))}
                  </datalist>
                  {errors.brand && (
                    <p className="text-red-500 text-xs mt-1">{errors.brand?.message as string}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">รุ่นรถ *</label>
                  <input
                    type="text"
                    list="model-list"
                    disabled={!selectedBrand}
                    {...register('model')}
                    className="w-full px-3 py-2 border rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400"
                    placeholder={selectedBrand ? 'เลือก/พิมพ์รุ่น...' : 'เลือกลิสต์ยี่ห้อก่อน'}
                  />
                  <datalist id="model-list">
                    {availableModels.map((m) => (
                      <option key={m} value={m} />
                    ))}
                  </datalist>
                  {errors.model && (
                    <p className="text-red-500 text-xs mt-1">{errors.model?.message as string}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">อาการแจ้งซ่อม *</label>
                <textarea
                  {...register('symptom')}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="เช่น สตาร์ตไม่ติด มีเสียงดังที่เครื่องยนต์..."
                />
                {errors.symptom && (
                  <p className="text-red-500 text-xs mt-1">{errors.symptom.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">เลขไมล์ปัจจุบัน (กม.)</label>
                  <input
                    type="number"
                    {...register('mileage')}
                    placeholder="ระบุหรือไม่ก็ได้ (เช่น 12500)"
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-400"
                  />
                  {errors.mileage && (
                    <p className="text-red-500 text-xs mt-1">{errors.mileage.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ราคาประเมินเบื้องต้น (บาท)</label>
                  <input
                    type="number"
                    {...register('estimatedCost')}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  {errors.estimatedCost && (
                    <p className="text-red-500 text-xs mt-1">{errors.estimatedCost.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">สถานะเริ่มต้น</label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="PENDING">รอการซ่อม</option>
                  <option value="IN_PROGRESS">กำลังซ่อม</option>
                  <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
                  <option value="CANCELLED">ยกเลิก</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกใบซ่อม'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Modal ช่างสรุปงานซ่อม */}
      <EditRepairModal
        isOpen={isEditModalOpen}
        editingItem={editingItem}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}