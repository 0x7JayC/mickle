"use client";

import { useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { SiteNav } from "@/components/SiteNav";
import { LandingNavCta } from "@/components/LandingAuth";
import "./scrolly.css";

// 8-beat scrollytelling landing. Three full-bleed video layers (intro,
// main, outro) plus three cat-loop overlays bound to specific beats.
// Scroll progress drives:
//   - which video layer is visible
//   - main.mp4 currentTime (lerped)
//   - which beat's typography is on screen
//   - the progress rail
// Port of public/scrolly/index.html into a single client component so
// the brand chrome (SiteNav, Privy auth) wires in cleanly.

const BEATS_TOTAL = 8;
const FADE = 0.025;
const INTRO_END = 0.005;
const OUTRO_START = 0.98;
const SEEK_THRESHOLD = 1 / 15; // ~67ms — 2 frames at 30 fps

const BEAT_EYEBROWS = [
  "MEET MICKLE",
  "THE PROBLEM",
  "REALITY CHECK",
  "WHAT IF",
  "THE WAY",
  "HOW IT WORKS",
  "THE PROOF",
  "START TODAY",
];

const CAT_BEATS = [1, 5, 6]; // beats covered by cat-yawn / cat-fly / cat-float

function clamp(x: number, a: number, b: number) {
  return Math.max(a, Math.min(b, x));
}

function beatOpacity(i: number, p: number) {
  const start = i / BEATS_TOTAL;
  const end = (i + 1) / BEATS_TOTAL;
  const leftFade = i === 0 ? 0 : FADE;
  const rightFade = i === BEATS_TOTAL - 1 ? 0 : FADE;
  if (p < start - leftFade || p > end + rightFade) return 0;
  if (leftFade && p < start + leftFade) {
    return clamp((p - (start - leftFade)) / (2 * leftFade), 0, 1);
  }
  if (rightFade && p > end - rightFade) {
    return clamp((end + rightFade - p) / (2 * rightFade), 0, 1);
  }
  return 1;
}

export default function Home() {
  const { login } = usePrivy();
  const onCta = () => login();

  // Refs for the parts the scroll handler mutates directly. Keeping
  // imperative DOM access here (instead of React state) so the rAF
  // throttled scroll loop never triggers a render.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef<HTMLVideoElement | null>(null);
  const mainRef = useRef<HTMLVideoElement | null>(null);
  const outroRef = useRef<HTMLVideoElement | null>(null);
  const catRefs = useRef<(HTMLVideoElement | null)[]>([null, null, null]);
  const beatRefs = useRef<(HTMLElement | null)[]>(Array(BEATS_TOTAL).fill(null));
  const railRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    const vIntro = introRef.current;
    const vMain = mainRef.current;
    const vOutro = outroRef.current;
    const beats = beatRefs.current;
    const rail = railRef.current;
    const hint = hintRef.current;
    const eyebrow = eyebrowRef.current;
    if (!root || !scroller || !vIntro || !vMain || !vOutro || !rail || !hint || !eyebrow) return;

    const railTicks = Array.from(rail.children) as HTMLElement[];
    let viewportH = window.innerHeight;
    let lastBeat = -1;
    let hintGone = false;
    let mainTarget = 0;

    const measure = () => {
      viewportH = window.innerHeight;
    };

    const getProgress = () => {
      const total = scroller.offsetHeight - viewportH;
      return total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
    };

    const setStage = (p: number) => {
      vIntro.dataset.active = p < INTRO_END ? "true" : "false";
      vOutro.dataset.active = p > OUTRO_START ? "true" : "false";
      vMain.dataset.active = p >= INTRO_END && p <= OUTRO_START ? "true" : "false";
    };

    const setMainTarget = (p: number) => {
      if (!isFinite(vMain.duration) || vMain.duration <= 0) return;
      const span = OUTRO_START - INTRO_END;
      const local = clamp((p - INTRO_END) / span, 0, 1);
      mainTarget = local * vMain.duration;
    };

    const syncMain = () => {
      if (!isFinite(vMain.duration) || vMain.duration <= 0) return;
      const cur = vMain.currentTime;
      if (Math.abs(mainTarget - cur) > SEEK_THRESHOLD) {
        try {
          vMain.currentTime = mainTarget;
        } catch (e) {
          void e;
        }
      }
    };

    const render = () => {
      const p = getProgress();
      setStage(p);
      setMainTarget(p);
      syncMain();

      for (let i = 0; i < BEATS_TOTAL; i++) {
        const op = beatOpacity(i, p);
        const el = beats[i];
        if (!el) continue;
        el.dataset.active = op > 0.01 ? "true" : "false";
        el.style.opacity = String(op);
      }

      catRefs.current.forEach((el, idx) => {
        if (!el) return;
        const op = beatOpacity(CAT_BEATS[idx], p);
        el.style.opacity = String(op);
        if (op > 0.05) {
          if (el.paused) el.play().catch(() => {});
        } else if (!el.paused) {
          el.pause();
        }
      });

      const active = clamp(Math.floor(p * BEATS_TOTAL), 0, BEATS_TOTAL - 1);
      if (active !== lastBeat) {
        eyebrow.textContent = BEAT_EYEBROWS[active];
        railTicks.forEach((t, i) => t.classList.toggle("on", i <= active));
        lastBeat = active;
      }

      if (!hintGone && p > 0.01) {
        hint.classList.add("gone");
        hintGone = true;
      }
    };

    let pending = false;
    let scrollIdleTimer = 0 as ReturnType<typeof setTimeout> | 0;
    root.dataset.scrolling = "false";

    const onScroll = () => {
      if (root.dataset.scrolling !== "true") {
        root.dataset.scrolling = "true";
      }
      clearTimeout(scrollIdleTimer as ReturnType<typeof setTimeout>);
      scrollIdleTimer = setTimeout(() => {
        root.dataset.scrolling = "false";
      }, 140);

      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        render();
        pending = false;
      });
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    vMain.addEventListener("loadedmetadata", render);
    vMain.addEventListener("canplay", render);

    // iOS Safari sometimes blocks autoplay until first user gesture.
    const tryPlay = (v: HTMLVideoElement) => {
      const promise = v.play();
      if (promise && promise.catch) promise.catch(() => {});
    };
    [vIntro, vOutro].forEach(tryPlay);
    const onGesture = () => [vIntro, vOutro].forEach(tryPlay);
    window.addEventListener("touchstart", onGesture, { once: true, passive: true });
    window.addEventListener("click", onGesture, { once: true });

    render();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      vMain.removeEventListener("loadedmetadata", render);
      vMain.removeEventListener("canplay", render);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("click", onGesture);
      clearTimeout(scrollIdleTimer as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <div ref={rootRef} className="scrolly-root">
      {/* Layer 1 — full-bleed video stack */}
      <div className="scrolly-stage" ref={stageRef} aria-hidden>
        <video ref={introRef} src="/scrolly/intro-loop.mp4" autoPlay loop muted playsInline preload="auto" data-active="true" />
        <video ref={mainRef} src="/scrolly/main.mp4" muted playsInline preload="auto" />
        <video
          ref={(el) => {
            catRefs.current[0] = el;
          }}
          className="cat-layer"
          src="/scrolly/cat-yawn.mp4"
          loop
          muted
          playsInline
          preload="auto"
        />
        <video
          ref={(el) => {
            catRefs.current[1] = el;
          }}
          className="cat-layer"
          src="/scrolly/cat-flycatch.mp4"
          loop
          muted
          playsInline
          preload="auto"
        />
        <video
          ref={(el) => {
            catRefs.current[2] = el;
          }}
          className="cat-layer"
          src="/scrolly/cat-float.mp4"
          loop
          muted
          playsInline
          preload="auto"
        />
        <video ref={outroRef} src="/scrolly/outro-loop.mp4" autoPlay loop muted playsInline preload="auto" />
      </div>

      {/* Top nav — shared with /app and /treasury */}
      <SiteNav>
        <LandingNavCta />
      </SiteNav>

      {/* Layer 3 — scroll-driven beats */}
      <div className="scrolly-scroller" ref={scrollerRef}>
        <div className="scrolly-sticky">
          <div className="scrolly-icon-cluster">
            <div className="pills" aria-hidden>
              <div className="dot o">⬢</div>
              <div className="dot k">✦</div>
              <div className="dot p">◐</div>
            </div>
            <div className="scrolly-eyebrow" ref={eyebrowRef}>
              {BEAT_EYEBROWS[0]}
            </div>
          </div>

          <Beat
            i={0}
            refCb={(el) => (beatRefs.current[0] = el)}
            statTop={{ label: "Customers Globally", num: "100", plus: "o", desc: "100+ humans now feeding the cat £1 a day." }}
            statBottom={{ label: "Happy Customers", num: "10K", plus: "p", desc: "Less anxiety. More index funds. Allegedly." }}
            head={<>HI. I&apos;M<Star />MICKLE</>}
            cta="Learn More →"
            meta={<><strong>£1 a day.</strong> Run by a cat who reads the FT.</>}
            onCta={onCta}
          />
          <Beat
            i={1}
            refCb={(el) => (beatRefs.current[1] = el)}
            statTop={{ label: "Minimum deposit", num: "£500", plus: "o", desc: "What most brokers ask. Tough luck if you have £30 a month spare." }}
            head={<>INVESTING<Star />IS COMPLICATED</>}
            meta={<>Jargon, minimums, vibes — <strong>most people give up before they start.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={2}
            refCb={(el) => (beatRefs.current[2] = el)}
            statTop={{ label: "What £1 actually buys", num: "0.3", unit: "lattes", plus: "o", desc: "A third of a London latte. Not enough to wake you up." }}
            head={<>£1?<Star />HARDLY ANYTHING</>}
            meta={<>Won&apos;t get you a London latte. <strong>We&apos;ve heard that one.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={3}
            refCb={(el) => (beatRefs.current[3] = el)}
            statTop={{ label: "S&P 500", num: "500", unit: "co.", plus: "p", desc: "The world's most profitable. Sliced thin enough that £1 fits." }}
            head={<>WHAT IF £1<Star />BOUGHT S&amp;P 500</>}
            cta="Show me the math →"
            meta={<>A daily slice of the world&apos;s 500 biggest companies. <strong>In your pocket.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={4}
            refCb={(el) => (beatRefs.current[4] = el)}
            statTop={{ label: "Things we don't do", num: "0", unit: "fomo", plus: "o", desc: "No memecoins. No \"gems\". No vibes. Just an index." }}
            head={<>NO PUMPS<Star />NO DUMPS</>}
            meta={<>The boring asset class. In tiny servings. <strong>On purpose.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={5}
            refCb={(el) => (beatRefs.current[5] = el)}
            statTop={{ label: "Mickle handles", num: "3", unit: "steps", plus: "p", desc: "Charge → Buy → Allocate. You don't lift a paw." }}
            head={<>AUTO<Star />POOLED<Star />FAIR</>}
            meta={<>We charge, pool, buy, divvy up. <strong>You just keep showing up.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={6}
            refCb={(el) => (beatRefs.current[6] = el)}
            statTop={{ label: "After 4 years", num: "£1,500", plus: "o", desc: "£1/day × 4 years × 7% average. Maths, not vibes." }}
            head={<>4 YEARS<Star />£1,500</>}
            cta="See the full curve →"
            meta={<>Compounding isn&apos;t magic. <strong>It&apos;s the £1 you didn&apos;t skip.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={7}
            refCb={(el) => (beatRefs.current[7] = el)}
            statTop={{ label: "Best time to start", num: "Today", plus: "p", suffix: ".", desc: "Not Monday. Not payday. The cat is waiting." }}
            head={<>TODAY<Star />BEATS TOMORROW</>}
            cta="Join Mickle →"
            meta={<>Tomorrow-you will thank today-you. <strong>Probably loudly.</strong></>}
            onCta={onCta}
            signature
          />
        </div>
      </div>

      <div className="scrolly-rail" ref={railRef} aria-hidden>
        {Array.from({ length: BEATS_TOTAL }).map((_, i) => (
          <div className="tick" key={i} />
        ))}
      </div>

      <div className="scrolly-hint" ref={hintRef}>
        Scroll to begin
      </div>
    </div>
  );
}

function Star() {
  return <span className="star">✦</span>;
}

function Beat({
  i,
  refCb,
  statTop,
  statBottom,
  head,
  cta,
  meta,
  onCta,
  signature,
}: {
  i: number;
  refCb: (el: HTMLElement | null) => void;
  statTop: { label: string; num: string; unit?: string; suffix?: string; plus: "o" | "p"; desc: string };
  statBottom?: { label: string; num: string; unit?: string; suffix?: string; plus: "o" | "p"; desc: string };
  head: React.ReactNode;
  cta?: string;
  meta?: React.ReactNode;
  onCta: () => void;
  signature?: boolean;
}) {
  return (
    <section className="scrolly-beat" data-beat={i} ref={refCb}>
      <div className="grid">
        <StatCard {...statTop} />
        <div className="scrolly-hero">
          <h1 className="head">{head}</h1>
          <div className="actions">
            {cta && (
              <a
                className="primary"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onCta();
                }}
              >
                {cta}
              </a>
            )}
            {meta && <div className="meta">{meta}</div>}
          </div>
        </div>
        {statBottom && <StatCard {...statBottom} bottom />}
      </div>
      {signature && (
        <svg className="scrolly-signature" width="180" height="48" viewBox="0 0 180 48" fill="none">
          <path
            d="M4 30 C 22 12, 38 40, 56 22 S 90 8, 110 28 S 150 42, 176 18"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M120 36 q 8 -8 18 -2 t 22 -4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}
    </section>
  );
}

function StatCard({
  label,
  num,
  unit,
  suffix,
  plus,
  desc,
  bottom = false,
}: {
  label: string;
  num: string;
  unit?: string;
  suffix?: string;
  plus: "o" | "p";
  desc: string;
  bottom?: boolean;
}) {
  return (
    <div className={`scrolly-stat-card${bottom ? " bottom" : ""}`}>
      <div className="label">{label}</div>
      <div className="num">
        {num}
        {suffix ? <span className={`plus-${plus}`}>{suffix}</span> : null}
        {unit ? <span className={`plus-${plus}`}>{unit}</span> : null}
        {!suffix && !unit ? <span className={`plus-${plus}`}>+</span> : null}
      </div>
      <div className="desc">{desc}</div>
    </div>
  );
}
