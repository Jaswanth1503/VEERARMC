import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-concrete-50 flex items-center justify-center p-4">
      <div className="glass p-10 rounded-2xl max-w-md w-full text-center shadow-xl border border-white/40">
        <div className="w-16 h-16 bg-error-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8 text-error-red" />
        </div>
        <h1 className="text-3xl font-bold text-charcoal-black mb-2">403</h1>
        <h2 className="text-xl font-semibold text-charcoal-black mb-4">Access Denied</h2>
        <p className="text-concrete-500 mb-8">
          You do not have permission to view this directory or page using the credentials that you supplied.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center gap-2 bg-charcoal-black hover:bg-concrete-900 text-white font-medium py-3 px-6 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
