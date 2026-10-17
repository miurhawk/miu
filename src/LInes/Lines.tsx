import { vars } from "../theme.css.ts";
import {
    tessellateButton,
    tessellateButtons,
    tessellateCanvasWrap,
    tessellateContainer,
    tessellateField,
    tessellateFieldLabel,
    tessellateLegend,
    tessellatePanel,
    tessellatePrimary,
    tessellateSection,
    tessellateSegment,
    tessellateSegmentActive,
    tessellateSegmented,
    tessellateValue
} from "./lines.css.ts";
import { type ReactNode, useId, useMemo, useRef, useState } from "react";

type TessellateColorMode = "direction" | "position" | "length" | "random"
const DEFAULTS: TessellateSettings = {
    lines: 380,
    length: 90,
    step: 5,
    noiseScale: 2.2,
    curl: 1.6,
    swirl: 0.3,
    angle: 0,
    symmetry: 1,
    mirror: false,
    strokeWidth: 1.2,
    widthJitter: 0.5,
    opacity: 0.75,
    colorMode: "direction",
    hueStart: 190,
    hueRange: 150,
    bands: 1,
    saturation: 75,
    lightness: 62,
    variation: 8,
    background: "#0f1220",
    seed: 7,
}
interface TessellateSettings {
    lines: number // how many lines to trace
    length: number // steps per line
    step: number // px moved per step (bigger = longer, rougher lines)
    noiseScale: number // how many "waves" the flow field has across the canvas
    curl: number // how strongly the field bends the lines
    swirl: number // 0..1, blends in a spiral around the centre
    angle: number // base direction in degrees
    symmetry: number // number of rotated copies (1 = none)
    mirror: boolean // also add a mirrored copy of each rotation
    strokeWidth: number
    widthJitter: number // 0..1, random variation in line width
    opacity: number
    colorMode: TessellateColorMode
    hueStart: number
    hueRange: number
    bands: number
    saturation: number
    lightness: number
    variation: number // random lightness jitter per line
    background: string
    seed: number
}

const W = 800
const H = 800

type Pt = [number, number]

/* ---------- helpers ---------- */

