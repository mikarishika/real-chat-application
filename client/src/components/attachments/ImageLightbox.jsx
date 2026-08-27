import React from "react";
import { ChevronLeft, ChevronRight, Download, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ImageLightbox = ({
  images = [],
  activeIndex = 0,
  thumbnailImages = images,
    thumbnailIndex = activeIndex,
  onChange,
  onThumbnailChange,
  onDelete,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [areThumbnailsVisible, setAreThumbnailsVisible] = useState(true);
  const dragRef = useRef(null);
  const thumbnailTimeoutRef = useRef(null);

  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setAreThumbnailsVisible(true);
  }, [activeIndex]);

  useEffect(() => () => clearTimeout(thumbnailTimeoutRef.current), []);

  if (!images.length) return null;

  const currentIndex = Math.max(0, Math.min(activeIndex, images.length - 1));
  // const canGoPrevious = currentIndex < images.length - 1;
  const canGoPrevious = currentIndex > 0;
  const canGoNext =currentIndex < images.length - 1 ;

  const handleMouseMove = () => {
    setAreThumbnailsVisible(true);
    clearTimeout(thumbnailTimeoutRef.current);
    thumbnailTimeoutRef.current = setTimeout(() => {
      setAreThumbnailsVisible(false);
    }, 1500);
  };

  const handlePointerDown = (event) => {
    if (zoom <= 1 || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      position,
    };
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current) return;
    setPosition({
      x: dragRef.current.position.x + event.clientX - dragRef.current.startX,
      y: dragRef.current.position.y + event.clientY - dragRef.current.startY,
    });
  };

  const stopDragging = (event) => {
    if (dragRef.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-black/75 p-6 backdrop-blur-sm"
      onClick={onClose}
      onMouseMove={handleMouseMove}
    >
      <button
        type="button"
        className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label="Close image"
      >
        <X size={22} />
      </button>
      {canGoNext && (
        <button
          type="button"
          className="absolute left-5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(event) => {
            event.stopPropagation();
            onChange(currentIndex + 1);
          }}
          aria-label="Next image"
        >
          <ChevronLeft size={26} />
        </button>
      )}
      <div
        className={`relative z-10 flex h-[calc(100vh-170px)] w-[92vw] items-center justify-center overflow-hidden rounded-lg ${zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onWheel={(event) => {
          setZoom((currentZoom) => {
            const nextZoom = Math.min(4, Math.max(1, currentZoom + (event.deltaY < 0 ? 0.2 : -0.2)));
            if (nextZoom === 1) setPosition({ x: 0, y: 0 });
            return nextZoom;
          });
        }}
      >
        <img
          src={images[currentIndex]}
          alt="Expanded attachment"
          className="max-h-full max-w-full select-none rounded-lg object-contain shadow-2xl transition-transform duration-150 cursor-pointer"
          draggable="false"
          style={{ transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`, transformOrigin: "center" }}
          onClick={(event) => event.stopPropagation()}
        />
      </div>
      <div
        className="absolute bottom-5 right-5 flex items-center gap-2 rounded-lg bg-transparent p-2 text-white"
        onClick={(event) => event.stopPropagation()}
      >
        <a
          href={images[currentIndex]}
          download
          className="flex size-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label="Download image"
        >
          <Download size={18} />
        </a>
        {onDelete && (
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-full bg-red-400/20 text-red-200 hover:bg-red-400/35"
            onClick={() => onDelete(images[currentIndex], currentIndex)}
            aria-label="Delete image"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      {canGoPrevious && (
        <button
          type="button"
          className="absolute right-5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          onClick={(event) => {
            event.stopPropagation();
            onChange(currentIndex - 1);
          }}
          aria-label="Previous image"
        >
          <ChevronRight size={26} />
        </button>
      )}
      {thumbnailImages.length > 1 && (
        <div
          className="absolute bottom-5 left-[calc(50%-50px)] z-20 flex max-w-[80vw] flex-row-reverse gap-2 overflow-x-auto rounded-lg  p-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            opacity: areThumbnailsVisible ? 1 : 0,
            pointerEvents: areThumbnailsVisible ? "auto" : "none",
            transition: areThumbnailsVisible ? "opacity 180ms ease-out" : "opacity 500ms ease-in-out",
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {thumbnailImages.map((image, index) => (
            <button
              type="button"
              key={image}
              onClick={() => onThumbnailChange(index)}
              className={`size-20 shrink-0 overflow-hidden rounded-md border-2 ${index === thumbnailIndex  ? "border-white" : "border-transparent opacity-60"}`}
            >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightbox;
