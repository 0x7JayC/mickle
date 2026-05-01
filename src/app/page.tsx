"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SiteNav } from "@/components/SiteNav";
import { LandingNavCta } from "@/components/LandingAuth";
import { useLang, type Lang } from "@/lib/i18n";
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

const BEAT_EYEBROWS: Record<Lang, string[]> = {
  en: ["MEET MICKLE", "THE PROBLEM", "REALITY CHECK", "WHAT IF", "HOW IT WORKS", "THE WAY", "THE PROOF", "START TODAY"],
  zh: ["认识 MICKLE", "现状", "算笔账", "假如呢", "怎么运作", "我们的方式", "证据", "今天就开始"],
};

const HINT: Record<Lang, string> = { en: "Scroll to begin", zh: "向下滚动开始故事" };

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
  const lang = useLang();
  const router = useRouter();
  // Scrolly-beat CTAs route straight to /dashboard, where CDP
  // initializes once and the inline AuthButton handles sign-in.
  const onCta = () => router.push("/dashboard");
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;

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
        eyebrow.textContent = BEAT_EYEBROWS[langRef.current][active];
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

  // Re-paint the imperatively-updated eyebrow whenever the user switches
  // language — the scroll loop only updates it on beat change, so without
  // this the eyebrow stays in the previous language until you scroll.
  useEffect(() => {
    const eyebrow = eyebrowRef.current;
    if (!eyebrow) return;
    const total = (scrollerRef.current?.offsetHeight ?? 0) - window.innerHeight;
    const p = total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
    const active = clamp(Math.floor(p * BEATS_TOTAL), 0, BEATS_TOTAL - 1);
    eyebrow.textContent = BEAT_EYEBROWS[lang][active];
  }, [lang]);

  return (
    <div ref={rootRef} className="scrolly-root">
      {/* Layer 1 — full-bleed video stack */}
      <div className="scrolly-stage" ref={stageRef} aria-hidden>
        <video ref={introRef} src="/scrolly/intro-loop.mp4" autoPlay loop muted playsInline preload="auto" data-active="true" />
        <video ref={mainRef} src="/scrolly/main.mp4" muted playsInline preload="metadata" />
        <video
          ref={(el) => {
            catRefs.current[0] = el;
          }}
          className="cat-layer"
          src="/scrolly/cat-yawn.mp4"
          loop
          muted
          playsInline
          preload="metadata"
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
          preload="metadata"
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
          preload="metadata"
        />
        <video ref={outroRef} src="/scrolly/outro-loop.mp4" loop muted playsInline preload="metadata" />
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
              {BEAT_EYEBROWS[lang][0]}
            </div>
          </div>

          <Beat
            i={0}
            lang={lang}
            refCb={(el) => (beatRefs.current[0] = el)}
            statTop={{ label: { en: "Customers Globally", zh: "全球用户" }, num: "100", plus: "o", desc: { en: "100+ humans now feeding the cat £1 a day.", zh: "已经有 100+ 用户开始用每天 £1,让未来慢慢长大。" } }}
            statBottom={{ label: { en: "Happy Customers", zh: "满意客户" }, num: "10K", plus: "p", desc: { en: "Less anxiety. More index funds. Allegedly.", zh: "每天攒一点,不焦虑,不踩坑。" } }}
            head={lang === "zh" ? <>嗨,我是<Star />MICKLE</> : <>HI. I&apos;M<Star />MICKLE</>}
            cta={{ en: "Learn More →", zh: "了解更多 →" }}
            meta={lang === "zh" ? <><strong>每天 £1</strong> 的小习惯,配合一只懂金融的猫。</> : <><strong>£1 a day.</strong> Run by a cat who reads the FT.</>}
            onCta={onCta}
          />
          <Beat
            i={1}
            lang={lang}
            refCb={(el) => (beatRefs.current[1] = el)}
            statTop={{ label: { en: "Minimum deposit", zh: "门槛" }, num: "£500", plus: "o", desc: { en: "What most brokers ask. Tough luck if you have £30 a month spare.", zh: "大多数券商最低起投门槛。对每月剩 £30 的人不友好。" } }}
            head={lang === "zh" ? <>投资<Star />太贵 太难</> : <>INVESTING<Star />IS COMPLICATED</>}
            meta={lang === "zh" ? <>门槛、术语、波动 — <strong>大多数人卡在第一步。</strong></> : <>Jargon, minimums, vibes — <strong>most people give up before they start.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={2}
            lang={lang}
            refCb={(el) => (beatRefs.current[2] = el)}
            statTop={{ label: { en: "What £1 actually buys", zh: "£1 能买什么" }, num: "0.3", unit: { en: "lattes", zh: "杯" }, plus: "o", desc: { en: "A third of a London latte. Not enough to wake you up.", zh: "伦敦一杯拿铁的 1/3。还不够你早晨清醒。" } }}
            head={lang === "zh" ? <>£1<Star />能干什么</> : <>£1?<Star />HARDLY ANYTHING</>}
            meta={lang === "zh" ? <>连一杯拿铁都买不到。<strong>你也这么想过,对吧?</strong></> : <>Won&apos;t get you a London latte. <strong>We&apos;ve heard that one.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={3}
            lang={lang}
            refCb={(el) => (beatRefs.current[3] = el)}
            statTop={{ label: { en: "S&P 500", zh: "标普 500" }, num: "500", unit: { en: "co.", zh: "家" }, plus: "p", desc: { en: "The world's most profitable. Sliced thin enough that £1 fits.", zh: "全球最赚钱的 500 家公司。每天,你都买进一小片。" } }}
            head={lang === "zh" ? <>如果 £1<Star />能买 S&amp;P 500</> : <>WHAT IF £1<Star />BOUGHT S&amp;P 500</>}
            cta={{ en: "Show me the math →", zh: "看看怎么算 →" }}
            meta={lang === "zh" ? <>每天,把世界 500 强的一小片,<strong>放进你的口袋</strong>。</> : <>A daily slice of the world&apos;s 500 biggest companies. <strong>In your pocket.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={4}
            lang={lang}
            refCb={(el) => (beatRefs.current[4] = el)}
            statTop={{ label: { en: "Mickle handles", zh: "交给 Mickle" }, num: "3", unit: { en: "steps", zh: "步" }, plus: "p", desc: { en: "Charge → Buy → Allocate. You don't lift a paw.", zh: "扣款 → 集中买入 → 按比例分配。你只负责出现。" } }}
            head={lang === "zh" ? <>自动<Star />集中<Star />公平</> : <>AUTO<Star />POOLED<Star />FAIR</>}
            meta={lang === "zh" ? <>Mickle 替你扣款、批量买入、按比例分配 — <strong>你只负责坚持</strong>。</> : <>We charge, pool, buy, divvy up. <strong>You just keep showing up.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={5}
            lang={lang}
            refCb={(el) => (beatRefs.current[5] = el)}
            statTop={{ label: { en: "Things we don't do", zh: "不做的事" }, num: "0", unit: { en: "fomo", zh: "焦虑" }, plus: "o", desc: { en: "No memecoins. No \"gems\". No vibes. Just an index.", zh: "不投机,不押注,不赌运气。只买全世界都用的指数。" } }}
            head={lang === "zh" ? <>不躁<Star />不慌</> : <>NO PUMPS<Star />NO DUMPS</>}
            meta={lang === "zh" ? <>把全球最稳的资产,<strong>按小份额慢慢攒进来</strong>。</> : <>The boring asset class. In tiny servings. <strong>On purpose.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={6}
            lang={lang}
            refCb={(el) => (beatRefs.current[6] = el)}
            statTop={{ label: { en: "After 4 years", zh: "4 年后" }, num: "£1,500", plus: "o", desc: { en: "£1/day × 4 years × 7% average. Maths, not vibes.", zh: "每天 £1 + 平均 7% 年化。复利不是魔法,是没忽略的那 £1。" } }}
            head={lang === "zh" ? <>4 年<Star />1,500 英镑</> : <>4 YEARS<Star />£1,500</>}
            cta={{ en: "See the full curve →", zh: "看看完整曲线 →" }}
            meta={lang === "zh" ? <>复利不是魔法,<strong>是你每天没忽略的那 £1</strong>。</> : <>Compounding isn&apos;t magic. <strong>It&apos;s the £1 you didn&apos;t skip.</strong></>}
            onCta={onCta}
          />
          <Beat
            i={7}
            lang={lang}
            refCb={(el) => (beatRefs.current[7] = el)}
            statTop={{ label: { en: "Best time to start", zh: "最好的开始时间" }, num: lang === "zh" ? "今天" : "Today", plus: "p", suffix: ".", desc: { en: "Not Monday. Not payday. The cat is waiting.", zh: "不是明天,不是工资日。是今天。" } }}
            head={lang === "zh" ? <>今天<Star />是最好的开始</> : <>TODAY<Star />BEATS TOMORROW</>}
            cta={{ en: "Join Mickle →", zh: "立即加入 Mickle →" }}
            meta={lang === "zh" ? <>让 <strong>明天的自己</strong>,感谢今天的你。</> : <>Tomorrow-you will thank today-you. <strong>Probably loudly.</strong></>}
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
        {HINT[lang]}
      </div>
    </div>
  );
}

function Star() {
  return <span className="star">✦</span>;
}

type StatProps = {
  label: { en: string; zh: string };
  num: string;
  unit?: { en: string; zh: string };
  suffix?: string;
  plus: "o" | "p";
  desc: { en: string; zh: string };
};

function Beat({
  i,
  lang,
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
  lang: Lang;
  refCb: (el: HTMLElement | null) => void;
  statTop: StatProps;
  statBottom?: StatProps;
  head: React.ReactNode;
  cta?: { en: string; zh: string };
  meta?: React.ReactNode;
  onCta: () => void;
  signature?: boolean;
}) {
  return (
    <section className="scrolly-beat" data-beat={i} ref={refCb}>
      <div className="grid">
        <StatCard {...statTop} lang={lang} />
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
                {cta[lang]}
              </a>
            )}
            {meta && <div className="meta">{meta}</div>}
          </div>
        </div>
        {statBottom && <StatCard {...statBottom} lang={lang} bottom />}
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
  lang,
  bottom = false,
}: StatProps & { lang: Lang; bottom?: boolean }) {
  return (
    <div className={`scrolly-stat-card${bottom ? " bottom" : ""}`}>
      <div className="label">{label[lang]}</div>
      <div className="num">
        {num}
        {suffix ? <span className={`plus-${plus}`}>{suffix}</span> : null}
        {unit ? <span className={`plus-${plus}`}>{unit[lang]}</span> : null}
        {!suffix && !unit ? <span className={`plus-${plus}`}>+</span> : null}
      </div>
      <div className="desc">{desc[lang]}</div>
    </div>
  );
}
