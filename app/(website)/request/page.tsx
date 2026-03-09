'use client';
import RequestForm from '@/components/RequestForm';
import AuthGuard from '@/components/AuthGuard';

export default function RequestPage() {
  return (
    <AuthGuard>
      <div style={{ background: "#F8FAFC", minHeight: "100vh", padding: "60px 16px 80px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <RequestForm />
        </div>
      </div>
    </AuthGuard>
  );
}