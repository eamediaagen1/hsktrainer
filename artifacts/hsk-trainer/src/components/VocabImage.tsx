import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Allow-list of trusted image hosts.
 * Only URLs from these domains are rendered as <img> tags.
 * Anything else gets the text fallback instead.
 */
const ALLOWED_IMAGE_HOSTS = new Set([
  "images.unsplash.com",
  "source.unsplash.com",
  "plus.unsplash.com",
]);

function isSafeImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return ALLOWED_IMAGE_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

type ImageStatus = "loading" | "loaded" | "error";

interface VocabImageProps {
  imageUrl: string;
  /** Accessible description — should be the English meaning of the word */
  alt: string;
  /** Chinese word shown in the fallback card */
  word?: string;
  /** Visual size variant */
  size?: "thumb" | "card" | "hero";
  className?: string;
}

/**
 * Displays a vocabulary-associated image with:
 * - Security: only approved hostnames are rendered
 * - Performance: lazy + async decoding, stable aspect-ratio wrapper to prevent layout shift
 * - UX: skeleton while loading, icon+text fallback on error or invalid URL
 * - Accessibility: descriptive alt text always present
 */
export function VocabImage({
  imageUrl,
  alt,
  word,
  size = "card",
  className,
}: VocabImageProps) {
  const [status, setStatus] = useState<ImageStatus>("loading");

  const safe = isSafeImageUrl(imageUrl);

  const wrapperCls = cn(
    "relative overflow-hidden rounded-2xl bg-muted shrink-0",
    size === "thumb" && "w-14 h-14 rounded-xl",
    size === "card"  && "w-full aspect-square",
    size === "hero"  && "w-full aspect-[4/3]",
    className
  );

  /* ── Fallback (bad URL or load error) ── */
  const Fallback = () => (
    <div className={cn(wrapperCls, "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border")}>
      <ImageOff className="w-6 h-6 text-muted-foreground/40 shrink-0" />
      {word && (
        <span className="font-serif text-foreground/50 text-sm select-none leading-none">
          {word}
        </span>
      )}
    </div>
  );

  if (!safe) return <Fallback />;

  return (
    <div className={wrapperCls}>
      {/* Skeleton — visible while loading */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-muted animate-pulse" aria-hidden="true" />
      )}

      <img
        src={imageUrl}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          status === "loaded" ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Error overlay — replaces image in place */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
          <ImageOff className="w-6 h-6 text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground text-center px-3 leading-tight">
            {alt}
          </span>
        </div>
      )}
    </div>
  );
}
