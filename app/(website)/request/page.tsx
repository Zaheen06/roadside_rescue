'use client';
import RequestForm from '@/components/RequestForm';
import AuthGuard from '@/components/AuthGuard';

export default function RequestPage() {
  return (
    <AuthGuard>
      <div style={{ background: "#F1F5F9", minHeight: "100vh", padding: "40px 16px" }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <RequestForm />
        </div>
      </div>
    </AuthGuard>
  );
}