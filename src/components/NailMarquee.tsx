"use client";

import Image from "next/image";

const marqueeImages = [
  "/images/gallery-1.jpg",
  "/images/gallery-2.jpg",
  "/images/gallery-3.jpg",
  "/images/gallery-4.jpg",
  "/images/gallery-5.jpg",
  "/images/gallery-6.jpg",
  "/images/gallery-7.jpg",
  "/images/gallery-8.jpg",
  "/images/gallery-9.jpg",
  "/images/gallery-10.jpg",
];

export default function NailMarquee() {
  const allImages = [...marqueeImages, ...marqueeImages, ...marqueeImages, ...marqueeImages];

  return (
    <section className="w-full overflow-hidden py-6 bg-pink-50/50">
      <div className="flex animate-marquee-fast gap-3 w-max hover:[animation-play-state:paused]">
        {allImages.map((src, i) => (
          <div
            key={i}
            className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg border-2 border-white hover:scale-105 transition-transform"
          >
            <Image
              src={src}
              alt="Nail art"
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
