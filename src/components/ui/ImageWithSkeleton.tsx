"use client";

import { useState } from "react";
import Image, { ImageProps } from "next/image";

interface ImageWithSkeletonProps extends Omit<ImageProps, "onLoad"> {
  skeletonClassName?: string;
}

export const ImageWithSkeleton = ({
  src,
  alt,
  className = "",
  skeletonClassName = "",
  ...props
}: ImageWithSkeletonProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-full">
      {/* Skeleton - fades out when image loads */}
      <div
        className={`absolute inset-0 bg-gradient-to-r from-soft-pink/50 via-white/80 to-soft-pink/50 transition-opacity duration-500 ${
          isLoading ? "opacity-100" : "opacity-0"
        } ${skeletonClassName}`}
        style={{
          backgroundSize: "200% 100%",
          animation: isLoading ? "shimmer 1.5s ease-in-out infinite" : "none",
        }}
      />

      {/* Actual Image */}
      <Image
        src={src}
        alt={alt}
        className={`transition-opacity duration-500 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        {...props}
      />
    </div>
  );
};