function mulberry32(a: number) {
    return () => {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

/** 0 -> 1 -> 0 -> 1 ... so repeated palette bands blend smoothly. */
const pingpong = (u: number) => {
    const m = ((u % 2) + 2) % 2
    return 1 - Math.abs(m - 1)
}

interface Line {
    d: string
    color: string
    width: number
}

/** Smooth path through the points using quadratic curves between midpoints. */
function smoothPath(pts: Pt[]): string {
    const f = (n: number) => n.toFixed(1)
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
    for (let i = 1; i < pts.length - 1; i++) {
        const mx = (pts[i][0] + pts[i + 1][0]) / 2
        const my = (pts[i][1] + pts[i + 1][1]) / 2
        d += `Q${f(pts[i][0])} ${f(pts[i][1])} ${f(mx)} ${f(my)}`
    }
    const last = pts[pts.length - 1]
    return d + `L${f(last[0])} ${f(last[1])}`
}

/** Trace lines through a noise-driven flow field. */
function buildLines(s: TessellateSettings): Line[] {
    const rand = mulberry32(s.seed * 7919 + 13)
    const noise = makeNoise(s.seed)
    const base = (s.angle * Math.PI) / 180
    const maxD = Math.hypot(W, H) / 2
    const out: Line[] = []

    for (let i = 0; i < s.lines; i++) {
        const sx = rand() * W
        const sy = rand() * H
        let x = sx
        let y = sy
        const pts: Pt[] = [[x, y]]
        let heading = 0

        for (let k = 0; k < s.length; k++) {
            const n = noise((x / W) * s.noiseScale, (y / H) * s.noiseScale)
            const a = base + (n - 0.5) * Math.PI * 2 * s.curl
            let vx = Math.cos(a)
            let vy = Math.sin(a)
            if (s.swirl > 0) {
                const dx = x - W / 2
                const dy = y - H / 2
                const r = Math.hypot(dx, dy) || 1
                vx = vx * (1 - s.swirl) + (-dy / r) * s.swirl
                vy = vy * (1 - s.swirl) + (dx / r) * s.swirl
            }
            const m = Math.hypot(vx, vy) || 1
            vx /= m
            vy /= m
            if (k === 0) heading = Math.atan2(vy, vx)
            x += vx * s.step
            y += vy * s.step
            if (x < -30 || x > W + 30 || y < -30 || y > H + 30) break
            pts.push([x, y])
        }

        const colorRoll = rand()
        const jitterRoll = rand()
        const widthRoll = rand()
        if (pts.length < 3) continue

        let t: number
        switch (s.colorMode) {
            case "position":
                t = Math.min(1, Math.hypot(sx - W / 2, sy - H / 2) / maxD)
                break
            case "length":
                t = pts.length / (s.length + 1)
                break
            case "random":
                t = colorRoll
                break
            default:
                t = (((heading / (Math.PI * 2)) % 1) + 1) % 1
        }
        const hue = (((s.hueStart + s.hueRange * pingpong(t * s.bands)) % 360) + 360) % 360
        const light = clamp(s.lightness + (jitterRoll - 0.5) * 2 * s.variation, 4, 96)

        out.push({
            d: smoothPath(pts),
            color: `hsl(${hue.toFixed(1)} ${s.saturation}% ${light.toFixed(1)}%)`,
            width: Math.max(0.2, s.strokeWidth * (1 + (widthRoll * 2 - 1) * s.widthJitter)),
        })
    }
    return out
}


/** Smooth 2D value noise in 0..1, seeded. */
function makeNoise(seed: number) {
    const hash = (x: number, y: number) => {
        let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed + 1, 982451653)
        h = Math.imul(h ^ (h >>> 13), 1274126177)
        h ^= h >>> 16
        return (h >>> 0) / 4294967296
    }
    const smooth = (t: number) => t * t * (3 - 2 * t)
    const base = (x: number, y: number) => {
        const xi = Math.floor(x)
        const yi = Math.floor(y)
        const xf = smooth(x - xi)
        const yf = smooth(y - yi)
        const a = hash(xi, yi)
        const b = hash(xi + 1, yi)
        const c = hash(xi, yi + 1)
        const d = hash(xi + 1, yi + 1)
        const top = a + (b - a) * xf
        const bottom = c + (d - c) * xf
        return top + (bottom - top) * yf
    }
    // two octaves for a bit of finer wobble
    return (x: number, y: number) => base(x, y) * 0.65 + base(x * 2 + 17.3, y * 2 + 31.7) * 0.35
}



/* ---------- small UI pieces ---------- */

function Slider(props: {
    label: string
    value: number
    min: number
    max: number
    step?: number
    suffix?: string
    onChange: (v: number) => void
}) {
    const { label, value, min, max, step = 1, suffix = "", onChange } = props
    return (
        <label className={tessellateField}>
      <span className={tessellateFieldLabel}>
        {label}
          <span className={tessellateValue}>
          {Number.isInteger(step) ? value : value.toFixed(2)}
              {suffix}
        </span>
      </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                style={{ width: "100%", accentColor: vars.color.coral }}
            />
        </label>
    )
}

function Segmented<T extends string>(props: {
    label: string
    value: T
    options: readonly T[]
    onChange: (v: T) => void
}) {
    return (
        <div className={tessellateField}>
            <span className={tessellateFieldLabel}>{props.label}</span>
            <div className={tessellateSegmented} role="radiogroup" aria-label={props.label}>
                {props.options.map((o) => (
                    <button
                        key={o}
                        type="button"
                        role="radio"
                        className={props.value === o ? tessellateSegmentActive : tessellateSegment}
                        aria-checked={props.value === o}
                        onClick={() => props.onChange(o)}
                    >
                        {o}
                    </button>
                ))}
            </div>
        </div>
    )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <fieldset className={tessellateSection}>
            <legend className={tessellateLegend}>{title}</legend>
            {children}
        </fieldset>
    )
}

