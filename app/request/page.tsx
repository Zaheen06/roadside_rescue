'use client';
import RequestForm from '@/components/RequestForm';
import AuthGuard from '@/components/AuthGuard';

export default function RequestPage() {
  return (
    <AuthGuard>
      <div className="py-8">
        <RequestForm />
      </div>
    </AuthGuard>
  );
}