"use client";

import { useCallback, useEffect, useState } from "react";

type LoadedImage = {
  src: string;
  image: HTMLImageElement;
};

export default function useLoadedImage(src: string | null) {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const handleLoad = useCallback((nextSrc: string, image: HTMLImageElement) => {
    setLoaded({ src: nextSrc, image });
  }, []);
  const handleError = useCallback(() => {
    setLoaded(null);
  }, []);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      handleLoad(src, img);
    };
    img.onerror = () => {
      if (cancelled) return;
      handleError();
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, handleLoad, handleError]);

  return src && loaded?.src === src ? loaded.image : null;
}
