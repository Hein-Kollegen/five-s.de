"use client";

import { useRef } from "react";
import type { UIEvent as ReactUIEvent, WheelEvent as ReactWheelEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { readMotionGate, MEDIA } from "@/lib/motion";
import { scheduleScrollTriggerRefresh } from "@/lib/scrollTriggerRefresh";
import { useSplitLines } from "@/components/typography/useSplitLines";
import { useSplitScale } from "@/components/typography/useSplitScale";
import { Section } from "@/components/layout/Section";

const detailSlides = [
  {
    title: "S1 – STRATEGIE & MARKE",
    subline: "Fundament schaffen, bevor Maßnahmen starten.",
    mediaType: "videoLeft",
    mediaSrc: "/assets/sections/modell-detail/Martin 1x1 - HEMD - clean.mp4",
    body: "Hier entsteht Klarheit. Ohne sie wird Wachstum zufällig.",
    list: [
      "Markt- & Wettbewerbsanalyse",
      "Zielgruppenanalyse",
      "SWOT & Potenziale",
      "Positionierung & Angebotsarchitektur",
      "Brand Story & Messaging"
    ]
  },
  {
    title: "S2 – SICHTBARKEIT",
    subline: "Relevanz in Entscheidungsphasen aufbauen.",
    mediaType: "videoLeft",
    mediaSrc: "/assets/sections/modell-detail/video-mock-up 1_1.mp4",
    body: "Ziel ist die Wahrnehmung bei den relevanten Entscheidern.",
    list: [
      "Sichtbarkeit in Google und LLMs",
      "Social Media & Video Marketing",
      "Reputationsmarketing & Thought Leadership",
      "Websites, Landing Pages, Retargeting",
      "Event Marketing, Podcasting, Newsletter"
    ]
  },
  {
    title: "S3 – SYSTEME",
    subline: "Kundengewinnung & Recruiting skalieren.",
    mediaType: "videoLeft",
    mediaSrc: "/assets/sections/modell-detail/video-mock-up 2.mp4",
    body: "Wachstum wird systematisch.",
    list: [
      "Recruiting Funnels",
      "Talent Management Systems",
      "KI & Automations",
      "CRM-Setups & Lead Management",
      "Events mit strukturierten Follow-ups"
    ]
  },
  {
    title: "S4 – STRUKTUR",
    subline: "Organisation stabilisieren, während sie wächst.",
    mediaType: "video",
    mediaSrc: "/assets/sections/modell-detail/video-background-struktur.mp4",
    panelStyle: "overlay",
    body: "Struktur verhindert Unruhe im Wachstum.",
    list: [
      "Prozessoptimierung",
      "Führungssystem mit Rollen & Verantwortlichkeiten",
      "Organisationsentwicklung",
      "Systemisches Coaching",
      "KPI-Systeme"
    ]
  },
  {
    title: "S5 – SKALIERUNG",
    subline: "Wachstum skalieren, Potenziale entwickeln.",
    mediaType: "video",
    mediaSrc: "/assets/sections/modell-detail/video-background-skalierung.mp4",
    panelStyle: "overlay",
    body: "Skalierung beginnt in der Führung.",
    list: [
      "Scale-up Workshops",
      "Geschäftsfeldentwicklung",
      "Sales Trainings",
      "Management-Sparring",
      "Strategy Summits"
    ]
  }
];

export default function ModellDetailSection() {
  const LIST_SCROLL_GUARD_MS = 200;
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const listRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeIndexRef = useRef(0);
  const isAnimatingRef = useRef(false);
  const listScrollGuardUntilRef = useRef(0);

  useSplitScale({ scope: sectionRef });
  useSplitLines({ scope: sectionRef });

  const markListScrollGuard = () => {
    listScrollGuardUntilRef.current = Date.now() + LIST_SCROLL_GUARD_MS;
  };

  const isListScrollGuardActive = () => Date.now() < listScrollGuardUntilRef.current;

  const isScrollBlocked = () => isAnimatingRef.current || isListScrollGuardActive();

  useGSAP(
    () => {
      if (!stackRef.current) return;

      const { prefersReducedMotion } = readMotionGate();

      if (prefersReducedMotion) return;

      const mm = gsap.matchMedia();

      mm.add(MEDIA.lgUp, () => {
        if (!stackRef.current) return;

        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        if (!cards.length) return;

        let resizeTimer: number | null = null;
        let lastViewportWidth = window.innerWidth;
        let lastViewportHeight = window.innerHeight;
        let trigger: ScrollTrigger | null = null;
        let queuedStage: number | null = null;

        const count = cards.length;
        const snapPoints =
          count > 1 ? Array.from({ length: count }, (_, index) => index / (count - 1)) : [0];

        const clampIndex = (value: number) =>
          Math.min(count - 1, Math.max(0, value));

        const getNearestStage = (progress: number) => {
          let nearestStage = 0;
          let nearestDistance = Number.POSITIVE_INFINITY;
          snapPoints.forEach((point, index) => {
            const distance = Math.abs(progress - point);
            if (distance < nearestDistance) {
              nearestDistance = distance;
              nearestStage = index;
            }
          });
          return nearestStage;
        };

        const getNearestSnapPoint = (progress: number) =>
          snapPoints[getNearestStage(progress)];

        const getPinDistance = () => {
          const panelHeight = cards[0]?.getBoundingClientRect().height ?? window.innerHeight;
          const perStepDistance = Math.max(window.innerHeight * 0.95, panelHeight * 0.95);
          return Math.round(
            Math.max(window.innerHeight * 1.2, perStepDistance * Math.max(1, count - 1))
          );
        };

        const setStageImmediate = (stage: number) => {
          const clampedStage = clampIndex(stage);
          queuedStage = null;
          isAnimatingRef.current = false;
          activeIndexRef.current = clampedStage;

          cards.forEach((card, index) => {
            gsap.set(card, {
              yPercent: index === clampedStage ? 0 : 100,
              autoAlpha: index === clampedStage ? 1 : 0,
              zIndex: index + 1
            });
          });
        };

        const continueToQueuedStage = () => {
          if (isAnimatingRef.current || queuedStage === null) return;

          const currentIndex = activeIndexRef.current;
          const targetStage = clampIndex(queuedStage);

          if (targetStage === currentIndex) {
            queuedStage = null;
            return;
          }

          const direction = targetStage > currentIndex ? 1 : -1;
          const nextIndex = clampIndex(currentIndex + direction);
          const nextCard = cards[nextIndex];
          const currentCard = cards[currentIndex];

          isAnimatingRef.current = true;

          const tl = gsap.timeline({
            defaults: { duration: 0.6, ease: "power2.out" },
            onComplete: () => {
              activeIndexRef.current = nextIndex;
              isAnimatingRef.current = false;
              continueToQueuedStage();
            }
          });

          if (direction > 0) {
            gsap.set(nextCard, { yPercent: 100, autoAlpha: 1 });
            tl.to(nextCard, { yPercent: 0 });
          } else {
            tl.to(currentCard, { yPercent: 100, autoAlpha: 0 });
            gsap.set(nextCard, { yPercent: 0, autoAlpha: 1 });
          }
        };

        const requestStage = (stage: number) => {
          queuedStage = clampIndex(stage);
          continueToQueuedStage();
        };

        setStageImmediate(0);

        trigger = ScrollTrigger.create({
          trigger: stackRef.current,
          start: "top top",
          end: () => `+=${getPinDistance()}`,
          snap: {
            snapTo: (value: number) => {
              if (isListScrollGuardActive()) return value;
              return getNearestSnapPoint(value);
            },
            directional: true,
            inertia: false,
            delay: 0,
            duration: { min: 0.1, max: 0.2 },
            ease: "power2.out"
          },
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (isScrollBlocked()) return;
            requestStage(getNearestStage(self.progress));
          },
          onRefresh: (self) => {
            setStageImmediate(getNearestStage(self.progress));
          }
        });

        const handleGuardWheel = (event: WheelEvent) => {
          if (!trigger?.isActive) return;
          if (!isListScrollGuardActive()) return;

          const activeList = listRefs.current[activeIndexRef.current];
          if (activeList && event.target instanceof Node && activeList.contains(event.target)) {
            return;
          }

          event.preventDefault();
        };

        window.addEventListener("wheel", handleGuardWheel, { passive: false });

        const handleViewportChange = () => {
          if (resizeTimer !== null) {
            window.clearTimeout(resizeTimer);
          }
          resizeTimer = window.setTimeout(() => {
            const nextViewportWidth = window.innerWidth;
            const nextViewportHeight = window.innerHeight;
            if (
              nextViewportWidth === lastViewportWidth &&
              nextViewportHeight === lastViewportHeight
            ) {
              return;
            }
            lastViewportWidth = nextViewportWidth;
            lastViewportHeight = nextViewportHeight;
            scheduleScrollTriggerRefresh();
          }, 120);
        };

        window.addEventListener("resize", handleViewportChange);
        window.addEventListener("orientationchange", handleViewportChange);

        return () => {
          if (resizeTimer !== null) {
            window.clearTimeout(resizeTimer);
          }
          window.removeEventListener("wheel", handleGuardWheel);
          window.removeEventListener("resize", handleViewportChange);
          window.removeEventListener("orientationchange", handleViewportChange);
          isAnimatingRef.current = false;
          trigger?.kill();
        };
      });

      mm.add(MEDIA.belowLg, () => {
        const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
        cards.forEach((card) => {
          gsap.set(card, {
            clearProps: "transform,opacity,visibility,zIndex"
          });
        });
        activeIndexRef.current = 0;
        isAnimatingRef.current = false;
      });

      return () => {
        mm.revert();
      };
    },
    { scope: sectionRef }
  );

  const handleListWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const canScroll = target.scrollHeight > target.clientHeight + 1;
    if (!canScroll) return;
    markListScrollGuard();
    event.stopPropagation();
  };

  const handleListScroll = (event: ReactUIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const canScroll = target.scrollHeight > target.clientHeight + 1;
    if (!canScroll) return;
    markListScrollGuard();
  };

  return (
    <Section
      ref={sectionRef}
      className="mt-32 flex w-full flex-col items-center !px-0"
      innerClassName="w-full"
      useContentWrap={false}
    >
      <div className="content-wrap !max-w-[1280px] flex flex-col items-center gap-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <h2 className="split-scale text-balance">DIE 5-S-MODULE IM DETAIL</h2>
          <h3 className="split-scale text-balance font-light">5 MODULE FÜR SICHERES WACHSTUM</h3>
        </div>
        <p className="split-lines text-balance">
          Die 5-S-Module sind kein Maßnahmenkatalog. Sie sind ein strukturiertes System, das Wachstum
          planbar macht. Nicht alles gleichzeitig. Aber alles in der richtigen Reihenfolge.
        </p>
      </div>
      <div className="mt-24 w-full">
        <div
          ref={stackRef}
          className="relative w-full flex flex-col gap-10 lg:block lg:h-[100svh] lg:w-[100vw] lg:overflow-hidden"
        >
          {detailSlides.map((slide, index) => {
            const isSlideOne = index === 0;
            const isBackgroundVideo = slide.mediaType === "video";
            const panelClass =
              slide.mediaType === "video"
                ? "bg-[rgba(8,7,22,0.55)] backdrop-blur-sm lg:bg-[linear-gradient(270deg,rgba(8,7,22,0.60)_0%,#080716_100%)] lg:backdrop-blur-md"
                : slide.panelStyle === "overlay"
                  ? "bg-[linear-gradient(270deg,rgba(8,7,22,0.60)_0%,#080716_100%)] backdrop-blur-md"
                  : "";

            return (
              <div
                key={slide.title}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className="flex w-full items-center justify-center overflow-hidden bg-[#080716] lg:absolute lg:inset-0 lg:h-[100svh] lg:w-[100vw]"
              >
                <div className="content-wrap w-full flex justify-center pb-[43px]">
                  <div
                    className="relative w-full overflow-hidden rounded-[20px] border border-[#37515F] bg-[#080716] lg:h-[90svh] lg:max-w-[90vw]"
                    style={
                      slide.mediaType === "bg"
                        ? {
                          backgroundImage: `url(${slide.mediaSrc})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center"
                        }
                        : undefined
                    }
                  >
                    {slide.mediaType === "video" ? (
                      <video
                        className="absolute inset-0 hidden h-full w-full object-cover lg:block"
                        autoPlay
                        loop
                        muted
                        playsInline
                        src={slide.mediaSrc}
                      />
                    ) : null}
                    <div className="h-full w-full">
                      <div className="grid h-full grid-rows-[250px_auto] lg:grid-cols-2 lg:grid-rows-1">
                        <div
                          className={
                            "relative min-h-[250px] w-full overflow-hidden lg:h-full " +
                            (isBackgroundVideo ? "block lg:hidden" : "")
                          }
                        >
                          {slide.mediaType === "videoLeft" ? (
                            <div className={"h-full w-full " + (isSlideOne ? "" : "lg:py-4")}>
                              <video
                                className={
                                  "h-full w-full object-cover " +
                                  (isSlideOne ? "" : "lg:object-contain lg:object-left")
                                }
                                autoPlay
                                loop
                                muted
                                playsInline
                                src={slide.mediaSrc}
                              />
                            </div>
                          ) : null}
                          {slide.mediaType === "video" ? (
                            <video
                              className="h-full w-full object-cover"
                              autoPlay
                              loop
                              muted
                              playsInline
                              src={slide.mediaSrc}
                            />
                          ) : null}
                          {slide.mediaType === "image" ? (
                            <img
                              src={slide.mediaSrc}
                              alt=""
                              className="h-full w-full object-cover lg:object-contain lg:object-left"
                            />
                          ) : null}
                        </div>
                        <div
                          className={
                            "relative z-[1] row-span-1 flex h-full flex-col justify-center px-4 lg:px-10 " +
                            (isBackgroundVideo ? "lg:col-start-2 " : "") +
                            panelClass
                          }
                        >
                          <div className="flex h-full flex-col items-center justify-center gap-6 py-8 text-center lg:items-start lg:py-16 lg:text-left">
                            <h3 className="text-center text-balance font-semibold lg:text-left">{slide.title}</h3>
                            <div className="flex flex-col gap-1">
                              <h4 className="text-center text-fs-ui-200 text-balance font-semibold lg:text-left">
                                {slide.subline}
                              </h4>
                              <p className="text-center text-balance text-[#DBC18D] lg:text-left">{slide.body}</p>
                            </div>
                            <div
                              ref={(el) => {
                                listRefs.current[index] = el;
                              }}
                              className="slide-list-scroll mt-4 flex w-full flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain pr-2 text-left"
                              onWheel={handleListWheel}
                              onScroll={handleListScroll}
                            >
                              {slide.list.map((entry) => (
                                <div key={entry} className="flex flex-nowrap items-center gap-2">
                                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-[#DBC18D42]">
                                    <img
                                      src="/assets/sections/modell-detail/arrow-icon.svg"
                                      alt=""
                                      className="h-3 w-3"
                                    />
                                  </span>
                                  <p className="min-w-0 flex-shrink flex-grow-0 rounded-[30px] border border-[#DBC18D42] px-4 text-left text-balance py-2">
                                    {entry}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}


