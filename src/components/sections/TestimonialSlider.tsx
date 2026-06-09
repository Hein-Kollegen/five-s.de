"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { readMotionGate, MEDIA } from "@/lib/motion";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useSplitLines } from "@/components/typography/useSplitLines";
import { Section } from "@/components/layout/Section";

const testimonials = [
  {
    quote:
      "\"Martin, Dein Team macht einen wahnsinnig guten Job - super, super, super Job.\"",
    name: "Angelika Hamburger",
    role: "Director Human Resources, Daimler Truck",
    logo: "/assets/sections/testimonials/logo-daimler.png"
  },
  {
    quote: "\"Hein & Kollegen sind die Pragmatiker für den Mittelstand.\"",
    name: "brandeins",
    role: "Die besten Unternehmensberater 2024",
    logo: "/assets/sections/testimonials/logo-brandeins.png"
  },
  {
    quote:
      "\"Hein & Kollegen - für mich das Schweizer Taschenmesser\nim Marketing!\"",
    name: "Matthias Bianchi",
    role: "Leiter Public Affairs, Deutscher Mittelstands-Bund",
    logo: "/assets/sections/testimonials/logo-dmb.png"
  }
];

export default function TestimonialSlider() {
  const GESTURE_IDLE_MS = 120;
  const SLIDE_SWITCH_THRESHOLD = 0.35;
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);
  const activeSlideRef = useRef(0);
  const isSlideTransitioningRef = useRef(false);
  const isStepGestureLockRef = useRef(false);
  const stepLockDirectionRef = useRef<1 | -1 | 0>(0);
  const gestureActiveRef = useRef(false);
  const gestureIdleTimerRef = useRef<number | null>(null);
  const lastProgressRef = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA.belowLg);
    const syncMobile = () => setIsMobile(mediaQuery.matches);
    syncMobile();
    mediaQuery.addEventListener("change", syncMobile);

    return () => {
      mediaQuery.removeEventListener("change", syncMobile);
    };
  }, []);

  useSplitLines({ scope: sectionRef });

  const clearGestureTimer = () => {
    if (gestureIdleTimerRef.current !== null) {
      window.clearTimeout(gestureIdleTimerRef.current);
      gestureIdleTimerRef.current = null;
    }
  };

  const markGestureActivity = () => {
    const isNewGesture = !gestureActiveRef.current;
    gestureActiveRef.current = true;
    clearGestureTimer();
    gestureIdleTimerRef.current = window.setTimeout(() => {
      gestureActiveRef.current = false;
      gestureIdleTimerRef.current = null;
    }, GESTURE_IDLE_MS);
    return isNewGesture;
  };

  const lockStepForGesture = (direction: 1 | -1) => {
    isStepGestureLockRef.current = true;
    stepLockDirectionRef.current = direction;
  };

  const clearStepGestureLock = () => {
    isStepGestureLockRef.current = false;
    stepLockDirectionRef.current = 0;
  };

  useGSAP(
    () => {
      if (!sliderRef.current || !sectionRef.current) return;

      const { prefersReducedMotion } = readMotionGate();
      const mm = gsap.matchMedia();

      mm.add(MEDIA.belowLg, () => {
        ScrollTrigger.getById("testimonial-slider-pin")?.kill();
        gsap.set(sliderRef.current, { opacity: 1, y: 0 });
        lastProgressRef.current = 0;
        isSlideTransitioningRef.current = false;
        gestureActiveRef.current = false;
        clearStepGestureLock();
        clearGestureTimer();
      });

      mm.add(MEDIA.lgUp, () => {
        if (prefersReducedMotion) {
          gsap.set(sliderRef.current, { opacity: 1, y: 0 });
          return;
        }

        const revealTween = gsap.fromTo(
          sliderRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sliderRef.current,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );

        const slidesCount = testimonials.length;
        const steps = slidesCount;
        const holdSteps = 1;
        const stepLength = 400;

        const pinTrigger = ScrollTrigger.create({
          id: "testimonial-slider-pin",
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${stepLength * (steps + holdSteps)}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            const delta = progress - lastProgressRef.current;
            lastProgressRef.current = progress;

            const direction: 1 | -1 | 0 = delta > 0.0005 ? 1 : delta < -0.0005 ? -1 : 0;
            if (direction === 0) return;

            const isNewGesture = markGestureActivity();
            if (isNewGesture) {
              clearStepGestureLock();
            }

            if (isStepGestureLockRef.current && stepLockDirectionRef.current === direction) {
              return;
            }

            if (isSlideTransitioningRef.current) return;

            const current = activeSlideRef.current;

            if (direction > 0 && current < steps - 1) {
              const thresholdProgress = (current + SLIDE_SWITCH_THRESHOLD) / steps;
              if (progress >= thresholdProgress) {
                const targetIndex = current + 1;
                isSlideTransitioningRef.current = true;
                lockStepForGesture(1);
                swiperRef.current?.slideTo(targetIndex, 600);
              }
            }

            if (direction < 0 && current > 0) {
              const thresholdProgress = (current - SLIDE_SWITCH_THRESHOLD) / steps;
              if (progress <= thresholdProgress) {
                const targetIndex = current - 1;
                isSlideTransitioningRef.current = true;
                lockStepForGesture(-1);
                swiperRef.current?.slideTo(targetIndex, 600);
              }
            }
          },
          onRefresh: () => {
            const current = swiperRef.current?.realIndex ?? 0;
            activeSlideRef.current = current;
            lastProgressRef.current = 0;
            isSlideTransitioningRef.current = false;
            gestureActiveRef.current = false;
            clearStepGestureLock();
            clearGestureTimer();
          }
        });

        return () => {
          pinTrigger.kill();
          revealTween.kill();
        };
      });

      return () => {
        mm.revert();
        clearGestureTimer();
        clearStepGestureLock();
        isSlideTransitioningRef.current = false;
        gestureActiveRef.current = false;
      };
    },
    { scope: sectionRef }
  );

  return (
    <Section
      ref={sectionRef}
      className="mt-24 flex w-full justify-center align-center !py-12 lg:mt-40"
      innerClassName="w-full"
      useContentWrap={false}
      centerY={true}
    >
      <div className="content-wrap flex flex-col items-center gap-16 text-center">
        <h2 className="split-lines break-words hyphens-auto">KUNDEN&shy;STIMMEN</h2>

        <div ref={sliderRef} className="relative w-full">
          <div className="relative mx-auto h-full w-full max-w-4xl">
            <Swiper
              key={isMobile ? "mobile" : "desktop"}
              modules={[Pagination, Autoplay]}
              loop={isMobile}
              speed={700}
              spaceBetween={80}
              grabCursor={isMobile}
              allowTouchMove={isMobile}
              autoplay={
                isMobile
                  ? {
                    delay: 5000,
                    disableOnInteraction: true
                  }
                  : false
              }
              pagination={{ clickable: isMobile, el: ".testimonial-pagination" }}
              className="testimonial-swiper h-full [&_.swiper-wrapper]:items-stretch [&_.swiper-slide]:h-auto"
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                activeSlideRef.current = swiper.realIndex;
                isSlideTransitioningRef.current = false;
              }}
              onSlideChange={(swiper) => {
                activeSlideRef.current = swiper.realIndex;
              }}
              onSlideChangeTransitionEnd={(swiper) => {
                activeSlideRef.current = swiper.realIndex;
                isSlideTransitioningRef.current = false;
              }}
            >
              {testimonials.map((item) => (
                <SwiperSlide key={item.name} className="!flex min-h-[300px] flex-col lg:min-h-[300px]">
                  <div className="flex grow flex-col items-center justify-center">
                    <p className="text-center text-fs-ui-600 font-light leading-[1.25] text-white">
                      {item.quote}
                    </p>
                  </div>

                  <div className="mt-10 flex flex-col items-center justify-center gap-3 text-center lg:mt-14">
                    <div className="relative h-14 w-14 flex-none">
                      <Image
                        src={item.logo}
                        alt={item.name}
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    </div>
                    <p className="text-center leading-[1.3] text-white">
                      <strong className="text-fs-ui-300 font-semibold block">{item.name}</strong>
                      <span className="text-fs-ui-300 font-light">{item.role}</span>
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-1 text-fs-ui-300">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <span key={starIndex} className="text-[#DBC18D]">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="testimonial-pagination" />
          </div>
        </div>
      </div>
    </Section>
  );
}


