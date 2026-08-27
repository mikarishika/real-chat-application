import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, FileText, Music, Pause, Play } from "lucide-react";
import heic2any from "heic2any";
import { parseBlob } from "music-metadata-browser";

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "File";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileExtension = (name = "") => {
  const extension = name.split(".").pop();
  return extension && extension !== name ? extension.toUpperCase() : "FILE";
};

const isImageFile = (file = {}) => {
  if (!file) return false;
  const imageExtensions = /\.(avif|bmp|gif|heic|heif|jpe?g|png|webp)$/i;
  return file.type?.startsWith("image/") || imageExtensions.test(file.name || file.url || "");
};

const useDisplayImageUrls = (sourceUrls, attachmentKey) => {
  const heicFlags = useMemo(
    () => attachmentKey.split(";").map((item) => /\.(heic|heif)(?:\||$)/i.test(item)),
    [attachmentKey],
  );
  const emptyHeicUrls = useMemo(
    () => sourceUrls.map((url, index) => (heicFlags[index] ? "" : url)),
    [sourceUrls, heicFlags],
  );
  const [displayUrls, setDisplayUrls] = useState(emptyHeicUrls);

  useEffect(() => {
    let cancelled = false;
    const objectUrls = [];

    const convertHeicImages = async () => {
      const nextUrls = await Promise.all(sourceUrls.map(async (url, index) => {
        if (!heicFlags[index]) return url;

        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const converted = await heic2any({ blob, toType: "image/jpeg", quality: 0.9 });
          const jpegBlob = Array.isArray(converted) ? converted[0] : converted;
          const objectUrl = URL.createObjectURL(jpegBlob);
          objectUrls.push(objectUrl);
          return objectUrl;
        } catch {
          return "";
        }
      }));

      if (!cancelled) setDisplayUrls(nextUrls);
    };

    setDisplayUrls(emptyHeicUrls);
    convertHeicImages();
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [attachmentKey, emptyHeicUrls, heicFlags, sourceUrls]);

  return displayUrls;
};

const ImageGallery = ({ attachments, onImageClick }) => {
  const attachmentKey = attachments
    .map((item) => `${item.url}|${item.name || ""}`)
    .join(";");
  const sourceUrls = useMemo(
    () => attachmentKey.split(";").map((item) => resolveMediaUrl(item.split("|")[0])),
    [attachmentKey],
  );
  const imageUrls = useDisplayImageUrls(sourceUrls, attachmentKey);
  const imageLayout = getImageLayout(attachments.length);

  return (
    <div
      className={`grid max-w-[360px] overflow-hidden rounded-lg ${imageLayout.className}`}
      style={imageLayout.style}
    >
      {attachments.map((item, index) => (
        <button
          type="button"
          key={`${item.url}-${index}`}
          onClick={() => onImageClick(imageUrls, index)}
          className={`group relative min-h-0 overflow-hidden bg-black/20 ${getImageItemClass(attachments.length, index)}`}
          style={imageLayout.itemStyles?.[index]}
        >
          {imageUrls[index] ? (
            <img
              src={imageUrls[index]}
              alt={item.name || "Image attachment"}
              className="size-full object-cover object-center transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <span className="flex size-full items-center justify-center text-xs text-white/60">Loading image...</span>
          )}
        </button>
      ))}
    </div>
  );
};

const SingleImageAttachment = ({ attachment, onImageClick }) => {
  const sourceUrls = useMemo(() => [resolveMediaUrl(attachment.url)], [attachment]);
  const imageUrl = useDisplayImageUrls(sourceUrls, `${attachment.url}|${attachment.name || ""}`)[0];

  return (
    <button
      type="button"
      onClick={() => onImageClick([imageUrl], 0)}
      className="block max-h-72 max-w-[280px] cursor-zoom-in overflow-hidden rounded-md p-0"
      aria-label="Open image"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={attachment.name || "Image attachment"}
          className="max-h-72 max-w-[280px] object-contain object-center"
        />
      ) : (
        <span className="flex h-40 w-56 items-center justify-center text-xs text-white/60">Loading image...</span>
      )}
    </button>
  );
};

const DocumentAttachment = ({ attachment, fileUrl }) => {
  const isPdf = attachment.type === "application/pdf" || /\.pdf$/i.test(attachment.name || "");
  const extension = getFileExtension(attachment.name);

  return (
    <div className="flex w-[280px] items-center gap-3 rounded-xl bg-black/20 p-2 text-white">
      <div className={`flex size-12 shrink-0 flex-col items-center justify-center rounded-lg ${isPdf ? "bg-red-400/80" : "bg-white/15"}`}>
        <FileText size={22} />
        <span className="mt-0.5 text-[8px] font-bold tracking-wide">{extension}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold">{attachment.name || "Document"}</div>
        <div className="mt-1 text-[10px] text-white/55">{formatFileSize(attachment.size)}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex size-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Open document"
        >
          <ExternalLink size={14} />
        </a>
        <a
          href={fileUrl}
          download={attachment.name}
          className="flex size-7 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Download document"
        >
          <Download size={14} />
        </a>
      </div>
    </div>
  );
};

