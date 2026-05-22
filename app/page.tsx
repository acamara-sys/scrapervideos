'use client';

import EmbedChecker from '@/components/embedChecker';
import EmbedSearcher from '@/components/embedSeacher';
import { useState } from 'react';
import ReactPlayer from 'react-player';

export default function Home() {
  
  return (

   <div className="flex bg-slate-950 text-slate-100 space-y-12">
      <div className=" mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        <EmbedChecker />
        <EmbedSearcher />
      </div>
  </div>
  );

};

