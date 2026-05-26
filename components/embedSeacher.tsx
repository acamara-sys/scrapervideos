'use client';

import { useState } from 'react';
import { profiles } from '@/data/profileId';

type VideoItem = {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  duration: string | null;
};

type SelectedVideo = VideoItem & {
  profileId: number | null;
  collection_sesport: boolean;
  genre_football: boolean;
};

type PublishStatus = 'idle' | 'loading' | 'done' | 'error';

export default function EmbedSearcher() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState<SelectedVideo[]>([]);
  const [publishStatus, setPublishStatus] = useState<Record<string, PublishStatus>>({});

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setSearchError('');
    setResults([]);
    try {
      const res = await fetch(`/api/youtube?keyword=${encodeURIComponent(keyword.trim())}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.items || []);
    } catch (e: any) {
      setSearchError(e.message || 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (id: string) => selected.some(v => v.id === id);

  const toggleSelect = (video: VideoItem) => {
    if (isSelected(video.id)) {
      setSelected(prev => prev.filter(v => v.id !== video.id));
    } else {
      setSelected(prev => [...prev, {
        ...video,
        profileId: null,
        collection_sesport: true,
        genre_football: true,
      }]);
    }
  };

  const updateSelected = (id: string, patch: Partial<SelectedVideo>) => {
    setSelected(prev => prev.map(v => v.id === id ? { ...v, ...patch } : v));
  };

  const exportCSV = () => {
    const escape = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
    const headers = ['videoId', 'title', 'channelTitle', 'thumbnail', 'duration', 'profile', 'profileId', 'collection_sesport', 'genre_football'];
    const rows = selected.map(v => [
      v.id,
      escape(v.title),
      escape(v.channelTitle),
      v.thumbnail,
      v.duration ?? '',
      escape(profiles.find(p => p.id === v.profileId)?.profile ?? ''),
      v.profileId ?? '',
      v.collection_sesport ? 'oui' : 'non',
      v.genre_football ? 'oui' : 'non',
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `videos-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const publishVideo = async (video: SelectedVideo) => {
    const profile = profiles.find(p => p.id === video.profileId);
    setPublishStatus(prev => ({ ...prev, [video.id]: 'loading' }));
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: video.title,
          videoId: video.id,
          duration: video.duration ?? '',
          miniature: video.thumbnail,
          profile: profile?.profile ?? video.channelTitle,
          profileId: video.profileId?.toString() ?? '',
          collection_sesport: video.collection_sesport,
          genre_football: video.genre_football,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPublishStatus(prev => ({ ...prev, [video.id]: 'done' }));
    } catch {
      setPublishStatus(prev => ({ ...prev, [video.id]: 'error' }));
    }
  };

  const publishAll = async () => {
    for (const video of selected) {
      if (publishStatus[video.id] !== 'done') {
        await publishVideo(video);
      }
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.32em] text-cyan-400">Scraper YouTube</p>
        <h2 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Recherche par mots-clés</h2>
        <p className="mt-3 max-w-2xl text-slate-400">
          Recherche des vidéos YouTube, sélectionne celles qui t'intéressent et exporte-les en CSV ou publie-les directement.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3 mb-8">
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Manchester United, FC Porto..."
          className="flex-1 rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>

      {/* Search error */}
      {searchError && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {searchError}
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="mb-10">
          <p className="mb-4 text-sm font-medium text-slate-400">
            {results.length} vidéos trouvées — clique pour sélectionner
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {results.map(video => {
              const sel = isSelected(video.id);
              return (
                <button
                  key={video.id}
                  onClick={() => toggleSelect(video)}
                  className={`relative overflow-hidden rounded-2xl border text-left transition ${
                    sel
                      ? 'border-cyan-400 ring-2 ring-cyan-500/30'
                      : 'border-slate-700 hover:border-slate-500'
                  } bg-slate-950`}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="h-full w-full object-cover"
                    />
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
                        {video.duration}
                      </span>
                    )}
                    {sel && (
                      <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/20">
                        <span className="rounded-full bg-cyan-500 p-1.5 text-slate-950">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-xs font-medium text-white leading-snug">{video.title}</p>
                    <p className="mt-1 text-xs text-slate-500 truncate">{video.channelTitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected videos panel */}
      {selected.length > 0 && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold text-white">
              {selected.length} vidéo{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}
            </h3>
            <div className="flex gap-3">
              <button
                onClick={exportCSV}
                className="rounded-2xl border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400 hover:text-white"
              >
                Exporter CSV
              </button>
              <button
                onClick={publishAll}
                className="rounded-2xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
              >
                Publier tout
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {selected.map(video => {
              const status = publishStatus[video.id] ?? 'idle';
              return (
                <div key={video.id} className="flex gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
                  {/* Thumbnail */}
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-16 w-28 flex-shrink-0 rounded-lg object-cover"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm font-medium text-white truncate">{video.title}</p>
                    <p className="text-xs text-slate-500">
                      {video.channelTitle}
                      {video.duration && ` · ${video.duration}`}
                      {` · ID: ${video.id}`}
                    </p>

                    <div className="flex flex-wrap gap-3 items-center">
                      <select
                        value={video.profileId ?? ''}
                        onChange={e => updateSelected(video.id, { profileId: e.target.value ? Number(e.target.value) : null })}
                        className="flex-1 min-w-[160px] rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white outline-none focus:border-cyan-400"
                      >
                        <option value="">Choisir un profil...</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>{p.profile}</option>
                        ))}
                      </select>

                      <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={video.collection_sesport}
                          onChange={e => updateSelected(video.id, { collection_sesport: e.target.checked })}
                          className="accent-cyan-500"
                        />
                        Sesport
                      </label>

                      <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={video.genre_football}
                          onChange={e => updateSelected(video.id, { genre_football: e.target.checked })}
                          className="accent-cyan-500"
                        />
                        Football
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end justify-between gap-2">
                    <button
                      onClick={() => toggleSelect(video)}
                      className="text-xs text-slate-500 hover:text-red-400 transition"
                    >
                      Retirer
                    </button>
                    <button
                      onClick={() => publishVideo(video)}
                      disabled={status === 'loading' || !video.profileId}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                        status === 'done'
                          ? 'bg-emerald-600/20 text-emerald-400 cursor-default'
                          : status === 'error'
                          ? 'bg-red-600/20 text-red-400'
                          : status === 'loading'
                          ? 'bg-slate-700 text-slate-400 cursor-wait'
                          : 'bg-sky-600 text-white hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {status === 'done'
                        ? 'Publié'
                        : status === 'error'
                        ? 'Erreur'
                        : status === 'loading'
                        ? 'Envoi...'
                        : 'Publier'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