const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:3001" : "";
  return `${backendUrl}${url.startsWith("/") ? url : `/${url}`}`;
};

const getImageLayout = (imageCount) => {
  if (imageCount === 1) {
    return { className: "aspect-[4/3] grid-cols-1", rows: 1 };
  }
  if (imageCount === 2) {
    return { className: "aspect-[4/3] grid-cols-2", rows: 1 };
  }
  if (imageCount === 3) {
    return { className: "aspect-[3/2] grid-cols-[2fr_1fr] grid-rows-2", rows: 2 };
  }
  if (imageCount === 4) {
    return { className: "aspect-square grid-cols-2 grid-rows-2", rows: 2 };
  }
  if (imageCount === 5) {
    return {
      className: "aspect-[4/5] grid-cols-2 grid-rows-3",
      rows: 3,
      itemStyles: [
        { gridColumn: "1", gridRow: "1" },
        { gridColumn: "2", gridRow: "1" },
        { gridColumn: "1", gridRow: "2 / span 2" },
        { gridColumn: "2", gridRow: "2" },
        { gridColumn: "2", gridRow: "3" },
      ],
    };
  }

  const rows = Math.ceil(imageCount / 3);
  return {
    className: "grid-cols-3",
    rows,
    style: {
      aspectRatio: `3 / ${rows}`,
      gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
    },
  };
};

const getImageItemClass = (imageCount, index) => {
  if (imageCount === 3 && index === 0) return "row-span-2";
  return "";
};

const AudioAttachment = ({ attachment, fileUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [embeddedCoverUrl, setEmbeddedCoverUrl] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    const loadEmbeddedCover = async () => {
      if (attachment.coverUrl || attachment.thumbnailUrl) return;
      try {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const metadata = await parseBlob(blob);
        const picture = metadata.common.picture?.[0];
        if (!picture || cancelled) return;

        objectUrl = URL.createObjectURL(new Blob([picture.data], { type: picture.format }));
        setEmbeddedCoverUrl(objectUrl);
      } catch {
        // Some audio formats do not contain readable artwork.
      }
    };

    loadEmbeddedCover();
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.coverUrl, attachment.thumbnailUrl, fileUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const loadDuration = () => setDuration(audio.duration);
    const finish = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", loadDuration);
    audio.addEventListener("ended", finish);
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", loadDuration);
      audio.removeEventListener("ended", finish);
    };
  }, []);

  const togglePlayback = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        setAudioError(false);
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback failed:", error);
        setAudioError(true);
        setIsPlaying(false);
      }
    }
  };

  const seek = (event) => {
    const nextTime = Number(event.target.value);
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const explicitCoverUrl = attachment.coverUrl || attachment.thumbnailUrl;
  const coverUrl = explicitCoverUrl ? resolveMediaUrl(explicitCoverUrl) : embeddedCoverUrl;
  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex w-[280px] items-center gap-3 rounded-xl bg-black/25 p-2 text-white">
      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-fuchsia-400/80 via-indigo-500/80 to-slate-900">
        {coverUrl ? (
          <img src={coverUrl} alt="Music cover" className="size-full object-cover" />
        ) : (
          <Music className="absolute inset-0 m-auto text-white/90" size={24} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold">{attachment.name || "Audio message"}</div>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlayback}
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 hover:bg-white/80 disabled:opacity-50"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
            disabled={audioError}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={seek}
            style={{ background: `linear-gradient(to right, #fff ${progress}%, rgba(255,255,255,.25) ${progress}%)` }}
            className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full"
          />
          <span className="shrink-0 text-[10px] text-white/60">{formatTime(currentTime)}</span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={fileUrl}
        preload="metadata"
        crossOrigin="anonymous"
        onError={() => setAudioError(true)}
        className="hidden"
      />
    </div>
  );
};

const AttachmentRenderer = ({ attachment, onImageClick }) => {
  if (!attachment) return null;

  if (Array.isArray(attachment)) {
    const imageAttachments = attachment.filter(isImageFile);
    const otherAttachments = attachment.filter((item) => !isImageFile(item));

    return (
      <div className="space-y-1">
        {imageAttachments.length > 0 && (
          <ImageGallery attachments={imageAttachments} onImageClick={onImageClick} />
        )}
        {otherAttachments.map((item, index) => (
          <AttachmentRenderer key={`${item.url}-${index}`} attachment={item} onImageClick={onImageClick} />
        ))}
      </div>
    );
  }

  const fileType = attachment.type || "";
  const fileUrl = resolveMediaUrl(attachment.url);

  if (isImageFile(attachment)) {
    return <SingleImageAttachment attachment={attachment} onImageClick={onImageClick} />;
  }

  if (fileType.startsWith("video/")) {
    return (
      <video
        controls
        src={fileUrl}
        className="max-h-64 max-w-[280px] rounded-md"
      />
    );
  }

  if (fileType.startsWith("audio/")) {
    return <AudioAttachment attachment={attachment} fileUrl={fileUrl} />;
  }

  return <DocumentAttachment attachment={attachment} fileUrl={fileUrl} />;
};

export default AttachmentRenderer;
