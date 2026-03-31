"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";

type ImageWithFallbackProps = Omit<ImageProps, "onError" | "src"> & {
  src?: ImageProps["src"];
  fallback: React.ReactNode;
};

export function ImageWithFallback({
  src,
  fallback,
  alt,
  ...props
}: ImageWithFallbackProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);

  const handleError = useCallback(() => {
    setFailedSrc(src ?? null);
  }, [src]);

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  return <Image src={src} alt={alt} onError={handleError} {...props} />;
}
