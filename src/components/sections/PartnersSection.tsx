"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { readMotionGate, MEDIA } from "@/lib/motion";
import Image from "next/image";

const rows = [
  [
    { name: "Telcat", src: "/assets/sections/partners/telcat.png", width: 327, height: 85 },
    { name: "Volksbank", src: "/assets/sections/partners/volksbank.png", width: 314, height: 72 },
    {
      name: "Daimler Truck",
      src: "/assets/sections/partners/daimler-truck.png",
      width: 632,
      height: 113
    },
    {
      name: "Schubert Motors",
      src: "/assets/sections/partners/schubert-motors.png",
      width: 1567,
      height: 364
    }
  ],
  [
    { name: "DMB", src: "/assets/sections/partners/dmb.png", width: 1056, height: 264 },
    {
      name: "ProvenExpert",
      src: "/assets/sections/partners/proven-expert.png",
      width: 600,
      height: 91
    },
    { name: "Senden", src: "/assets/sections/partners/senden.png", width: 344, height: 64 },
    { name: "b4it", src: "/assets/sections/partners/b4it.png", width: 1024, height: 435 }
  ],
  [
    { name: "VDV", src: "/assets/sections/partners/vdv.png", width: 888, height: 153 },
    {
      name: "Swisspor",
      src: "/assets/sections/partners/swisspor.png",
      width: 1280,
      height: 365
    },
    {
      name: "BMW Motorsport",
      src: "/assets/sections/partners/bmw-motorsport.png",
      width: 824,
      height: 152
    },
    { name: "HSB", src: "/assets/sections/partners/hsb.png", width: 242, height: 65 }
  ],
  [
    {
      name: "Krammer",
      src: "/assets/sections/partners/krammer.png",
      width: 1182,
      height: 360
    },
    { name: "Point S", src: "/assets/sections/partners/point-s.png", width: 732, height: 201 },
    { name: "Metzger", src: "/assets/sections/partners/metzger.png", width: 283, height: 170 },
    { name: "R+V", src: "/assets/sections/partners/rv.png", width: 304, height: 128 },
    {
      name: "Reiseland",
      src: "/assets/sections/partners/reiseland.png",
      width: 3023,
      height: 758
    }
  ]
];

export default function PartnersSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const rowsRef = useRef<HTMLDivElement | null>(null);
  const rowElsRef = useRef<Array<HTMLDivElement | null>>([]);

  useGSAP(
    () => {
      if (!sectionRef.current || !rowsRef.current) return;

      const { prefersReducedMotion } = readMotionGate();

      if (prefersReducedMotion) {
        gsap.set(rowsRef.current, { yPercent: 0 });
        rowElsRef.current.forEach((rowEl) => {
          if (rowEl) gsap.set(rowEl, { scale: 1 });
        });
        return;
      }

      const mm = gsap.matchMedia();

      mm.add(MEDIA.lgUp, () => {
        gsap.set(rowsRef.current, {
          yPercent: 0,
          clearProps: "transform,willChange"
        });

        rowElsRef.current.forEach((rowEl) => {
          if (!rowEl) return;
          const duplicateRow = rowEl.querySelector<HTMLElement>(".partners-row-duplicate");
          if (duplicateRow) {
            gsap.set(duplicateRow, { display: "none" });
          }

          gsap.fromTo(
            rowEl,
            { scale: 0.7, opacity: 0, transformOrigin: "center center" },
            {
              scale: 1,
              opacity: 1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: rowEl,
                start: "top bottom",
                end: "top 70%",
                scrub: true,
                invalidateOnRefresh: true
              }
            }
          );
        });
      });

      mm.add(MEDIA.belowLg, () => {
        gsap.set(rowsRef.current, {
          yPercent: 0,
          clearProps: "transform,willChange"
        });

        rowElsRef.current.forEach((rowEl, rowIndex) => {
          if (!rowEl) return;
          const duplicateRow = rowEl.querySelector<HTMLElement>(".partners-row-duplicate");
          if (duplicateRow) {
            gsap.set(duplicateRow, { display: "flex" });
          }

          gsap.set(rowEl, {
            scale: 1,
            opacity: 1
          });

          const duration = 30 + (rowIndex % 3) * 2;
          const fromX = rowIndex % 2 === 0 ? 0 : -50;
          const toX = rowIndex % 2 === 0 ? -50 : 0;

          gsap.fromTo(
            rowEl,
            { xPercent: fromX },
            {
              xPercent: toX,
              duration,
              ease: "none",
              repeat: -1
            }
          );
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] overflow-hidden bg-midnight px-0 py-10 sm:py-12 lg:px-16 lg:py-64 flex items-center justify-center"
    >
      <div className="content-wrap flex h-full items-center justify-center">
        <div ref={rowsRef} className="flex w-full flex-col items-center justify-center gap-16">
          {rows.map((row, rowIndex) => (
            <div key={`row-${rowIndex}`} className="w-full overflow-hidden lg:overflow-visible">
              <div
                ref={(el) => {
                  rowElsRef.current[rowIndex] = el;
                }}
                className="flex w-max items-center gap-16 lg:w-full lg:gap-0"
              >
                <div className="flex shrink-0 flex-row flex-nowrap items-center gap-16 lg:w-full lg:justify-between">
                  {row.map((logo) => (
                    <div key={logo.name}>
                      <div
                        className="relative h-8 w-auto sm:h-10 lg:h-12"
                        style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
                      >
                        <Image
                          src={logo.src}
                          alt={logo.name}
                          width={logo.width}
                          height={logo.height}
                          className={
                            "h-full w-auto object-contain " +
                            (logo.name === "ProvenExpert" ? "brightness-0 invert" : "")
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  aria-hidden="true"
                  className="partners-row-duplicate hidden shrink-0 flex-row flex-nowrap items-center gap-16 lg:hidden"
                >
                  {row.map((logo, logoIndex) => (
                    <div key={`${logo.name}-${logoIndex}-dup`}>
                      <div
                        className="relative h-8 w-auto sm:h-10"
                        style={{ aspectRatio: `${logo.width} / ${logo.height}` }}
                      >
                        <Image
                          src={logo.src}
                          alt=""
                          width={logo.width}
                          height={logo.height}
                          className={
                            "h-full w-auto object-contain " +
                            (logo.name === "ProvenExpert" ? "brightness-0 invert" : "")
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#080716] via-[rgba(8,7,22,0.45)] to-transparent lg:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#080716] via-[rgba(8,7,22,0.45)] to-transparent lg:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-64 bg-gradient-to-b from-[#080716] to-[#08071600] lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-64 bg-gradient-to-t from-[#080716] to-[#08071600] lg:block"
      />
    </section>
  );
}
