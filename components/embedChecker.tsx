'use client';
import { VideoProps } from './fetchvideos';
import ButtonCopy from '@/utils/handlecopy';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { profiles } from "@/data/profileId";

const parseYouTubeId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([A-Za-z0-9_-]{11})/, 
    /(?:youtu\.be\/)([A-Za-z0-9_-]{11})/, 
    /[?&]v=([A-Za-z0-9_-]{11})/, 
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
};

const buildWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;
const buildEmbedUrl = (videoId: string) => `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3`;

const formatDuration = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.round(seconds % 60);
  const paddedSecs = secs.toString().padStart(2, '0');
  const paddedMins = mins.toString().padStart(2, '0');
  if (hrs > 0) return `${hrs}:${paddedMins}:${paddedSecs}`;
  return `${mins}:${paddedSecs}`;
};

export default function EmbedChecker() {
  
  const [input, setInput] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [info, setInfo] = useState<{ profileId: string; title: string; author: string; provider: string } | null>(null);
  const [status, setStatus] = useState('Prêt à tester une vidéo.');
  const [error, setError] = useState('');
  const [embedResult, setEmbedResult] = useState('');
  const [checking, setChecking] = useState(false);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [durationText, setDurationText] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string>('');
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const ThumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;


  const handleCheck = async () => {
    setError('');
    setInfo(null);
    setEmbedResult('');
    setEmbedUrl(null);
    setDurationText(null);
    setStatus('Analyse de l’entrée...');

    const id = parseYouTubeId(input);
    if (!id) {
      setError("URL ou ID YouTube invalide. Essaie un lien YouTube ou l'ID de 11 caractères.");
      setStatus('Prêt à tester une vidéo.');
      return;
    }

    setVideoId(id);
    setChecking(true);
    setStatus('Vérification des infos via oEmbed...');

    try {
      const watchUrl = buildWatchUrl(id);
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`);

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`oEmbed a répondu ${response.status}: ${message || response.statusText}`);
      }

      const data = await response.json();

      setInfo({
        title: data.title ?? 'N/A',
        author: data.author_name ?? 'N/A',
        provider: data.provider_name ?? 'N/A',
        profileId: 'N/A' ,
      });

      setDurationText('En attente...');
      setEmbedUrl(buildEmbedUrl(id));
      setStatus('Infos récupérées. Test du player YouTube en cours...');
      setEmbedResult('Test en attente.');
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Erreur inconnue pendant la récupération.');
      setStatus('Impossible de récupérer les informations vidéo.');
      setEmbedUrl(null);
      setDurationText(null);
    } finally {
      setChecking(false);
    }
  };

  const sendToBackend = async () => {
    if (!videoId || !info) {
      setError("Aucune vidéo à envoyer.");
      return;
    }

    if (!selectedProfileId) {
      setError("Veuillez sélectionner un profil.");
      return;
    }

    const selectedProfile = profiles.find(p => p.id === selectedProfileId);

    const payload: VideoProps = {
      title: info.title,
      videoId: videoId,
      duration: durationText,
      miniature: ThumbnailUrl,
      profile: selectedProfile?.profile ?? info.author,
      profileId: selectedProfileId.toString(),
    };

    console.log(payload);

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("response", data);
      setStatus("Envoyé au back.");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi');
    }
  };


  return (
    <div>
        <div className=" border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/40">
          
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.32em] text-cyan-400">YouTube Embed Checker</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Teste un lien avant publication</h1>
            <p className="mt-3 max-w-2xl text-slate-400">
              Colle une URL ou un ID YouTube. L’application vérifie si la vidéo est accessible et tente de charger un embed caché.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="block w-full">
              <span className="text-sm font-medium text-slate-300">URL ou ID YouTube</span>
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/10"
              />
            </label>
            <button
              type="button"
              onClick={handleCheck}
              disabled={checking}
              className="inline-flex items-center justify-center rounded-3xl bg-cyan-500 px-6 py-3 w-42 h-12 mb-10 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? 'Vérification...' : 'Tester maintenant'}
            </button>
          </div>

          <div className="mt-8 space-y-4">
            <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
              <p className="text-sm font-semibold text-slate-200">Statut</p>
              <p className="mt-2 text-sm text-slate-300">{status}</p>
            </section>

            {error ? (
              <section className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
                <p className="font-semibold">Erreur</p>
                <p className="mt-2">{error}</p>
              </section>
            ) : null}

            {info ? (
              <section className="relative rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
                <p className="text-sm font-semibold text-slate-200">Infos vidéo</p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl bg-slate-900 p-4">
                    <dt className="text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between gap-3">
                      <span>ID Vidéo</span>
                      <ButtonCopy
                        className=""
                        datatocopy= {videoId ?? "N/A"}
                      >
                        Copier
                      </ButtonCopy>
                    </dt>
                    <dd className="mt-2 break-words text-sm text-slate-100">{videoId}</dd>
                  </div>
                  <div className="rounded-3xl bg-slate-900 p-4">
                    <dt className="text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between gap-3">
                      <span>Miniature</span>
                      <ButtonCopy 
                      className=""
                      datatocopy={ThumbnailUrl}
                      >
                        Copier
                      </ButtonCopy>
                    </dt>
                    <dd className="mt-2 break-words text-sm text-slate-100">{`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}</dd>
                  </div>
                  <div className="rounded-3xl bg-slate-900 p-4">
                    <dt className="text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between gap-3">
                      <span>Titre</span>
                      <ButtonCopy 
                      className="" 
                      datatocopy={info.title}>
                       Copier
                      </ButtonCopy>
                    </dt>
                    <dd className="mt-2 text-sm text-slate-100">{info.title}</dd>
                  </div>
                  <div className="rounded-3xl bg-slate-900 p-4">
                    <dt className="text-xs uppercase tracking-wider text-slate-500 flex items-center justify-between gap-3">
                      <span>Durée</span>

                      <ButtonCopy 
                      className=""
                      datatocopy={durationText ?? "N/A"}
                      >
                       Copier
                      </ButtonCopy>
                    </dt>
                    <dd className="mt-2 text-sm text-slate-100">{durationText ?? 'N/A'}</dd>
                  </div>
                </dl>

                {!error && (
                  <div className="mt-9 space-y-4">
                    <div>
                      <label htmlFor="profile-select" className="mb-5 mt-5 block text-sm font-medium text-slate-300">
                        Sélectionner un profil
                      </label>
                      <select
                        id="profile-select"
                        value={selectedProfileId || ''}
                        onChange={(e) => setSelectedProfileId(Number(e.target.value))}
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition duration-200 ease-in-out hover:border-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                      >
                        <option value="">Choisir un profil...</option>
                        {profiles.map((profile) => (
                          <option key={profile.id} value={profile.id} className="bg-slate-950 text-white">
                            {profile.profile}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={sendToBackend}
                      className="w-full rounded-2xl bg- px-5 py-3 text-sm cursor-pointer   font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-200 ease-in-out hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={!selectedProfileId}
                    >
                      Envoyer au back
                    </button>
                  </div>
                )}
                {copyMessage ? (
                  <p className="mt-3 text-sm text-emerald-300">{copyMessage}</p>
                ) : null}
              </section>
            ) : null}

            {videoId ? (
              <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
                <p className="text-sm font-semibold text-slate-200">Résultat du test d’embed</p>
                <p className="mt-2 text-sm text-slate-300">{embedResult || 'Le test d’embed commencera après récupération des infos.'}</p>
                <p className="mt-3 text-xs text-slate-500">URL testée : {buildEmbedUrl(videoId)}</p>
              </section>
            ) : null}
          </div>

          {embedUrl ? (
            <div className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
              <ReactPlayer
                url={embedUrl}
                playing={false}
                controls={false}
                width="1"
                height="1"
                config={{
                  youtube: {
                    playerVars: {
                      rel: 0,
                      modestbranding: 1,
                      controls: 0,
                    },
                  },
                }}
                onReady={() => {
                  setEmbedResult('Embed chargé avec succès. La vidéo peut être affichée si elle n’est pas bloquée.');
                  if (!durationText) {
                    setDurationText('Lecture en cours...');
                  }
                }}
                onDuration={(seconds) => {
                  setDurationText(formatDuration(seconds));
                }}
                onError={() => {
                  setEmbedResult('Embed bloqué ou indisponible. Le lien peut poser problème dans WordPress.');
                  setDurationText(null);
                }}
              />
            </div>
          ) : null}
        </div>
        </div>
    
  );
}
