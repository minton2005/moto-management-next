'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { repairOrderSchema, RepairOrderInput } from '@/lib/validations';
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
  mileage?: number | string;
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

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<RepairOrder | null>(null);

  const router = useRouter();

  // 1. ดึงข้อมูลแบบบังคับไม่ใช้ Cache (No-Store & Timestamp)
  const fetchRepairsFromAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/repairs?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const formattedData = data.map((item: any) => {
          const parts = Number(item.partsCost) || 0;
          const labor = Number(item.laborCost) || 0;
          const calculatedTotal = parts + labor;

          let rawNotes = item.notes || '';
          let initialEst = 0;
          
          if (rawNotes.includes('|EST:')) {
            const splitEst = rawNotes.split('|EST:');
            rawNotes = splitEst[0].trim();
            initialEst = Number(splitEst[1]) || 0;
          }

          let parsedSpareParts = '';
          let parsedSymptom = rawNotes;
          if (rawNotes.includes('\n[อะไหล่]:')) {
            const splitParts = rawNotes.split('\n[อะไหล่]:');
            parsedSymptom = splitParts[0].trim();
            parsedSpareParts = splitParts[1].trim();
          }

          let brandModel = 'ทั่วไป';
          if (parsedSymptom.includes('(รุ่น:')) {
            const splitBrand = parsedSymptom.split('(รุ่น:');
            parsedSymptom = splitBrand[0].trim();
            brandModel = splitBrand[1].replace(')', '').trim();
          }

          return {
            id: item.id,
            customerName: item.customer || 'ไม่ระบุชื่อ',
            phone: item.phone || '',
            licensePlate: item.licensePlate || '',
            brandModel,
            symptom: parsedSymptom,
            spareParts: parsedSpareParts,
            partsCost: parts,
            laborCost: labor,
            mileage: item.mileage || '-',
            status: item.status || 'PENDING',
            estimatedCost: calculatedTotal > 0 ? calculatedTotal : initialEst,
            createdAt: item.createdAt || new Date().toISOString(),
          };
        });
        setRepairs(formattedData);
      }
    } catch (e) {
      console.error('Failed to load repairs from API:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairsFromAPI();
  }, []);

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
    defaultValues: { status: 'PENDING', estimatedCost: 0 },
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

  const onSubmit = async (data: any) => {
    setSubmitError('');
    try {
      const res = await fetch('/api/repairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: data.customerName,
          phone: data.phone,
          licensePlate: data.licensePlate,
          mileage: data.mileage ? `${data.mileage} กม.` : undefined,
          notes: `${data.symptom} (รุ่น: ${data.brand || ''} ${data.model || ''}) |EST:${data.estimatedCost || 0}`,
          status: data.status || 'PENDING',
          partsCost: 0,
          laborCost: 0,
        }),
      });

      if (!res.ok) throw new Error('บันทึกไม่สำเร็จ');

      await fetchRepairsFromAPI();
      reset();
      setIsModalOpen(false);
    } catch (error) {
      setSubmitError('เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/repairs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchRepairsFromAPI();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้ออกจากฐานข้อมูล?')) return;
    try {
      const res = await fetch(`/api/repairs/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRepairsFromAPI();
    } catch (error) {
      console.error('Failed to delete repair:', error);
    }
  };

  const handleOpenEdit = (item: RepairOrder) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (updatedItem: RepairOrder) => {
    try {
      const res = await fetch(`/api/repairs/${updatedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: updatedItem.status,
          partsCost: updatedItem.partsCost,
          laborCost: updatedItem.laborCost,
          notes: `${updatedItem.symptom} \n[อะไหล่]: ${updatedItem.spareParts || ''}`,
        }),
      });

      if (res.ok) {
        await fetchRepairsFromAPI();
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Failed to save edit:', error);
    }
  };

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
            .header { text-align: center; border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px; }
            .header h2 { margin: 0; color: #065f46; }
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
            <div><span class="label">เลขไมล์:</span> ${item.mileage ? item.mileage.toString() : '-'}</div>
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
                <td class="text-right" style="color: #059669; font-size: 16px;">฿${item.estimatedCost.toLocaleString()}</td>
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
      case 'PENDING': return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-medium">รอการซ่อม</span>;
      case 'IN_PROGRESS': return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-medium">กำลังซ่อม</span>;
      case 'COMPLETED': return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-medium">ซ่อมเสร็จสิ้น</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-medium">ยกเลิก</span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
              <Wrench className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">ระบบจัดการงานซ่อมมอเตอร์ไซค์</h1>
              <p className="text-xs text-gray-500">ติดตามและจัดการรายการแจ้งซ่อมของลูกค้า</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-4 h-4" /> เปิดใบซ่อมใหม่
            </button>
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-gray-200 hover:border-red-100"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">ใบซ่อมทั้งหมด</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalOrders} <span className="text-xs font-normal text-gray-500">รายการ</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Wrench className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">กำลังดำเนินการ/รอซ่อม</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{pendingOrders} <span className="text-xs font-normal text-gray-500">รายการ</span></h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">ซ่อมเสร็จสิ้น</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{completedOrders} <span className="text-xs font-normal text-gray-500">รายการ</span></h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">ประเมินรายรับรวม</p>
              <h3 className="text-2xl font-bold text-teal-600 mt-1">฿{totalEstimatedCost.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
            <input
              type="text"
              placeholder="ค้นหาตาม ทะเบียนรถ, ชื่อลูกค้า หรือเบอร์โทรศัพท์..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50/50 text-gray-900 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            >
              <option value="">ทุกสถานะงานซ่อม</option>
              <option value="PENDING">รอการซ่อม</option>
              <option value="IN_PROGRESS">กำลังซ่อม</option>
              <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
              <option value="CANCELLED">ยกเลิก</option>
            </select>
            <button
              onClick={fetchRepairsFromAPI}
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 text-gray-500 transition-all"
              title="รีเฟรชข้อมูลจาก Database"
            >
              <RefreshCw className="w-4 h-4"/>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-600 font-semibold">
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
                    <td colSpan={7} className="text-center py-8 text-gray-500">กำลังดึงข้อมูลจาก SQLite Database...</td>
                  </tr>
                ) : filteredRepairs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">ไม่พบข้อมูลรายการสั่งซ่อมในระบบ</td>
                  </tr>
                ) : (
                  filteredRepairs.map((item, index) => (
                    <tr key={`${item.id}-${index}`} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="p-4 font-mono font-semibold text-emerald-600">{item.id.slice(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{item.customerName}</div>
                        <div className="text-xs text-gray-500">{item.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{item.licensePlate}</div>
                        <div className="text-xs text-gray-500">{item.brandModel}</div>
                      </td>
                      <td className="p-4 text-gray-600 max-w-xs truncate">{item.symptom}</td>
                      <td className="p-4 font-semibold text-gray-900">฿{item.estimatedCost.toLocaleString()}</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <select
                            value={item.status}
                            onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                            className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            title="เปลี่ยนสถานะ"
                          >
                            <option value="PENDING">รอการซ่อม</option>
                            <option value="IN_PROGRESS">กำลังซ่อม</option>
                            <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
                            <option value="CANCELLED">ยกเลิก</option>
                          </select>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="สรุปรายการซ่อม / แก้ไข"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handlePrint(item)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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

      {/* Modal เปิดใบซ่อมใหม่ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">เปิดใบสั่งซ่อมมอเตอร์ไซค์ใหม่</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5"/>
              </button>
            </div>

            {/* @ts-ignore */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {submitError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4"/> {submitError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ชื่อ-นามสกุล ลูกค้า *</label>
                <input type="text" {...register('customerName')} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" placeholder="เช่น สมชาย ใจดี" />
                {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">เบอร์โทรศัพท์ *</label>
                <input type="text" {...register('phone')} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" placeholder="เช่น 0812345678" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ทะเบียนรถ *</label>
                  <input type="text" {...register('licensePlate')} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" placeholder="เช่น 1กข 1234" />
                  {errors.licensePlate && <p className="text-red-500 text-xs mt-1">{errors.licensePlate.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ยี่ห้อรถ *</label>
                  <input type="text" list="brand-list" {...register('brand', { onChange: () => setValue('model', '') })} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" placeholder="เลือกยี่ห้อ..." />
                  <datalist id="brand-list">
                    {Object.keys(modelsByBrand).map((b) => <option key={b} value={b} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">รุ่นรถ *</label>
                  <input type="text" list="model-list" disabled={!selectedBrand} {...register('model')} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-gray-400" placeholder={selectedBrand ? 'เลือกรุ่น...' : 'เลือกลิสต์ยี่ห้อก่อน'} />
                  <datalist id="model-list">
                    {availableModels.map((m) => <option key={m} value={m} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">อาการแจ้งซ่อม *</label>
                <textarea {...register('symptom')} rows={3} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" placeholder="เช่น สตาร์ตไม่ติด..." />
                {errors.symptom && <p className="text-red-500 text-xs mt-1">{errors.symptom.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">เลขไมล์ปัจจุบัน (กม.)</label>
                  <input type="number" {...register('mileage')} placeholder="ระบุหรือไม่ก็ได้" className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none placeholder:text-gray-400" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ราคาประเมินเบื้องต้น (บาท)</label>
                  <input type="number" {...register('estimatedCost')} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">สถานะเริ่มต้น</label>
                <select {...register('status')} className="w-full px-3.5 py-2 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none">
                  <option value="PENDING">รอการซ่อม</option>
                  <option value="IN_PROGRESS">กำลังซ่อม</option>
                  <option value="COMPLETED">ซ่อมเสร็จสิ้น</option>
                  <option value="CANCELLED">ยกเลิก</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all">ยกเลิก</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all">{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกใบซ่อม'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <EditRepairModal
        isOpen={isEditModalOpen}
        editingItem={editingItem}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}