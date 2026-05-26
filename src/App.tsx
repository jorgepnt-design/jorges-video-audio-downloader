import {
  AlertTriangle,
  Download,
  FileAudio,
  Film,
  GalleryHorizontalEnd,
  Link2,
  Loader2,
  PlayCircle,
  Search,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

type MediaType = "video" | "audio";
type Platform = "Instagram" | "TikTok" | "X/Twitter" | "Facebook" | "Unbekannt";
type GalleryFilter = "Alle" | "Videos" | "Audio" | Platform;

type VideoInfo = {
  title: string;
  sourceUrl: string;
  platform: Platform;
  thumbnail: string;
  duration: number | null;
  fileType: string;
  downloadOptions: string[];
};

type GalleryItem = {
  id: string;
  title: string;
  sourceUrl: string;
  platform: Platform;
  type: MediaType;
  thumbnail: string;
  filePath: string;
  downloadUrl?: string;
  viewUrl?: string;
  createdAt: string;
  duration: number | null;
};

const filters: GalleryFilter[] = ["Alle", "Videos", "Audio", "Instagram", "TikTok", "X/Twitter", "Facebook"];
const rightsNotice = "Bitte lade nur Inhalte herunter, an denen du die Rechte besitzt oder für die der Download erlaubt ist.";

function formatDuration(seconds: number | null) {
  if (!seconds) return "Unbekannt";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(mins / 60);
  const restMins = mins % 60;
  return hours > 0
    ? `${hours}:${String(restMins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${mins}:${String(secs).padStart(2, "0")}`;
}

function apiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unerwarteter Fehler. Bitte versuche es erneut.";
}

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "Die Anfrage konnte nicht verarbeitet werden.");
  }
  return payload as T;
}