export const Lines = () => {

    const [s, setS] = useState<TessellateSettings>(DEFAULTS)
    const svgRef = useRef<SVGSVGElement>(null)
    const groupId = `tess-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`

    const set = <K extends keyof TessellateSettings>(key: K, value: TessellateSettings[K]) =>
        setS((prev) => ({ ...prev, [key]: value }))

    const lines = useMemo(() => buildLines(s), [s])

    // one <use> per rotated (and optionally mirrored) copy of the line group
    const copies = useMemo(() => {
        const list: string[] = []
        for (let k = 0; k < s.symmetry; k++) {
            const a = (360 / s.symmetry) * k
            list.push(`rotate(${a} ${W / 2} ${H / 2})`)
            if (s.mirror) list.push(`translate(${W} 0) scale(-1 1) rotate(${a} ${W / 2} ${H / 2})`)
        }
        return list
    }, [s.symmetry, s.mirror])

    const randomize = () => {
        const r = Math.random
        const pick = <T,>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)]
        setS((prev) => ({
            ...prev,
            noiseScale: Math.round((0.8 + r() * 4.2) * 10) / 10,
            curl: Math.round((0.6 + r() * 2.4) * 10) / 10,
            swirl: pick([0, 0.15, 0.3, 0.5, 0.8]),
            angle: Math.floor(r() * 360),
            symmetry: pick([1, 1, 2, 3, 4, 6, 8]),
            mirror: r() > 0.6,
            colorMode: pick(["direction", "position", "length", "random"] as const),
            hueStart: Math.floor(r() * 360),
            hueRange: Math.round((r() > 0.5 ? 1 : -1) * (40 + r() * 260)),
            bands: 1 + Math.floor(r() * 3),
            seed: Math.floor(r() * 9999) + 1,
        }))
    }

    const download = () => {
        const svg = svgRef.current
        if (!svg) return
        const xml = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([xml], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "tessellation.svg"
        a.click()
        URL.revokeObjectURL(url)
    }

    return (<>
            <h1>Lines</h1>

        <div className={tessellateContainer}>
            <div className={tessellateCanvasWrap}>
                <svg
                    ref={svgRef}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox={`0 0 ${W} ${H}`}
                    role="img"
                    aria-label="Generated tessellation design"
                    style={{ width: "100%", height: "auto", display: "block", borderRadius: 12 }}
                >
                    <rect width={W} height={H} fill={"transparent"} />
                    <defs>
                        <g
                            id={groupId}
                            fill="none"
                            strokeOpacity={s.opacity}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {lines.map((l, i) => (
                                <path key={i} d={l.d} stroke={l.color} strokeWidth={l.width} />
                            ))}
                        </g>
                    </defs>
                    {copies.map((transform, i) => (
                        <use key={i} href={`#${groupId}`} transform={transform} />
                    ))}
                </svg>
            </div>

            <div className={tessellatePanel}>
                <div className={tessellateButtons}>
                    <button type="button" className={tessellatePrimary} onClick={randomize}>
                        Randomize
                    </button>
                    <button type="button" className={tessellateButton} onClick={download}>
                        Download SVG
                    </button>
                    <button type="button" className={tessellateButton} onClick={() => setS(DEFAULTS)}>
                        Reset
                    </button>
                </div>

                <Section title="Flow">
                    <Slider label="Noise scale" value={s.noiseScale} min={0.5} max={6} step={0.1} onChange={(v) => set("noiseScale", v)} />
                    <Slider label="Curl" value={s.curl} min={0} max={3.5} step={0.1} onChange={(v) => set("curl", v)} />
                    <Slider label="Swirl" value={s.swirl} min={0} max={1} step={0.01} onChange={(v) => set("swirl", v)} />
                    <Slider label="Direction" value={s.angle} min={0} max={360} suffix="°" onChange={(v) => set("angle", v)} />
                </Section>
                <Section title="Lines">
                    <Slider label="Count" value={s.lines} min={20} max={1200} onChange={(v) => set("lines", v)} />
                    <Slider label="Length" value={s.length} min={10} max={250} onChange={(v) => set("length", v)} />
                    <Slider label="Step" value={s.step} min={2} max={12} step={0.5} onChange={(v) => set("step", v)} />
                    <Slider label="Width" value={s.strokeWidth} min={0.3} max={6} step={0.1} suffix="px" onChange={(v) => set("strokeWidth", v)} />
                    <Slider label="Width jitter" value={s.widthJitter} min={0} max={1} step={0.01} onChange={(v) => set("widthJitter", v)} />
                    <Slider label="Opacity" value={s.opacity} min={0.1} max={1} step={0.05} onChange={(v) => set("opacity", v)} />
                </Section>

                <Section title="Symmetry">
                    <Slider label="Copies" value={s.symmetry} min={1} max={12} onChange={(v) => set("symmetry", v)} />
                    <label className={tessellateField} style={{ flexDirection: "row", alignItems: "center", gap: 8, cursor: "pointer" }}>
                        <input
                            type="checkbox"
                            checked={s.mirror}
                            onChange={(e) => set("mirror", e.target.checked)}
                            style={{ accentColor: vars.color.coral }}
                        />
                        <span className={tessellateFieldLabel}>Mirror each copy</span>
                    </label>
                </Section>
                <Section title="Color">
                    <Segmented
                        label="Color by"
                        value={s.colorMode}
                        options={["direction", "position", "length", "random"] as const}
                        onChange={(v) => set("colorMode", v)}
                    />
                    <Slider label="Start hue" value={s.hueStart} min={0} max={360} suffix="°" onChange={(v) => set("hueStart", v)} />
                    <Slider label="Hue range" value={s.hueRange} min={-360} max={360} suffix="°" onChange={(v) => set("hueRange", v)} />
                    <Slider label="Bands" value={s.bands} min={1} max={8} onChange={(v) => set("bands", v)} />
                    <Slider label="Saturation" value={s.saturation} min={0} max={100} suffix="%" onChange={(v) => set("saturation", v)} />
                    <Slider label="Lightness" value={s.lightness} min={10} max={90} suffix="%" onChange={(v) => set("lightness", v)} />
                    <Slider label="Variation" value={s.variation} min={0} max={40} onChange={(v) => set("variation", v)} />
                    <Slider label="Seed" value={s.seed} min={1} max={9999} onChange={(v) => set("seed", v)} />
                </Section>
            </div>
        </div>
        </>
    )
}