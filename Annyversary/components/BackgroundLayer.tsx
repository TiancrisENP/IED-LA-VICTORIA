"use client";

import { useEffect, useRef, useState } from "react";
import type { Background } from "@/lib/months";

type Props = {
  initial: Background;
};

export default function BackgroundLayer({ initial }: Props) {
  const [front, setFront] = useState(0);
  const [slots, setSlots] = useState<[Background, Background]>([
    initial,
    initial,
  ]);
  const frontRef = useRef(0);
  const currentSrc = useRef(initial.src);

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>("[data-bg-src]");

    const swapTo = (next: Background) => {
      if (next.src === currentSrc.current) return;
      currentSrc.current = next.src;
      const back = 1 - frontRef.current;
      setSlots((current) => {
        const nextSlots: [Background, Background] = [current[0], current[1]];
        nextSlots[back] = next;
        return nextSlots;
      });
      frontRef.current = back;
      setFront(back);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const src = visible.target.getAttribute("data-bg-src");
        const type = visible.target.getAttribute("data-bg-type");
        if (!src || (type !== "video" && type !== "image")) return;

        swapTo({ type, src });
      },
      {
        threshold: [0.2, 0.4, 0.6, 0.8],
        rootMargin: "-15% 0px -15% 0px",
      },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-root" aria-hidden="true">
      {slots.map((media, index) => (
        <BackgroundMedia
          key={`${index}-${media.src}`}
          media={media}
          active={front === index}
        />
      ))}
      <div className="bg-wash" />
      <div className="bg-vignette" />
      <div className="bg-grain" />
      <div className="bg-dust" />
    </div>
  );
}

function BackgroundMedia({
  media,
  active,
}: {
  media: Background;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active, media.src]);

  if (media.type === "video") {
    return (
      <video
        ref={videoRef}
        className={`bg-media${active ? " is-active" : ""}`}
        src={media.src}
        muted
        loop
        playsInline
        autoPlay={active}
        preload="auto"
      />
    );
  }

  return (
    // Decorative full-bleed background; alt stays empty on purpose.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`bg-media${active ? " is-active" : ""}`}
      src={media.src}
      alt=""
    />
  );
}
