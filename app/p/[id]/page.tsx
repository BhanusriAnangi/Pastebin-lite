import { prisma } from '@/lib/db';
import { getNow } from '@/lib/utils';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

export default async function ViewPaste({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const headersList = await headers();
  const now = getNow(headersList as any);

  // Reuse transaction logic to ensure atomic view counting
  const paste = await prisma.$transaction(async (tx: any) => {
    const p = await tx.paste.findUnique({ where: { id } });

    if (!p) return null;

    // Check constraints
    if (p.expires_at && p.expires_at < now) return null;
    if (p.max_views && p.view_count >= p.max_views) return null;

    // Increment
    return await tx.paste.update({
      where: { id },
      data: { view_count: { increment: 1 } }
    });
  });

  if (!paste) {
    notFound(); 
  }

  // Format date for better readability
  const formattedDate = new Date(paste.created_at).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-6">
          <a 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Create New Paste
          </a>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            Pastebin<span className="text-blue-600">Lite</span>
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* Card Header (Metadata) */}
          <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-4 flex flex-wrap gap-4 items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                ${paste.max_views 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-green-50 text-green-700 border-green-200'
                }`}>
                {paste.max_views ? 'Limited Views' : 'Unlimited Views'}
              </span>
              
              <div className="flex items-center gap-1 text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-xs font-mono">
                 <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {paste.view_count} {paste.max_views ? `/ ${paste.max_views}` : ''}
              </div>
            </div>
          </div>

          {/* Paste Content */}
          <div className="relative group">
            <pre className="p-6 whitespace-pre-wrap break-all font-mono text-sm text-gray-800 bg-white leading-relaxed overflow-x-auto min-h-[200px]">
              {paste.content}
            </pre>
            
            {/* Optional visual cue that this is code/text */}
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
               {/* Could place a copy button here in future improvements */}
            </div>
          </div>
          
          {/* Footer (Expiry Info) */}
          {paste.expires_at && (
             <div className="bg-red-50 px-6 py-2 border-t border-red-100 text-xs text-red-600 flex items-center justify-center">
                <span>⚠️ This paste expires on {new Date(paste.expires_at).toLocaleString()}</span>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}