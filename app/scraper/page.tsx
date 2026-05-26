'use client';

import EmbedSearcher from '@/components/embedSeacher';

export default function ScraperPage() {
  return (
    <div className="flex bg-slate-950 text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <EmbedSearcher />
      </div>
    </div>
  );
}
