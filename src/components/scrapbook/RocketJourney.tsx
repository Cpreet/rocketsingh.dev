import { useEffect, useRef, useState } from 'react'

import paperRocket from '@/assets/paper-rocket.svg'

interface Point {
  x: number
  y: number
}

interface LocalRect extends Point {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
}

interface JourneyRoute {
  fullPath: string
  introPath: string
}

interface RouteSample {
  distance: number
  y: number
}

interface FlightSample {
  distance: number
  t: number
}

interface LoopSpec {
  center: Point
  rx: number
  ry: number
  tilt: number
}

type JourneyLayout = 'mobile' | 'tablet' | 'desktop'

interface RouteContext {
  avatar: LocalRect | null
  edge: number
  footerDestinationY: number
  handoff: LocalRect
  hero: LocalRect
  how: LocalRect
  leftEdge: number
  pageWidth: number
  questions: LocalRect
  rightEdge: number
  sample: LocalRect
  stop: Point
  title: LocalRect
}

const flightDuration = 12500
const flightDelay = 500
/** Nose angle the rocket settles into: horizontal with a slight climb. */
const restAngle = -13
/** Share of the flight spent easing the nose from its tangent into `restAngle`. */
const settleWindow = 0.18
/** Rotation that turns the artwork's natural up-right nose into a 0° heading. */
const artworkAngleOffset = 34
/** Centripetal Catmull–Rom; avoids the cusps uniform splines put in tight loops. */
const splineAlpha = 0.5
const loopSampleCount = 16
const headingProbe = 16
const headingSmoothMs = 80

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

function easeInOutSine(progress: number) {
  return -(Math.cos(Math.PI * progress) - 1) / 2
}

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3)
}

function shortestAngleDelta(from: number, to: number) {
  return ((((to - from) % 360) + 540) % 360) - 180
}

