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

const flightDuration = 11500
const flightDelay = 500
/** Nose angle the rocket settles into: horizontal with a slight climb. */
const restAngle = -13
/** Share of the flight spent easing the nose from its tangent into `restAngle`. */
const settleWindow = 0.18
/** Rotation that turns the artwork's natural up-right nose into a 0° heading. */
const artworkAngleOffset = 34

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

function buildSmoothPath(points: Point[]) {
  const start = points[0]
  const segments = points.slice(0, -1).map((current, index) => {
    const previous = points[index - 1] ?? current
    const next = points[index + 1]
    const afterNext = points[index + 2] ?? next
    const firstControl = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    }
    const secondControl = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    }

    return `C ${firstControl.x} ${firstControl.y}, ${secondControl.x} ${secondControl.y}, ${next.x} ${next.y}`
  })

  return {
    start: `M ${start.x} ${start.y}`,
    segments,
  }
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
  const isDesktop = pageWidth >= 1024 && hasVisibleAvatar
  const contentGutter = content ? Math.min(content.left, pageWidth - content.right) : pageWidth * 0.045
  const edge = clamp(contentGutter * 0.55, 24, 68)
  const rightEdge = pageWidth - edge
  const leftEdge = edge
  const stop: Point = {
    x: isDesktop ? pageWidth - clamp(pageWidth * 0.065, 72, 104) : pageWidth - 34,
    y: hero.top + (isDesktop ? 112 : 92),
  }

  let introPoints: Point[]

  if (isDesktop && avatar) {
    const startY = title.top + title.height * 0.35
    const firstTurnX = title.left + title.width * 0.28
    const firstTurnY = title.top + title.height * 0.9
    const loopTopY = title.top - title.height * 0.05
    const loopRightX = title.left + title.width * 0.68
    const titleExitX = title.right + 24
    const titleExitY = title.bottom + 18
    const avatarCrossX = avatar.left + avatar.width * 0.48
    const avatarCrossY = avatar.top + avatar.height * 0.34

    introPoints = [
      { x: -72, y: startY },
      { x: title.left - 38, y: title.top - 14 },
      { x: firstTurnX, y: firstTurnY },
      { x: loopRightX, y: title.top + title.height * 0.28 },
      { x: title.left + title.width * 0.46, y: loopTopY },
      { x: title.left + title.width * 0.08, y: title.bottom + 36 },
      { x: titleExitX, y: titleExitY },
      { x: avatar.left - 52, y: avatarCrossY },
      { x: avatarCrossX, y: avatarCrossY },
      stop,
    ]
  } else {
    const startY = title.top + title.height * 0.32
    const loopCenterX = title.left + title.width * 0.58
    const loopCenterY = title.bottom + 12

    introPoints = [
      { x: -48, y: startY },
      { x: title.left - 18, y: title.top + 4 },
      { x: loopCenterX, y: loopCenterY },
      { x: title.right + 22, y: title.top - 18 },
      { x: loopCenterX, y: title.top + title.height * 0.18 },
      { x: title.left + title.width * 0.42, y: title.bottom + 28 },
      { x: title.right + 20, y: title.bottom + 18 },
      stop,
    ]
  }

  const footerDestinationY = clamp(
    footer.top + footer.height * 0.45,
    handoff.bottom + 70,
    pageHeight - 60,
  )
  const continuationPoints: Point[] = isDesktop
    ? [
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
    : [
        { x: stop.x - 12, y: Math.max(hero.top + 28, stop.y - 60) },
        { x: rightEdge, y: how.top + 100 },
        { x: pageWidth - edge * 1.4, y: how.bottom - 28 },
        { x: rightEdge, y: questions.top + 100 },
        { x: pageWidth - edge * 1.55, y: questions.bottom - 28 },
        { x: rightEdge, y: sample.top + 100 },
        { x: pageWidth - edge * 1.45, y: sample.bottom - 28 },
        { x: rightEdge, y: handoff.top + 72 },
        { x: pageWidth - edge * 1.6, y: footerDestinationY },
      ]

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
    let flownReveal = 0
    let scrollReveal = 0
    let scrollRouteSamples: RouteSample[] = []
    let flightStart = performance.now() + flightDelay
    let flightIsActive = window.scrollY <= 6
    let initialized = false
    let isDisposed = false

    /** Reveal target for the trail beyond the hero, mapped from page scroll. */
    function getScrollReveal() {
      if (totalLength <= 0 || scrollRouteSamples.length < 2) return 0

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

      return nearestSample.distance / totalLength
    }

    function renderRocket(distance: number, settleBlend: number) {
      if (totalLength <= 0) return

      const safeDistance = clamp(distance, 0, introLength)
      const point = journeyPath.getPointAtLength(safeDistance)
      const probe = journeyPath.getPointAtLength(clamp(safeDistance + 3, 0, totalLength))
      const heading = Math.atan2(probe.y - point.y, probe.x - point.x) * (180 / Math.PI)
      const angle = heading + shortestAngleDelta(heading, restAngle) * settleBlend

      journeyRocket.setAttribute(
        'transform',
        `translate(${point.x} ${point.y}) rotate(${angle + artworkAngleOffset})`,
      )
    }

    function renderTrail() {
      const reveal = flightIsActive ? flownReveal : Math.max(flownReveal, scrollReveal)
      journeyRevealPath.style.strokeDasharray = `${clamp(reveal, 0, 1)} 1`
    }

    function park() {
      flightIsActive = false
      flownReveal = totalLength > 0 ? introLength / totalLength : 0
      scrollReveal = getScrollReveal()
      renderRocket(introLength, 1)
      renderTrail()
    }

    function animate(time: number) {
      animationFrame = 0

      if (!flightIsActive) {
        park()
        return
      }

      const progress = clamp((time - flightStart) / flightDuration, 0, 1)
      const distance = easeInOutSine(progress) * introLength
      const settleBlend = easeOutCubic(clamp((progress - (1 - settleWindow)) / settleWindow, 0, 1))

      flownReveal = totalLength > 0 ? distance / totalLength : 0
      renderRocket(distance, settleBlend)
      renderTrail()

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate)
      } else {
        park()
      }
    }

    function scheduleAnimation() {
      if (!animationFrame && flightIsActive) {
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
      scrollRouteSamples = Array.from({ length: 481 }, (_, index) => {
        const progress = index / 480
        const distance = introLength + progress * (totalLength - introLength)
        return { distance, y: journeyPath.getPointAtLength(distance).y }
      })

      if (!initialized) {
        initialized = true
        if (flightIsActive) {
          flightStart = performance.now() + flightDelay
        }
      }

      scrollReveal = getScrollReveal()
      journeyLayer.dataset.ready = 'true'
      journeyRocketLayer.dataset.ready = 'true'

      if (flightIsActive) {
        scheduleAnimation()
      } else {
        park()
      }
    }

    function queueRouteRebuild() {
      if (layoutFrame) return
      layoutFrame = window.requestAnimationFrame(rebuildRoute)
    }

    function handleScroll() {
      if (!initialized) return

      scrollReveal = getScrollReveal()
      if (!flightIsActive) renderTrail()
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
