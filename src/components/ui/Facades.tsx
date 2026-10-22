"use client";
/** Click-to-load facades: no YouTube or Google Maps iframe is loaded until the visitor asks. */
import { useState } from "react";
import { Icon } from "./Icons";

export function VideoFacade({ id, title, label, poster }: { id: string; title: string; label: string; poster?: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[28px] bg-ink">
      {on ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="group absolute inset-0 flex items-center justify-center" aria-label={`${label}: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-105"
          />
          <span className="relative inline-flex items-center gap-3 rounded-full bg-red px-6 py-4 font-semibold text-white">
            <Icon name="play" size={22} />
            {label}
          </span>
        </button>
      )}
    </div>
  );
}

export function MapFacade({ src, title, label }: { src: string; title: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="contours relative aspect-[4/3] w-full overflow-hidden rounded-[22px] border border-[var(--line)] bg-paper-2">
      {on ? (
        <iframe className="absolute inset-0 h-full w-full" src={src} title={title} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      ) : (
        <button type="button" onClick={() => setOn(true)} className="absolute inset-0 flex items-center justify-center">
          <span className="btn btn-ink">
            <Icon name="pin" size={20} /> {label}
          </span>
        </button>
      )}
    </div>
  );
}