function distanceBetween(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

function getLocalRect(element: Element, rootRect: DOMRect): LocalRect {
  const rect = element.getBoundingClientRect()
  const left = rect.left - rootRect.left
  const top = rect.top - rootRect.top

  return {
    x: left,
    y: top,
    bottom: top + rect.height,
    height: rect.height,
    left,
    right: left + rect.width,
    top,
    width: rect.width,
  }
}

function rotateOffset(origin: Point, offset: Point, tilt: number): Point {
  const cos = Math.cos(tilt)
  const sin = Math.sin(tilt)

  return {
    x: origin.x + offset.x * cos - offset.y * sin,
    y: origin.y + offset.x * sin + offset.y * cos,
  }
}

function loopPoint(spec: LoopSpec, theta: number): Point {
  // Fuller at the bottom, tighter at the top — a paper-plane loop, not a perfect oval.
  const egg = 1 + 0.07 * Math.sin(theta)

  return rotateOffset(
    spec.center,
    { x: spec.rx * egg * Math.cos(theta), y: spec.ry * egg * Math.sin(theta) },
    spec.tilt,
  )
}

function loopTangent(spec: LoopSpec, theta: number): Point {
  const egg = 1 + 0.07 * Math.sin(theta)
  const eggDerivative = 0.07 * Math.cos(theta)
  const local = {
    x: spec.rx * (eggDerivative * Math.cos(theta) - egg * Math.sin(theta)),
    y: spec.ry * (eggDerivative * Math.sin(theta) + egg * Math.cos(theta)),
  }
  const travel = rotateOffset({ x: 0, y: 0 }, { x: -local.x, y: -local.y }, spec.tilt)
  const length = Math.hypot(travel.x, travel.y) || 1

  return { x: travel.x / length, y: travel.y / length }
}

function loopTheta(index: number) {
  return Math.PI / 2 - (index / loopSampleCount) * Math.PI * 2
}

function buildLoopPoints(spec: LoopSpec) {
  return Array.from({ length: loopSampleCount + 1 }, (_, index) =>
    loopPoint(spec, loopTheta(index)),
  )
}

function splineControl(p0: Point, p1: Point, p2: Point, p3: Point, towardNext: boolean): Point {
  const d1 = Math.pow(distanceBetween(p0, p1), splineAlpha)
  const d2 = Math.pow(distanceBetween(p1, p2), splineAlpha)
  const d3 = Math.pow(distanceBetween(p2, p3), splineAlpha)

  if (towardNext) {
    if (d1 < 1e-6 || d1 + d2 < 1e-6) {
      return {
        x: p1.x + (p2.x - p1.x) / 3,
        y: p1.y + (p2.y - p1.y) / 3,
      }
    }

    const denominator = 3 * d1 * (d1 + d2)
    return {
      x: (d1 * d1 * p2.x - d2 * d2 * p0.x + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1.x) / denominator,
      y: (d1 * d1 * p2.y - d2 * d2 * p0.y + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1.y) / denominator,
    }
  }

  if (d3 < 1e-6 || d3 + d2 < 1e-6) {
    return {
      x: p2.x - (p2.x - p1.x) / 3,
      y: p2.y - (p2.y - p1.y) / 3,
    }
  }

  const denominator = 3 * d3 * (d3 + d2)
  return {
    x: (d3 * d3 * p1.x - d2 * d2 * p3.x + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2.x) / denominator,
    y: (d3 * d3 * p1.y - d2 * d2 * p3.y + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2.y) / denominator,
  }
}

function buildSmoothPath(points: Point[]) {
  const start = points[0]
  const segments = points.slice(0, -1).flatMap((current, index) => {
    const next = points[index + 1]
    if (!start || !next) return []

    const previous = points[index - 1] ?? current
    const afterNext = points[index + 2] ?? next
    const firstControl = splineControl(previous, current, next, afterNext, true)
    const secondControl = splineControl(previous, current, next, afterNext, false)

    return [`C ${firstControl.x} ${firstControl.y}, ${secondControl.x} ${secondControl.y}, ${next.x} ${next.y}`]
  })

  return {
    start: `M ${start.x} ${start.y}`,
    segments,
  }
}

function headingAt(path: SVGPathElement, distance: number, totalLength: number) {
  const back = path.getPointAtLength(clamp(distance - headingProbe, 0, totalLength))
  const ahead = path.getPointAtLength(clamp(distance + headingProbe, 0, totalLength))

  return Math.atan2(ahead.y - back.y, ahead.x - back.x) * (180 / Math.PI)
}

function buildFlightSchedule(path: SVGPathElement, length: number): FlightSample[] {
  if (length <= 0) return [{ distance: 0, t: 0 }]

  const sampleCount = 192
  const headings = Array.from({ length: sampleCount + 1 }, (_, index) =>
    headingAt(path, (index / sampleCount) * length, length),
  )

  let cumulative = 0
  const times = [0]

  for (let index = 1; index <= sampleCount; index += 1) {
    const step = length / sampleCount
    const turn = Math.abs(shortestAngleDelta(headings[index - 1], headings[index])) * (Math.PI / 180)
    cumulative += step * (1 + Math.min(2.6, 150 * (turn / step)))
    times.push(cumulative)
  }

  return times.map((time, index) => ({
    distance: (index / sampleCount) * length,
    t: cumulative > 0 ? time / cumulative : 0,
  }))
}

function distanceAt(schedule: FlightSample[], progress: number) {
  const t = clamp(progress, 0, 1)
  if (schedule.length < 2) return schedule[0]?.distance ?? 0

  let low = 0
  let high = schedule.length - 1

  while (low < high - 1) {
    const mid = (low + high) >> 1
    if (schedule[mid].t <= t) low = mid
    else high = mid
  }

  const start = schedule[low]
  const end = schedule[high]
  const span = end.t - start.t
  const mix = span > 1e-6 ? (t - start.t) / span : 0

  return start.distance + (end.distance - start.distance) * mix
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount
}

function along(point: Point, heading: Point, distance: number): Point {
  return {
    x: point.x + heading.x * distance,
    y: point.y + heading.y * distance,
  }
}

function journeyLayout(viewportWidth: number, hasVisibleAvatar: boolean): JourneyLayout {
  if (viewportWidth >= 1024 && hasVisibleAvatar) return 'desktop'
  if (viewportWidth >= 768) return 'tablet'
  return 'mobile'
}

function loopSpecFor(layout: JourneyLayout, title: LocalRect): LoopSpec {
  const topClearance = 18

  function fit(spec: LoopSpec): LoopSpec {
    const maxRy = Math.max(spec.rx * 0.72, spec.center.y - topClearance)
    return spec.ry <= maxRy ? spec : { ...spec, ry: maxRy }
  }

  if (layout === 'desktop') {
    const rx = clamp(title.width * 0.28, 124, 176)

    return fit({
      center: {
        x: title.left + title.width * 0.4,
        y: title.top + title.height * 0.56,
      },
      rx,
      ry: clamp(Math.max(title.height * 0.78, rx * 0.94), 128, 188),
      tilt: (-18 * Math.PI) / 180,
    })
  }

  if (layout === 'tablet') {
    const rx = clamp(title.width * 0.28, 100, 140)

    return fit({
      center: {
        x: title.left + title.width * 0.5,
        y: title.top + title.height * 0.52,
      },
      rx,
      ry: clamp(Math.max(title.height * 0.58, rx * 0.95), 104, 148),
      tilt: (-15 * Math.PI) / 180,
    })
  }

  const rx = clamp(title.width * 0.18, 58, 78)

  return fit({
    center: {
      x: title.left + title.width * 0.46,
      y: title.top + title.height * 0.55,
    },
    rx,
    ry: clamp(Math.max(title.height * 0.4, rx * 1.02), 64, 90),
    tilt: (-10 * Math.PI) / 180,
  })
}

function stopFor(layout: JourneyLayout, pageWidth: number, hero: LocalRect): Point {
  if (layout === 'desktop') {
    return {
      x: pageWidth - clamp(pageWidth * 0.065, 72, 104),
      y: hero.top + 112,
    }
  }

  if (layout === 'tablet') {
    return {
      x: pageWidth - clamp(pageWidth * 0.055, 40, 68),
      y: hero.top + 176,
    }
  }

  return {
    x: pageWidth - 18,
    y: hero.top + clamp(hero.height * 0.16, 88, 120),
  }
}

function buildIntroPoints(layout: JourneyLayout, context: RouteContext): Point[] {
  const { avatar, pageWidth, stop, title } = context
  const loop = loopSpecFor(layout, title)
  const loopPoints = buildLoopPoints(loop)
  const loopEntry = loopPoints[0]
  const loopEnd = loopPoints[loopPoints.length - 1]

  if (!loopEntry || !loopEnd) return [stop]
  const entryHeading = loopTangent(loop, loopTheta(0))
  const exitHeading = loopTangent(loop, loopTheta(loopPoints.length - 1))
  const gateDistance =
    layout === 'desktop'
      ? Math.max(loop.rx * 0.5, 72)
      : layout === 'tablet'
        ? Math.max(loop.rx * 0.48, 60)
        : Math.max(loop.rx * 0.42, 40)
  const approachGate = along(loopEntry, entryHeading, -gateDistance)
  const exitGate = along(loopEnd, exitHeading, gateDistance)

  if (layout === 'desktop' && avatar) {
    const avatarCrossX = avatar.left + avatar.width * 0.48
    const avatarCrossY = avatar.top + avatar.height * 0.34

    return [
      { x: -72, y: loopEntry.y - 10 },
      { x: title.left - 40, y: loopEntry.y - 4 },
      approachGate,
      ...loopPoints,
      exitGate,
      along(exitGate, entryHeading, 90),
      { x: avatar.left - 48, y: lerp(exitGate.y, avatarCrossY, 0.45) },
      { x: avatarCrossX, y: avatarCrossY },
      stop,
    ]
  }

  if (layout === 'tablet') {
    return [
      { x: -56, y: loopEntry.y - 12 },
      { x: title.left - 28, y: loopEntry.y - 4 },
      approachGate,
      ...loopPoints,
      exitGate,
      along(exitGate, entryHeading, 80),
      { x: lerp(exitGate.x, stop.x, 0.55), y: lerp(loopEnd.y, stop.y, 0.18) },
      stop,
    ]
  }

  return [
    { x: -32, y: loopEntry.y - 6 },
    { x: Math.max(12, title.left + 8), y: loopEntry.y - 2 },
    approachGate,
    ...loopPoints,
    exitGate,
    {
      x: clamp(exitGate.x + 28, 64, pageWidth - 26),
      y: loopEnd.y + 6,
    },
    stop,
  ]
}

function buildContinuationPoints(layout: JourneyLayout, context: RouteContext): Point[] {
  const {
    edge,
    footerDestinationY,
    handoff,
    hero,
    how,
    leftEdge,
    pageWidth,
    questions,
    rightEdge,
    sample,
    stop,
  } = context

  if (layout === 'desktop') {
    return [
      { x: stop.x - 18, y: Math.max(hero.top + 28, stop.y - 76) },
      { x: rightEdge, y: how.top + Math.min(150, how.height * 0.3) },
      { x: rightEdge, y: how.bottom - 38 },
      { x: leftEdge, y: questions.top + Math.min(138, questions.height * 0.22) },
      { x: leftEdge, y: questions.bottom - 38 },
      { x: rightEdge, y: sample.top + Math.min(150, sample.height * 0.25) },
      { x: rightEdge, y: sample.bottom - 38 },
      { x: leftEdge, y: handoff.top + Math.min(96, handoff.height * 0.35) },
      { x: pageWidth - edge * 1.35, y: footerDestinationY },
    ]
  }

  if (layout === 'tablet') {
    const outer = pageWidth - edge * 1.15
    const inner = pageWidth - Math.min(edge * 2.6, pageWidth * 0.22)

    return [
      { x: stop.x - 14, y: Math.max(hero.top + 32, stop.y - 56) },
      { x: outer, y: how.top + Math.min(110, how.height * 0.22) },
      { x: inner, y: how.bottom - 36 },
      { x: outer, y: questions.top + Math.min(100, questions.height * 0.2) },
      { x: inner, y: questions.bottom - 36 },
      { x: outer, y: sample.top + Math.min(110, sample.height * 0.22) },
      { x: inner, y: sample.bottom - 36 },
      { x: outer, y: handoff.top + 68 },
      { x: pageWidth - edge * 1.45, y: footerDestinationY },
    ]
  }

  return [
    { x: stop.x - 8, y: Math.max(hero.top + 24, stop.y - 40) },
    { x: rightEdge, y: how.top + 72 },
    { x: pageWidth - edge * 1.2, y: how.bottom - 22 },
    { x: rightEdge, y: questions.top + 72 },
    { x: pageWidth - edge * 1.25, y: questions.bottom - 22 },
    { x: rightEdge, y: sample.top + 72 },
    { x: pageWidth - edge * 1.2, y: sample.bottom - 22 },
    { x: rightEdge, y: handoff.top + 56 },
    { x: pageWidth - edge * 1.35, y: footerDestinationY },
  ]
}

function buildRoute(main: HTMLElement): JourneyRoute | null {
  const titleElement = main.querySelector('[data-rocket-anchor="hero-title"]')
  const heroElement = main.querySelector('[data-rocket-anchor="hero"]')
  const howElement = main.querySelector('#how')
  const questionsElement = main.querySelector('#questions')
  const sampleElement = main.querySelector('#sample')
  const handoffElement = main.querySelector('#handoff')
  const footerElement = main.querySelector('footer')
  const contentElement = main.querySelector('[data-rocket-content]')

  if (
    !titleElement ||
    !heroElement ||
    !howElement ||
    !questionsElement ||
    !sampleElement ||
    !handoffElement ||
    !footerElement
  ) {
    return null
  }

  const rootRect = main.getBoundingClientRect()
  const pageWidth = rootRect.width
  const pageHeight = Math.max(main.scrollHeight, rootRect.height)
  const title = getLocalRect(titleElement, rootRect)
  const hero = getLocalRect(heroElement, rootRect)
  const how = getLocalRect(howElement, rootRect)
  const questions = getLocalRect(questionsElement, rootRect)
  const sample = getLocalRect(sampleElement, rootRect)
  const handoff = getLocalRect(handoffElement, rootRect)
  const footer = getLocalRect(footerElement, rootRect)
  const content = contentElement ? getLocalRect(contentElement, rootRect) : null
  const avatarElement = main.querySelector('[data-rocket-anchor="avatar"]')
  const avatar = avatarElement ? getLocalRect(avatarElement, rootRect) : null
  const hasVisibleAvatar = avatar !== null && avatar.width > 40 && avatar.height > 40
  const layout = journeyLayout(window.innerWidth, hasVisibleAvatar)
  const contentGutter = content ? Math.min(content.left, pageWidth - content.right) : pageWidth * 0.045
  const edge = clamp(contentGutter * 0.55, 24, 68)
  const rightEdge = pageWidth - edge
  const leftEdge = edge
  const stop = stopFor(layout, pageWidth, hero)
  const footerDestinationY = clamp(
    footer.top + footer.height * 0.45,
    handoff.bottom + 70,
    pageHeight - 60,
  )
  const context: RouteContext = {
    avatar,
    edge,
    footerDestinationY,
    handoff,
    hero,
    how,
    leftEdge,
    pageWidth,
    questions,
    rightEdge,
    sample,
    stop,
    title,
  }
  const introPoints = buildIntroPoints(layout, context)
  const continuationPoints = buildContinuationPoints(layout, context)

  const allPoints = [...introPoints, ...continuationPoints]
  const smoothPath = buildSmoothPath(allPoints)
  const introSegmentCount = introPoints.length - 1
  const introPath = [smoothPath.start, ...smoothPath.segments.slice(0, introSegmentCount)].join(' ')

  return {
    fullPath: [smoothPath.start, ...smoothPath.segments].join(' '),
    introPath,
  }
}

export function RocketJourney() {
  const layerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const rocketLayerRef = useRef<HTMLDivElement>(null)
  const rocketSvgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const introPathRef = useRef<SVGPathElement>(null)
  const revealPathRef = useRef<SVGPathElement>(null)
  const trailHaloRef = useRef<SVGPathElement>(null)
  const trailRef = useRef<SVGPathElement>(null)
  const rocketRef = useRef<SVGGElement>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return

    const layer = layerRef.current
    const svg = svgRef.current
    const rocketLayer = rocketLayerRef.current
    const rocketSvg = rocketSvgRef.current
    const path = pathRef.current
    const introPath = introPathRef.current
    const revealPath = revealPathRef.current
    const trailHalo = trailHaloRef.current
    const trail = trailRef.current
    const rocket = rocketRef.current
    const main = layer?.closest('main')

    if (
      !layer ||
      !svg ||
      !rocketLayer ||
      !rocketSvg ||
      !path ||
      !introPath ||
      !revealPath ||
      !trailHalo ||
      !trail ||
      !rocket ||
      !main
    ) {
      return
    }

    // Keep stable, non-null element references for the animation callbacks.
    const journeyLayer = layer
    const journeySvg = svg
    const journeyRocketLayer = rocketLayer
    const journeyRocketSvg = rocketSvg
    const journeyPath = path
    const journeyIntroPath = introPath
    const journeyRevealPath = revealPath
    const journeyTrailHalo = trailHalo
    const journeyTrail = trail
    const journeyRocket = rocket
    const mainElement = main

    let animationFrame = 0
    let layoutFrame = 0
    let totalLength = 0
    let introLength = 0
    let currentDistance = 0
    let targetDistance = 0
    let scrollRouteSamples: RouteSample[] = []
    let flightSchedule: FlightSample[] = [{ distance: 0, t: 0 }]
    let flightStart = performance.now() + flightDelay
    let flightIsActive = window.scrollY <= 6
    let initialized = false
    let isDisposed = false
    let previousTime = performance.now()
    let smoothedHeading: number | null = null

    function getScrollDistance() {
      if (totalLength <= 0 || scrollRouteSamples.length < 2) return introLength

      const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      const scrollProgress = clamp(window.scrollY / scrollRange, 0, 1)
      const startY = scrollRouteSamples[0].y
      const endY = scrollRouteSamples[scrollRouteSamples.length - 1].y
      const targetY = startY + scrollProgress * (endY - startY)
      let nearestSample = scrollRouteSamples[0]
      let nearestDistance = Math.abs(nearestSample.y - targetY)

      for (let index = 1; index < scrollRouteSamples.length; index += 1) {
        const sample = scrollRouteSamples[index]
        const distanceFromTarget = Math.abs(sample.y - targetY)

        if (distanceFromTarget < nearestDistance) {
          nearestSample = sample
          nearestDistance = distanceFromTarget
        }
      }

      return nearestSample.distance
    }

    function renderRocket(distance: number, settleBlend: number, headingFollow: number) {
      if (totalLength <= 0) return

      const safeDistance = clamp(distance, 0, totalLength)
      const point = journeyPath.getPointAtLength(safeDistance)
      const heading = headingAt(journeyPath, safeDistance, totalLength)

      if (smoothedHeading === null) {
        smoothedHeading = heading
      } else {
        smoothedHeading += shortestAngleDelta(smoothedHeading, heading) * headingFollow
      }

      const angle = smoothedHeading + shortestAngleDelta(smoothedHeading, restAngle) * settleBlend

      journeyRocket.setAttribute(
        'transform',
        `translate(${point.x} ${point.y}) rotate(${angle + artworkAngleOffset})`,
      )
    }

    function render(distance: number, settleBlend: number, headingFollow: number) {
      renderRocket(distance, settleBlend, headingFollow)
      journeyRevealPath.style.strokeDasharray = `${clamp(distance / totalLength, 0, 1)} 1`
    }

    function syncScrollTarget() {
      targetDistance = Math.max(introLength, getScrollDistance())
    }

    function animate(time: number) {
      animationFrame = 0
      const elapsed = Math.min(time - previousTime, 64)
      previousTime = time

      const headingFollow = 1 - Math.exp(-elapsed / headingSmoothMs)

      if (flightIsActive) {
        const progress = clamp((time - flightStart) / flightDuration, 0, 1)
        const distance = distanceAt(flightSchedule, easeInOutSine(progress))
        const settleBlend = easeOutCubic(clamp((progress - (1 - settleWindow)) / settleWindow, 0, 1))

        currentDistance = distance
        targetDistance = introLength
        render(distance, settleBlend, headingFollow)

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(animate)
          return
        }

        flightIsActive = false
        syncScrollTarget()
      }

      const difference = targetDistance - currentDistance
      const smoothing = 1 - Math.exp(-elapsed / 110)
      currentDistance += difference * smoothing

      const hasSettled = Math.abs(difference) < 0.18
      if (hasSettled) {
        currentDistance = targetDistance
      }

      const settleBlend =
        currentDistance <= introLength + 1
          ? easeOutCubic(clamp(currentDistance / introLength, 0, 1))
          : 0

      render(currentDistance, settleBlend, headingFollow)

      if (!hasSettled) {
        animationFrame = window.requestAnimationFrame(animate)
      }
    }

    function scheduleAnimation() {
      if (!animationFrame) {
        previousTime = performance.now()
        animationFrame = window.requestAnimationFrame(animate)
      }
    }

    function rebuildRoute() {
      layoutFrame = 0
      const route = buildRoute(mainElement)
      if (!route) return

      const width = mainElement.getBoundingClientRect().width
      const height = Math.max(mainElement.scrollHeight, mainElement.getBoundingClientRect().height)

      journeySvg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      journeyRocketSvg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      journeyPath.setAttribute('d', route.fullPath)
      journeyIntroPath.setAttribute('d', route.introPath)
      journeyRevealPath.setAttribute('d', route.fullPath)
      journeyTrailHalo.setAttribute('d', route.fullPath)
      journeyTrail.setAttribute('d', route.fullPath)
      totalLength = journeyPath.getTotalLength()
      introLength = journeyIntroPath.getTotalLength()
      flightSchedule = buildFlightSchedule(journeyIntroPath, introLength)
      smoothedHeading = null
      scrollRouteSamples = Array.from({ length: 481 }, (_, index) => {
        const progress = index / 480
        const distance = introLength + progress * (totalLength - introLength)
        return { distance, y: journeyPath.getPointAtLength(distance).y }
      })

      if (!initialized) {
        initialized = true
        if (flightIsActive) {
          currentDistance = 0
          targetDistance = introLength
          flightStart = performance.now() + flightDelay
        } else {
          syncScrollTarget()
          currentDistance = targetDistance
        }
      } else if (!flightIsActive) {
        const progress = totalLength > 0 ? currentDistance / totalLength : 0
        syncScrollTarget()
        currentDistance = progress * totalLength
      }

      journeyLayer.dataset.ready = 'true'
      journeyRocketLayer.dataset.ready = 'true'
      render(currentDistance, currentDistance <= introLength + 1 ? 1 : 0, 1)
      scheduleAnimation()
    }

    function queueRouteRebuild() {
      if (layoutFrame) return
      layoutFrame = window.requestAnimationFrame(rebuildRoute)
    }

    function handleScroll() {
      if (!initialized) return

      if (flightIsActive && window.scrollY > 6) {
        flightIsActive = false
        currentDistance = introLength
      }

      if (flightIsActive) return

      syncScrollTarget()
      scheduleAnimation()
    }

    const resizeObserver = new ResizeObserver(queueRouteRebuild)
    resizeObserver.observe(mainElement)
    mainElement
      .querySelectorAll('[data-rocket-anchor], #how, #questions, #sample, #handoff, footer')
      .forEach((element) => {
        resizeObserver.observe(element)
      })

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', queueRouteRebuild)
    window.addEventListener('load', queueRouteRebuild)
    void document.fonts.ready.then(() => {
      if (!isDisposed) queueRouteRebuild()
    })
    queueRouteRebuild()

    return () => {
      isDisposed = true
      resizeObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', queueRouteRebuild)
      window.removeEventListener('load', queueRouteRebuild)
      window.cancelAnimationFrame(animationFrame)
      window.cancelAnimationFrame(layoutFrame)
      delete journeyLayer.dataset.ready
      delete journeyRocketLayer.dataset.ready
    }
  }, [prefersReducedMotion])

  if (prefersReducedMotion) return null

  return (
    <>
      <div ref={layerRef} className="rocket-journey" aria-hidden="true">
        <svg ref={svgRef} className="size-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <mask id="rocket-journey-reveal" maskUnits="userSpaceOnUse">
              <path
                ref={revealPathRef}
                pathLength="1"
                fill="none"
                stroke="white"
                strokeWidth="12"
                strokeLinecap="butt"
              />
            </mask>
          </defs>

          <path ref={pathRef} fill="none" stroke="none" />
          <path ref={introPathRef} fill="none" stroke="none" />
          <g mask="url(#rocket-journey-reveal)">
            <path
              ref={trailHaloRef}
              className="rocket-journey__trail-halo"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
            <path
              ref={trailRef}
              className="rocket-journey__trail"
              fill="none"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </svg>
      </div>

      <div
        ref={rocketLayerRef}
        className="rocket-journey rocket-journey--rocket"
        aria-hidden="true"
      >
        <svg ref={rocketSvgRef} className="size-full overflow-visible" preserveAspectRatio="none">
          <g ref={rocketRef} className="rocket-journey__rocket">
            <image href={paperRocket} x="-32" y="-21" width="64" height="42" />
          </g>
        </svg>
      </div>
    </>
  )
}