export default function App() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<GalleryFilter>("Alle");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloadState, setDownloadState] = useState<MediaType | null>(null);
  const [progress, setProgress] = useState(0);

  const filteredGallery = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return gallery.filter((item) => {
      const matchesFilter =
        activeFilter === "Alle" ||
        (activeFilter === "Videos" && item.type === "video") ||
        (activeFilter === "Audio" && item.type === "audio") ||
        item.platform === activeFilter;
      const matchesSearch =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.platform.toLowerCase().includes(normalizedQuery);
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, gallery, query]);

  useEffect(() => {
    refreshGallery();
  }, []);

  useEffect(() => {
    if (!downloadState) {
      setProgress(0);
      return undefined;
    }

    setProgress(8);
    const timer = window.setInterval(() => {
      setProgress((current) => (current >= 88 ? current : current + Math.ceil(Math.random() * 9)));
    }, 700);
    return () => window.clearInterval(timer);
  }, [downloadState]);

  async function refreshGallery() {
    try {
      const items = await requestJson<GalleryItem[]>("/api/gallery");
      setGallery(items);
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function analyze(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setVideoInfo(null);
    setIsAnalyzing(true);
    try {
      const info = await requestJson<VideoInfo>("/api/analyze", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      setVideoInfo(info);
      setSuccess("Link wurde analysiert. Wähle jetzt Video oder MP3.");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function downloadMedia(type: MediaType) {
    if (!videoInfo) return;
    setError("");
    setSuccess("");
    setDownloadState(type);
    try {
      const endpoint = type === "video" ? "/api/download-video" : "/api/download-audio";
      const item = await requestJson<GalleryItem>(endpoint, {
        method: "POST",
        body: JSON.stringify({ url: videoInfo.sourceUrl }),
      });
      setProgress(100);
      setGallery((items) => [item, ...items.filter((existing) => existing.id !== item.id)]);
      setSuccess(type === "video" ? "Video wurde gespeichert." : "MP3 wurde gespeichert.");
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      window.setTimeout(() => setDownloadState(null), 500);
    }
  }

  async function addMetadataOnly() {
    if (!videoInfo) return;
    setError("");
    setSuccess("");
    try {
      const item = await requestJson<GalleryItem>("/api/gallery", {
        method: "POST",
        body: JSON.stringify({ info: videoInfo }),
      });
      setGallery((items) => [item, ...items]);
      setSuccess("Eintrag wurde zur Galerie hinzugefügt.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  async function deleteItem(id: string) {
    setError("");
    setSuccess("");
    try {
      await requestJson<{ ok: true }>(`/api/gallery/${id}`, { method: "DELETE" });
      setGallery((items) => items.filter((item) => item.id !== id));
      setSuccess("Medien-Eintrag wurde gelöscht.");
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  }

  return (
    <main className="min-h-screen bg-[#070a12] text-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <ShieldCheck size={14} />
              Rechte respektieren, Schutzmechanismen nicht umgehen
            </div>
            <h1 className="text-3xl font-black tracking-normal text-white sm:text-4xl lg:text-5xl">
              Jorge&apos;s Video & Audio Downloader
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{rightsNotice}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-80">
            <Metric value={gallery.length} label="Medien" />
            <Metric value={gallery.filter((item) => item.type === "video").length} label="Videos" />
            <Metric value={gallery.filter((item) => item.type === "audio").length} label="Audio" />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#0d1320] p-4 shadow-2xl shadow-black/25 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                <Link2 />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Link analysieren</h2>
                <p className="text-sm text-slate-400">Instagram, TikTok, X/Twitter und Facebook werden erkannt.</p>
              </div>
            </div>

            <form onSubmit={analyze} className="flex flex-col gap-3">
              <input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className="min-h-16 rounded-2xl border border-white/10 bg-black/30 px-4 text-base text-white shadow-inner outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70"
                placeholder="https://www.instagram.com/reel/..."
                type="url"
                inputMode="url"
                required
              />
              <button
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <PlayCircle />}
                Video analysieren
              </button>
            </form>

            {(error || success) && (
              <div
                className={`mt-4 flex gap-3 rounded-2xl border p-4 text-sm ${
                  error
                    ? "border-red-300/20 bg-red-500/10 text-red-100"
                    : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                }`}
              >
                {error ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                <span>{error || success}</span>
              </div>
            )}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0d1320] p-4 shadow-2xl shadow-black/25 sm:p-6">
            {videoInfo ? (
              <VideoCard
                info={videoInfo}
                downloadState={downloadState}
                progress={progress}
                onDownload={downloadMedia}
                onAdd={addMetadataOnly}
              />
            ) : (
              <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center">
                <Film className="mb-4 text-slate-500" size={46} />
                <h2 className="text-xl font-bold">Noch kein Video analysiert</h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                  Füge einen erlaubten öffentlichen Link ein, um Titel, Thumbnail, Plattform und Download-Optionen zu sehen.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-white/10 bg-[#0d1320] p-4 shadow-2xl shadow-black/25 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-violet-400/15 text-violet-200">
                <GalleryHorizontalEnd />
              </span>
              <div>
                <h2 className="text-xl font-bold">Download-Historie / Galerie</h2>
                <p className="text-sm text-slate-400">Gespeicherte Medien aus dem lokalen Projektordner.</p>
              </div>
            </div>
            <label className="flex min-h-12 items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 text-slate-300 lg:min-w-80">
              <Search size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                placeholder="Galerie durchsuchen"
              />
            </label>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter
                    ? "border-cyan-300 bg-cyan-300 text-slate-950"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredGallery.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredGallery.map((item) => (
                <GalleryCard key={item.id} item={item} onDelete={deleteItem} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-slate-400">
              Keine Medien für diesen Filter gefunden.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</div>
    </div>
  );
}

function VideoCard({
  info,
  downloadState,
  progress,
  onDownload,
  onAdd,
}: {
  info: VideoInfo;
  downloadState: MediaType | null;
  progress: number;
  onDownload: (type: MediaType) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/25">
        {info.thumbnail ? (
          <img src={info.thumbnail} alt="" className="aspect-video w-full object-cover" />
        ) : (
          <div className="grid aspect-video place-items-center bg-slate-900 text-slate-500">
            <Film size={44} />
          </div>
        )}
        <div className="p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge>{info.platform}</Badge>
            <Badge>{formatDuration(info.duration)}</Badge>
            <Badge>{info.fileType}</Badge>
          </div>
          <h2 className="text-2xl font-black leading-tight text-white">{info.title}</h2>
          <p className="mt-3 text-sm text-slate-400">Verfügbare Optionen: {info.downloadOptions.join(", ")}</p>
        </div>
      </div>

      {downloadState && (
        <div className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold text-cyan-100">
            <span>{downloadState === "video" ? "Video wird heruntergeladen" : "Audio wird zu MP3 konvertiert"}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/35">
            <div className="h-full rounded-full bg-cyan-300 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ActionButton disabled={!!downloadState} onClick={() => onDownload("video")} icon={<Download />} label="Video herunterladen" />
        <ActionButton disabled={!!downloadState} onClick={() => onDownload("audio")} icon={<FileAudio />} label="Audio als MP3 herunterladen" />
        <ActionButton disabled={!!downloadState} onClick={onAdd} icon={<GalleryHorizontalEnd />} label="Zur Galerie hinzufügen" />
      </div>
      <p className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">{rightsNotice}</p>
    </div>
  );
}

function Badge({ children }: { children: string }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-200">{children}</span>;
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 text-sm font-bold text-white transition hover:border-cyan-300/60 hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function GalleryCard({ item, onDelete }: { item: GalleryItem; onDelete: (id: string) => void }) {
  const fileUrl = item.downloadUrl ?? `/${item.filePath.replaceAll("\\", "/")}`;
  const viewUrl = item.viewUrl ?? fileUrl;

  async function saveToDevice() {
    if (!item.filePath) return;

    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Download konnte nicht geladen werden.");
      const blob = await response.blob();
      const extension = item.type === "audio" ? "mp3" : "mp4";
      const file = new File([blob], `${safeFileName(item.title)}.${extension}`, { type: blob.type || defaultMimeType(item.type) });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: item.title,
          text: "Medien-Datei aus Jorge's Video & Audio Downloader öffnen oder speichern.",
        });
        return;
      }

      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.alert("Die Galerie-App kann nicht direkt geöffnet werden. Öffne die Datei und nutze dann die Teilen-Funktion deines Geräts.");
    }
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-black/24 shadow-xl shadow-black/20">
      {item.thumbnail ? (
        <img src={item.thumbnail} alt="" className="aspect-video w-full object-cover" />
      ) : (
        <div className="grid aspect-video place-items-center bg-slate-900 text-slate-500">
          {item.type === "audio" ? <FileAudio size={42} /> : <Film size={42} />}
        </div>
      )}
      <div className="p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{item.platform}</Badge>
          <Badge>{item.type === "audio" ? "Audio" : "Video"}</Badge>
          <Badge>{formatDuration(item.duration)}</Badge>
        </div>
        <h3 className="line-clamp-2 min-h-14 text-lg font-black leading-tight text-white">{item.title}</h3>
        <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString("de-DE")}</p>
        <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-2">
          {item.filePath ? (
            <>
              <a
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-3 text-sm font-bold text-slate-950"
                href={viewUrl}
                target="_blank"
                rel="noreferrer"
              >
                <PlayCircle size={18} />
                Datei öffnen
              </a>
              <button
                onClick={saveToDevice}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/20"
              >
                <Share2 size={18} />
                Mit Galerie öffnen
              </button>
            </>
          ) : (
            <span className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 text-sm text-slate-400">
              Nur Metadaten
            </span>
          )}
          <button
            aria-label="Medien löschen"
            onClick={() => onDelete(item.id)}
            className="grid size-11 place-items-center rounded-2xl border border-red-300/20 bg-red-500/10 text-red-100 transition hover:bg-red-500/20"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

function safeFileName(title: string) {
  return title
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "download";
}

function defaultMimeType(type: MediaType) {
  return type === "audio" ? "audio/mpeg" : "video/mp4";
}
