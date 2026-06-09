"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { readMotionGate } from "@/lib/motion";
import { useSplitReveal } from "@/components/typography/useSplitReveal";
import { Section } from "@/components/layout/Section";

const counters = [
  { value: "50.000+", label: "Zuhörer pro Jahr" },
  { value: "10.000+", label: "Follower auf relevanten Social-Media-Kanälen" },
  { value: "5.000+", label: "Entscheider im eigenen Netzwerk" },
  { value: "10+", label: "eigene Formate" }
];

const badges = [
  { name: "Recruitee", src: "/assets/sections/overview/recruitee-siegel.png" },
  { name: "LinkedIn", src: "/assets/sections/overview/linkedin-siegel.png" },
  { name: "LinkedIn 2", src: "/assets/sections/overview/linkedIn-siegel2.png" },
  { name: "Meta", src: "/assets/sections/overview/meta-siegel.png" },
  { name: "Google", src: "/assets/sections/overview/google-siegel.png" },
  { name: "Proven Expert", src: "/assets/sections/overview/proven-expert-siegel.png" }
];

const whiteBadgeStyle = { filter: "brightness(0) invert(1)" };

export default function OverviewSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const countersRef = useRef<HTMLDivElement | null>(null);
  const badgesRef = useRef<HTMLDivElement | null>(null);
  const badgesTrackRef = useRef<HTMLDivElement | null>(null);

  useSplitReveal({ scope: sectionRef, variant: "scale" });
  useSplitReveal({ scope: sectionRef, variant: "lines" });

  useGSAP(
    () => {
      if (!sectionRef.current || !countersRef.current) return;

      const { prefersReducedMotion, isMobile } = readMotionGate();

      if (isMobile && badgesTrackRef.current) {
        if (prefersReducedMotion) {
          gsap.set(badgesTrackRef.current, { xPercent: 0 });
        } else {
          gsap.set(badgesTrackRef.current, { xPercent: 0 });
          gsap.to(badgesTrackRef.current, {
            xPercent: -50,
            duration: 30,
            ease: "none",
            repeat: -1
          });
        }
      }

      const counterEls = gsap.utils.toArray<HTMLElement>(
        "[data-counter]",
        sectionRef.current
      );

      if (!counterEls.length) return;

      if (prefersReducedMotion || isMobile) {
        counterEls.forEach((counter) => {
          const valueEl = counter.querySelector<HTMLElement>("[data-counter-value]");
          const labelEl = counter.querySelector<HTMLElement>("[data-counter-label]");
          gsap.set([valueEl, labelEl], { opacity: 1, scale: 1 });
        });

        const badgeEls = gsap.utils.toArray<HTMLElement>(
          "[data-badge]",
          sectionRef.current
        );
        gsap.set(badgeEls, { opacity: 1, scale: 1 });
        return;
      }

      const master = gsap.timeline({
        scrollTrigger: {
          trigger: countersRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
          once: true
        }
      });

      const overlap = 1;

      counterEls.forEach((counter, index) => {
        const valueEl = counter.querySelector<HTMLElement>("[data-counter-value]");
        const labelEl = counter.querySelector<HTMLElement>("[data-counter-label]");
        if (!valueEl || !labelEl) return;

        const finalValue = valueEl.textContent ?? "";
        const valueMatch = finalValue.match(/^([0-9.,]+)(.*)$/);
        const numericPart = valueMatch ? valueMatch[1] : finalValue;
        const suffixPart = valueMatch ? valueMatch[2] : "";

        valueEl.textContent = "";
        const numberSpan = document.createElement("span");
        numberSpan.setAttribute("data-counter-number", "true");
        numberSpan.textContent = numericPart;
        valueEl.appendChild(numberSpan);
        gsap.set(numberSpan, { opacity: 0 });
        if (suffixPart) {
          const suffixSpan = document.createElement("span");
          suffixSpan.textContent = suffixPart;
          gsap.set(suffixSpan, { opacity: 0 });
          valueEl.appendChild(suffixSpan);
        }
        const tl = gsap.timeline();

        tl.fromTo(
          numberSpan,
          {
            opacity: 0,
            scrambleText: { text: numericPart, chars: "0123456789" }
          },
          {
            opacity: 1,
            scrambleText: { text: numericPart, chars: "0123456789" },
            duration: 1.5,
            ease: "power2.out"
          }
        );

        if (suffixPart) {
          const suffixSpan = valueEl.querySelector<HTMLElement>(
            "span:not([data-counter-number])"
          );
          if (suffixSpan) {
            tl.to(
              suffixSpan,
              { opacity: 1, duration: 0.6, ease: "power2.out" },
              "-=1.2"
            );
          }
        }

        tl.fromTo(
          labelEl,
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1, ease: "elastic.out(1, 0.8)" },
          "-=1.5"
        );

        master.add(tl, index === 0 ? 0 : `-=${overlap}`);
      });

      const badgeEls = gsap.utils.toArray<HTMLElement>(
        "[data-badge]",
        sectionRef.current
      );

      if (badgeEls.length && badgesRef.current) {
        master.fromTo(
          badgeEls,
          { scale: 0.9, opacity: 0, transformOrigin: "center center" },
          { scale: 1, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.1 },
          "-=0.5"
        );
      }
    },
    { scope: sectionRef }
  );

  return (
    <Section
      ref={sectionRef}
      className="mt-32 flex w-full justify-center lg:mt-48"
      innerClassName="w-full"
      useContentWrap={false}
      centerY={true}
    >
      <div className="content-wrap flex flex-col items-center gap-10 text-center lg:gap-16">
        <div className="flex flex-col items-center gap-4">
          <h2 className="split-scale break-normal !hyphens-none">HEIN & KOLLEGEN IM ÜBERBLICK</h2>
          <h3 className="split-lines text-balance leading-[1.2]">
            WACHSTUM ENTSTEHT, WO RELEVANZ, REICHWEITE UND GLAUBWÜRDIGKEIT ZUSAMMENKOMMEN.
          </h3>
        </div>

        <div
          ref={countersRef}
          className="mt-6 grid w-full grid-cols-1 gap-6 lg:mt-8 lg:grid-cols-4"
        >
          {counters.map((counter) => (
            <div
              key={counter.value}
              data-counter
              className="flex min-w-0 flex-1 flex-col gap-2 text-center lg:min-w-[200px]"
            >
              <div
                data-counter-value
                className="text-fs-ui-700 font-extrabold uppercase leading-[1] text-white"
              >
                {counter.value}
              </div>
              <p data-counter-label className="text-fs-ui-100 font-normal text-[#DBC18D] text-balance">
                {counter.label}
              </p>
            </div>
          ))}
        </div>

        <div ref={badgesRef} className="w-full">
          <div className="overview-badges-marquee mt-10 lg:hidden">
            <div ref={badgesTrackRef} className="overview-badges-track">
              {[...badges, ...badges].map((badge, index) => (
                <div key={`${badge.src}-${index}`} className="relative h-24 w-24 flex-none">
                  <Image
                    src={badge.src}
                    alt={badge.name}
                    fill
                    sizes="96px"
                    className="object-contain"
                    style={badge.name === "Proven Expert" ? whiteBadgeStyle : undefined}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden w-full flex-nowrap justify-center gap-12 overflow-visible overflow-x-auto scroll-smooth lg:flex">
            {badges.map((badge) => (
              <div key={badge.src} className="relative h-32 w-32 flex-none overflow-visible">
                <Image
                  src={badge.src}
                  alt={badge.name}
                  fill
                  sizes="128px"
                  className="object-contain will-change-transform overflow-visible"
                  style={badge.name === "Proven Expert" ? whiteBadgeStyle : undefined}
                  data-badge
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
