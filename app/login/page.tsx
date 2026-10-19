'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/');
        router.refresh();
      } else {
        setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
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
        <div className="text-center space-y-2">
          <div className="auth-icon-badge">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">เข้าสู่ระบบจัดการงานซ่อม</h1>
          <p className="text-xs text-gray-500 font-medium">ระบบเข้าถึงสำหรับช่างและเจ้าหน้าที่ร้าน</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">ชื่อผู้ใช้งาน (Username / Email)</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="กรอกชื่อผู้ใช้งานหรืออีเมล"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="กรอกรหัสผ่าน"
                className="auth-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-btn-primary">
            {loading ? 'กำลังเข้าสู่ระบบ...' : (
              <>
                เข้าสู่ระบบ <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="text-center text-xs text-gray-500 pt-1">
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <Link href="/register" className="text-emerald-600 font-bold hover:underline">
            สมัครสมาชิก
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 text-center w-full text-xs text-gray-300 z-10">
        <p className="font-semibold drop-shadow-sm"> Moto Management System</p>
      </div>
    </div>
  );
}