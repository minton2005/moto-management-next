'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Lock, User, Mail, UserCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess('สมัครสมาชิกสำเร็จ! กำลังนำคุณไปหน้าเข้าสู่ระบบ...');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-container">
      <div className="auth-overlay"></div>

      <div className="auth-card">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="auth-icon-badge">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">สมัครสมาชิกใหม่</h1>
          <p className="text-xs text-gray-500 font-medium">สร้างบัญชีสำหรับช่างซ่อมและเจ้าหน้าที่</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ชื่อ-นามสกุล (Name)</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="นายช่าง สมชาย ใจดี"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ชื่อผู้ใช้งาน (Username)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="ตั้งชื่อผู้ใช้งาน"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">อีเมล (Email - ถ้ามี)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="example@moto.com"
                className="auth-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">รหัสผ่าน (Password)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="ตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                className="auth-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn-primary mt-2">
            {loading ? 'กำลังลงทะเบียน...' : (
              <>
                ลงทะเบียนบัญชี <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-gray-500 pt-1">
          มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
          <Link href="/login" className="text-emerald-600 font-bold hover:underline">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 text-center w-full text-xs text-gray-300 z-10">
        <p className="font-semibold drop-shadow-sm">Moto Management System</p>
      </div>
    </div>
  );
}