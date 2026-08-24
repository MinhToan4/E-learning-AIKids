import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import {
  RotateCw,
  Eye,
  Sparkles,
  RefreshCcw,
  Box,
  Compass,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Navigation,
  Scale,
  Clock,
  PieChart,
  Layers,
  Flame,
  CheckCircle2,
  Sliders,
} from 'lucide-react'
import type { AsmoVisualSpec } from '../types'
import { GRID_MAZE_10_PATHS } from '../data/asmo-3d-templates'
import { cn } from '@/shared/lib/cn'

type Props = {
  spec: AsmoVisualSpec
  className?: string
  height?: number | string
  interactive?: boolean
  onPathChange?: (newPathIndex: number) => void
  onStepChange?: (stepIndex: number) => void
}

// ── Color adjustment helper ──────────────────────────────────
function adjustHexBrightness(hex: string, delta: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  if (isNaN(num)) return hex
  const r = Math.min(255, Math.max(0, (num >> 16) + delta))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + delta))
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + delta))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

// ── Texture generator for Cube Net numbered faces ─────────────
function createFaceTexture(
  num: string,
  bgColor: string,
  label: string,
  isHighlighted: boolean = false,
): THREE.CanvasTexture {
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture({} as HTMLCanvasElement)
  }

  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  if (!ctx) return new THREE.CanvasTexture(canvas)

  // 1. Background Fill with subtle soft clay gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512)
  grad.addColorStop(0, bgColor)
  grad.addColorStop(1, adjustHexBrightness(bgColor, -30))
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 512, 512)

  // 2. Thick Outer Border
  ctx.lineWidth = isHighlighted ? 32 : 20
  ctx.strokeStyle = isHighlighted ? '#fef08a' : '#ffffff'
  ctx.strokeRect(20, 20, 512 - 40, 512 - 40)

  // 3. Corner Rivets / Dots
  ctx.fillStyle = isHighlighted ? '#fef08a' : '#ffffff'
  const r = 14
  ctx.beginPath()
  ctx.arc(46, 46, r, 0, Math.PI * 2)
  ctx.arc(512 - 46, 46, r, 0, Math.PI * 2)
  ctx.arc(46, 512 - 46, r, 0, Math.PI * 2)
  ctx.arc(512 - 46, 512 - 46, r, 0, Math.PI * 2)
  ctx.fill()

  // 4. Giant Bold Number in Center
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetX = 4
  ctx.shadowOffsetY = 6
  ctx.font = '900 250px system-ui, -apple-system, BlinkMacSystemFont, sans-serif'
  ctx.fillText(num, 256, 235)

  // 5. Bottom Subtitle (e.g. "Mặt 1", "Mặt 2")
  ctx.shadowColor = 'transparent'
  ctx.font = 'bold 44px system-ui, sans-serif'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.fillText(label, 256, 425)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

export function AsmoThreeViewer({
  spec,
  className,
  height = 360,
  interactive = true,
  onPathChange,
  onStepChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const activeGroupRef = useRef<THREE.Group | null>(null)
  const animFrameIdRef = useRef<number | null>(null)

  // Common interactive state
  const [autoRotate, setAutoRotate] = useState(spec.autoRotate ?? false)
  const [highlightStep, setHighlightStep] = useState(0)
  const [isWireframe, setIsWireframe] = useState(false)

  // 1. NET_CUBE_FOLDING State
  const [foldProgress, setFoldProgress] = useState<number>(0.0)
  const [isAutoFolding, setIsAutoFolding] = useState(false)
  const [selectedFacePair, setSelectedFacePair] = useState<string>('all')

  // 2. GRID_PATH_MAZE State
  const [isAutoPlayingPaths, setIsAutoPlayingPaths] = useState(false)
  const currentPathIdx = spec.activePathIndex ?? 0

  // 3. MATCHSTICK_FIGURE State
  const [activeWing, setActiveWing] = useState<number | 'all'>('all')

  // 4. SHADED_AREA_FRACTION State
  const [eatenCount, setEatenCount] = useState<number>(
    spec.totalSlices && spec.shadedSlices ? spec.totalSlices - spec.shadedSlices : 3,
  )

  // 5. 3D_BALANCE_SCALE State
  const [balanceStep, setBalanceStep] = useState<number>(
    spec.explanationStep !== undefined ? spec.explanationStep + 1 : 1,
  )
  const [isTilting, setIsTilting] = useState(false)

  // 6. 3D_CUBE_CLUSTER State
  const [selectedLayer, setSelectedLayer] = useState<number>(
    spec.explanationStep !== undefined ? spec.explanationStep : -1,
  )

  // 7. INTERACTIVE_CLOCK State
  const [clockHour, setClockHour] = useState<number>(spec.hour ?? 4)
  const [clockMinute, setClockMinute] = useState<number>(spec.minute ?? 10)

  // Refs for dynamic updates in animation loop
  const cubeMeshesRef = useRef<Array<{ mesh: THREE.Mesh; origColor: number; layer: number }>>([])
  const foldingGroupsRef = useRef<{
    g1: THREE.Group
    g2: THREE.Group
    g3: THREE.Group
    g4: THREE.Group
    g5: THREE.Group
    g6: THREE.Group
    faceMeshes: THREE.Mesh[]
  } | null>(null)
  const balanceRefs = useRef<{
    beam: THREE.Mesh
    leftPanGroup: THREE.Group
    rightPanGroup: THREE.Group
    leftItems: THREE.Mesh[]
    rightItems: THREE.Mesh[]
  } | null>(null)
  const clockRefs = useRef<{
    hourHand: THREE.Mesh
    minHand: THREE.Mesh
    sectorMesh: THREE.Mesh | null
    group: THREE.Group
  } | null>(null)
  const pizzaSlicesRef = useRef<THREE.Mesh[]>([])
  const matchstickGroupsRef = useRef<Array<{ cylinder: THREE.Mesh; head: THREE.Mesh; wingIdx: number }>>([])

  // Sync state when spec changes
  useEffect(() => {
    setAutoRotate(spec.autoRotate ?? false)
    setHighlightStep(0)
    setIsWireframe(false)
    setIsAutoPlayingPaths(false)
    setIsAutoFolding(false)
    setIsTilting(false)

    if (spec.hour !== undefined) setClockHour(spec.hour)
    if (spec.minute !== undefined) setClockMinute(spec.minute)
    if (spec.totalSlices && spec.shadedSlices) {
      setEatenCount(spec.totalSlices - spec.shadedSlices)
    }
    if (spec.explanationStep !== undefined) {
      setSelectedLayer(spec.explanationStep)
      setBalanceStep(spec.explanationStep + 1)
      if (spec.template === 'NET_CUBE_FOLDING') {
        if (spec.explanationStep === 0) setFoldProgress(0.0)
        else if (spec.explanationStep === 1) setFoldProgress(0.5)
        else if (spec.explanationStep >= 2) setFoldProgress(1.0)
      }
    }
  }, [spec.template, spec.explanationStep, spec.hour, spec.minute, spec.totalSlices, spec.shadedSlices])

  // Timer for auto playing through 10 grid paths
  useEffect(() => {
    if (!isAutoPlayingPaths || spec.template !== 'GRID_PATH_MAZE' || !onPathChange) return
    const timer = setInterval(() => {
      onPathChange((currentPathIdx + 1) % GRID_MAZE_10_PATHS.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [isAutoPlayingPaths, currentPathIdx, spec.template, onPathChange])

  // Timer for auto folding animation
  useEffect(() => {
    if (!isAutoFolding || spec.template !== 'NET_CUBE_FOLDING') return
    let forward = true
    const timer = setInterval(() => {
      setFoldProgress((prev) => {
        if (prev >= 1.0) forward = false
        else if (prev <= 0.0) forward = true
        return forward ? Math.min(1.0, prev + 0.08) : Math.max(0.0, prev - 0.08)
      })
    }, 80)
    return () => clearInterval(timer)
  }, [isAutoFolding, spec.template])

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 480
    const containerHeight = typeof height === 'number' ? height : container.clientHeight || 360

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(45, width / containerHeight, 0.1, 1000)
    camera.position.set(spec.camera.x, spec.camera.y, spec.camera.z)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, containerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    rendererRef.current = renderer
    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 3. Studio Lighting - Bright Soft Clay 3D
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.15)
    dirLight1.position.set(8, 14, 10)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0xfef08a, 0.5)
    dirLight2.position.set(-8, -6, -8)
    scene.add(dirLight2)

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.7)
    hemiLight.position.set(0, 20, 0)
    scene.add(hemiLight)

    // 4. Main Group
    const activeGroup = new THREE.Group()
    scene.add(activeGroup)
    activeGroupRef.current = activeGroup

    // Reset references
    cubeMeshesRef.current = []
    foldingGroupsRef.current = null
    balanceRefs.current = null
    clockRefs.current = null
    pizzaSlicesRef.current = []
    matchstickGroupsRef.current = []

    // 5. Build Template Geometry
    const { pathPoints } = buildTemplateHierarchy(
      activeGroup,
      spec,
      {
        foldProgress,
        selectedFacePair,
        activeWing,
        eatenCount,
        balanceStep,
        selectedLayer,
        clockHour,
        clockMinute,
      },
      {
        cubeMeshesRef,
        foldingGroupsRef,
        balanceRefs,
        clockRefs,
        pizzaSlicesRef,
        matchstickGroupsRef,
      },
    )

    // 6. Mouse Drag Interaction (Orbit Rotation)
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      prevMouseX = e.clientX
      prevMouseY = e.clientY

      activeGroup.rotation.y += deltaX * 0.008
      activeGroup.rotation.x += deltaY * 0.008
    }

    const onPointerUp = () => {
      isDragging = false
    }

    const canvas = renderer.domElement
    canvas.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)

    // 7. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate)

      if (autoRotate && !isDragging) {
        activeGroup.rotation.y += 0.005
      }

      // Animate ant/traveler along grid path
      const traveler = activeGroup.getObjectByName('grid_traveler')
      if (traveler && pathPoints && pathPoints.length > 1) {
        const totalDuration = (pathPoints.length - 1) * 0.6
        const t = ((Date.now() * 0.001) % totalDuration) / 0.6
        const segIdx = Math.min(Math.floor(t), pathPoints.length - 2)
        const segFrac = t - segIdx
        const pA = pathPoints[segIdx]
        const pB = pathPoints[segIdx + 1]
        if (pA && pB) {
          traveler.position.lerpVectors(pA, pB, segFrac)
        }
      }

      // Animate balance beam tilt oscillation if active
      if (balanceRefs.current && isTilting) {
        const tiltAngle = Math.sin(Date.now() * 0.004) * 0.14
        balanceRefs.current.beam.rotation.z = tiltAngle
        balanceRefs.current.leftPanGroup.position.y = 0.3 - Math.sin(tiltAngle) * 2.0
        balanceRefs.current.rightPanGroup.position.y = 0.3 + Math.sin(tiltAngle) * 2.0
      }

      renderer.render(scene, camera)
    }
    animate()

    // 8. Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return
      const newWidth = container.clientWidth
      const newHeight = typeof height === 'number' ? height : container.clientHeight || 360
      cameraRef.current.aspect = newWidth / newHeight
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // 9. Cleanup
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)

      activeGroup.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose()
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose())
          } else {
            obj.material.dispose()
          }
        }
      })
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [
    spec,
    height,
    autoRotate,
    foldProgress,
    selectedFacePair,
    activeWing,
    eatenCount,
    balanceStep,
    isTilting,
    selectedLayer,
    clockHour,
    clockMinute,
  ])

  // Actions
  const handleHighlightCubes = () => {
    if (cubeMeshesRef.current.length === 0) return
    const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x06b6d4, 0xec4899, 0x8b5cf6, 0x6366f1]
    const nextIdx = highlightStep % cubeMeshesRef.current.length
    const meshObj = cubeMeshesRef.current[nextIdx]
    const mat = meshObj.mesh.material as THREE.MeshStandardMaterial
    mat.color.setHex(colors[highlightStep % colors.length])
    setHighlightStep((prev) => prev + 1)
  }

  const handleToggleWireframe = () => {
    const next = !isWireframe
    setIsWireframe(next)
    cubeMeshesRef.current.forEach(({ mesh }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.wireframe = next
      mat.opacity = next ? 0.45 : 1.0
      mat.transparent = next
    })
  }

  const handleReset = () => {
    if (!activeGroupRef.current || !cameraRef.current) return
    activeGroupRef.current.rotation.set(0, 0, 0)
    cameraRef.current.position.set(spec.camera.x, spec.camera.y, spec.camera.z)
    cameraRef.current.lookAt(0, 0, 0)
    setHighlightStep(0)
    setIsWireframe(false)
    setAutoRotate(spec.autoRotate ?? false)
    setIsAutoFolding(false)
    setIsTilting(false)
    setSelectedFacePair('all')
    setActiveWing('all')
    setFoldProgress(0.0)

    if (spec.hour !== undefined) setClockHour(spec.hour)
    if (spec.minute !== undefined) setClockMinute(spec.minute)

    cubeMeshesRef.current.forEach(({ mesh, origColor }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.color.setHex(origColor)
      mat.wireframe = false
      mat.transparent = false
      mat.opacity = 1.0
    })
  }

  const currentPathData = GRID_MAZE_10_PATHS[currentPathIdx]

  // Calculated clock angle in degrees: |30H - 5.5M| mod 360
  const clockAngleDeg = (() => {
    const rawDiff = Math.abs(30 * (clockHour % 12) - 5.5 * clockMinute)
    const normalized = rawDiff % 360
    return normalized > 180 ? 360 - normalized : normalized
  })()

  return (
    <div
      className={cn(
        'relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-sky-50/80 via-white to-brand-50/60 border-2 border-brand-100 shadow-clay flex flex-col',
        className,
      )}
    >
      {/* ── TOP BADGES & INFO OVERLAYS ── */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 gap-2 flex-wrap">
        {/* Left helper badge */}
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-slate-800 backdrop-blur-md border border-brand-200 shadow-xs">
          <Compass className="size-3.5 text-brand-600" />
          <span>Vuốt/Kéo chuột để xoay 360°</span>
        </div>

        {/* Dynamic Template Status Banner */}
        {spec.template === 'NET_CUBE_FOLDING' && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-1 text-xs font-black backdrop-blur-md border-2 border-indigo-200 text-indigo-900 shadow-clay pointer-events-auto">
            <Box className="size-3.5 text-indigo-600" />
            <span>
              {selectedFacePair === '1_6'
                ? '✨ Mặt 1 đối diện Mặt 6 (Đáy & Nắp)'
                : selectedFacePair === '2_3'
                ? '✨ Mặt 2 đối diện Mặt 3 (Hai bên)'
                : selectedFacePair === '4_5'
                ? '✨ Mặt 4 đối diện Mặt 5 (Trước & Sau)'
                : foldProgress >= 0.95
                ? '📦 Hộp 3D Đã Gập Kín'
                : foldProgress > 0.05
                ? `📐 Đang Gập ${Math.round(foldProgress * 100)}%`
                : '📄 Tấm Bìa Trải Phẳng 2D'}
            </span>
          </div>
        )}

        {spec.template === 'GRID_PATH_MAZE' && onPathChange && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-1 backdrop-blur-md border-2 border-cyan-200 text-slate-800 shadow-clay pointer-events-auto">
            <Navigation className="size-3.5 text-cyan-600" />
            <span className="text-xs font-black text-cyan-900">
              {currentPathData?.name || `Đường ${currentPathIdx + 1}`}:
            </span>
            <span className="text-xs font-mono font-black text-amber-600">
              {currentPathData?.code}
            </span>
          </div>
        )}

        {spec.template === 'SHADED_AREA_FRACTION' && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-1 text-xs font-black backdrop-blur-md border-2 border-amber-200 text-slate-800 shadow-clay pointer-events-auto">
            <PieChart className="size-3.5 text-amber-600" />
            <span>
              Còn lại: <strong className="text-emerald-600">{10 - eatenCount}/10</strong> • Đã ăn: <strong className="text-rose-600">{eatenCount}/10</strong>
            </span>
          </div>
        )}

        {spec.template === 'INTERACTIVE_CLOCK' && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-1 text-xs font-black backdrop-blur-md border-2 border-indigo-200 text-slate-800 shadow-clay pointer-events-auto">
            <Clock className="size-3.5 text-indigo-600" />
            <span>
              {clockHour}:{clockMinute < 10 ? `0${clockMinute}` : clockMinute} ➔ Góc kẹp: <strong className="text-emerald-600">{clockAngleDeg}°</strong>
            </span>
          </div>
        )}

        {spec.template === '3D_BALANCE_SCALE' && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-white/95 px-3 py-1 text-xs font-black backdrop-blur-md border-2 border-amber-200 text-slate-800 shadow-clay pointer-events-auto">
            <Scale className="size-3.5 text-amber-600" />
            <span>
              {balanceStep === 1 ? '2 🍉 = 6 🍊 (Thăng bằng)' : balanceStep === 2 ? 'Chia đôi: -1 🍉 & -3 🍊' : 'Kết quả: 1 🍉 = 3 🍊'}
            </span>
          </div>
        )}
      </div>

      {/* ── 3D VIEWPORT CANVAS ── */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* ── DEDICATED MONTESSORI 3D MANIPULATIVE CONTROLS TOOLBAR ── */}
      {interactive && (
        <div className="p-3 bg-white/95 border-t border-slate-200/80 backdrop-blur-md space-y-2.5 z-10">
          {/* 1. NET_CUBE_FOLDING Interactive Controller */}
          {spec.template === 'NET_CUBE_FOLDING' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                  <Box className="size-3.5 text-indigo-600" />
                  <span>Cơ Chế Gấp Hộp 3D:</span>
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setFoldProgress(0.0)
                      setIsAutoFolding(false)
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                      foldProgress === 0.0
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                    )}
                  >
                    📄 Trải Phẳng (0%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFoldProgress(0.5)
                      setIsAutoFolding(false)
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                      foldProgress > 0.0 && foldProgress < 0.95
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                    )}
                  >
                    📐 Gập Đứng (50%)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFoldProgress(1.0)
                      setIsAutoFolding(false)
                    }}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                      foldProgress === 1.0
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                    )}
                  >
                    📦 Gấp Khối (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoFolding(!isAutoFolding)}
                    className={cn(
                      'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 border',
                      isAutoFolding
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border-slate-200',
                    )}
                  >
                    {isAutoFolding ? <Pause className="size-3" /> : <Play className="size-3 fill-current" />}
                    <span>{isAutoFolding ? 'Dừng' : 'Tự Gập'}</span>
                  </button>
                </div>
              </div>

              {/* Opposite Face Selector Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 mr-1">
                  Mặt Đối Diện:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedFacePair(selectedFacePair === '1_6' ? 'all' : '1_6')}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border flex items-center gap-1',
                    selectedFacePair === '1_6'
                      ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200',
                  )}
                >
                  <span>🌟 1 ➔ 6: Đáy &amp; Nắp</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacePair(selectedFacePair === '2_3' ? 'all' : '2_3')}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border flex items-center gap-1',
                    selectedFacePair === '2_3'
                      ? 'bg-cyan-600 text-white border-cyan-700 ring-2 ring-cyan-300'
                      : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-200',
                  )}
                >
                  <span>🌸 2 ➔ 3: Trái &amp; Phải</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFacePair(selectedFacePair === '4_5' ? 'all' : '4_5')}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border flex items-center gap-1',
                    selectedFacePair === '4_5'
                      ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200',
                  )}
                >
                  <span>🌿 4 ➔ 5: Trước &amp; Sau</span>
                </button>
                {selectedFacePair !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedFacePair('all')}
                    className="px-2 py-1 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                  >
                    Xem tất cả
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. GRID_PATH_MAZE Interactive Controller */}
          {spec.template === 'GRID_PATH_MAZE' && onPathChange && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-900 flex items-center gap-1">
                  <Navigation className="size-3.5 text-cyan-600" />
                  <span>Chọn Trong 10 Con Đường Của Chú Kiến 🐜:</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      onPathChange((currentPathIdx - 1 + GRID_MAZE_10_PATHS.length) % GRID_MAZE_10_PATHS.length)
                    }
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 cursor-pointer"
                    title="Đường trước"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlayingPaths(!isAutoPlayingPaths)}
                    className={cn(
                      'px-3 py-1 rounded-xl text-xs font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 border',
                      isAutoPlayingPaths
                        ? 'bg-cyan-600 text-white border-cyan-700 shadow-xs'
                        : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-200',
                    )}
                  >
                    {isAutoPlayingPaths ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
                    <span>{isAutoPlayingPaths ? 'Tạm Dừng' : 'Chú Kiến Tự Bò 🐜'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPathChange((currentPathIdx + 1) % GRID_MAZE_10_PATHS.length)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all text-slate-700 cursor-pointer"
                    title="Đường sau"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* 10 Path Buttons Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {GRID_MAZE_10_PATHS.map((p, idx) => {
                  const isCurrent = currentPathIdx === idx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onPathChange(idx)}
                      className={cn(
                        'shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer border',
                        isCurrent
                          ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white border-cyan-700 shadow-xs ring-2 ring-cyan-300'
                          : 'bg-slate-50 hover:bg-cyan-50 text-slate-700 border-slate-200',
                      )}
                    >
                      <span>#{idx + 1}</span>
                      <span className="font-mono text-[10px] opacity-90">{p.code}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* 3. MATCHSTICK_FIGURE Interactive Controller */}
          {spec.template === 'MATCHSTICK_FIGURE' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-900 flex items-center gap-1">
                  <Flame className="size-3.5 text-rose-600" />
                  <span>Đếm 4 Cánh Cối Xay Gió (3 Que/Cánh):</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveWing(0)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    activeWing === 0
                      ? 'bg-cyan-600 text-white border-cyan-700 ring-2 ring-cyan-300'
                      : 'bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border-cyan-200',
                  )}
                >
                  🌸 Cánh 1: 3 que (Xanh)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWing(1)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    activeWing === 1
                      ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200',
                  )}
                >
                  🌸 Cánh 2: 3 que (Vàng)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWing(2)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    activeWing === 2
                      ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200',
                  )}
                >
                  🌸 Cánh 3: 3 que (Hồng)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWing(3)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    activeWing === 3
                      ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200',
                  )}
                >
                  🌸 Cánh 4: 3 que (Tím)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveWing('all')}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer border',
                    activeWing === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 shadow-xs'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200',
                  )}
                >
                  🌟 Đếm Tất Cả: 4 × 3 = 12 que
                </button>
              </div>
            </div>
          )}

          {/* 4. SHADED_AREA_FRACTION Interactive Controller */}
          {spec.template === 'SHADED_AREA_FRACTION' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <PieChart className="size-3.5 text-amber-600" />
                  <span>Tương Tác Ăn Bánh &amp; Nhận Biết Phân Số:</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEatenCount((prev) => Math.max(0, prev - 1))}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 active:scale-95 cursor-pointer"
                  >
                    ➖ Thêm Lát Bánh
                  </button>
                  <button
                    type="button"
                    onClick={() => setEatenCount((prev) => Math.min(9, prev + 1))}
                    className="px-2 py-0.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-xs font-bold text-rose-800 active:scale-95 cursor-pointer"
                  >
                    ➕ Ăn Bớt Lát
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setEatenCount(0)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    eatenCount === 0
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200',
                  )}
                >
                  🍕 Ban Đầu: 10/10 Lát
                </button>
                <button
                  type="button"
                  onClick={() => setEatenCount(3)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    eatenCount === 3
                      ? 'bg-rose-500 text-white border-rose-600 shadow-xs ring-2 ring-rose-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200',
                  )}
                >
                  😋 Ăn Bớt 3 Lát (-3/10)
                </button>
                <button
                  type="button"
                  onClick={() => setEatenCount(3)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    eatenCount === 3
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200',
                  )}
                >
                  ✨ Còn Lại: 7/10 Lát
                </button>
              </div>
            </div>
          )}

          {/* 5. 3D_BALANCE_SCALE Interactive Controller */}
          {spec.template === '3D_BALANCE_SCALE' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                  <Scale className="size-3.5 text-amber-600" />
                  <span>3 Bước Giải Cân Thăng Bằng:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsTilting(!isTilting)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 border',
                    isTilting
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-100 hover:bg-amber-50 text-slate-700 border-slate-200',
                  )}
                >
                  <span>⚖️ {isTilting ? 'Dừng Nghiêng' : 'Nghiêng Đĩa Cân'}</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setBalanceStep(1)
                    setIsTilting(false)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    balanceStep === 1
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                  )}
                >
                  1. Ban Đầu: 2 🍉 = 6 🍊
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBalanceStep(2)
                    setIsTilting(false)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    balanceStep === 2
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                  )}
                >
                  2. Chia Đôi Cả 2 Đĩa (-1 🍉, -3 🍊)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBalanceStep(3)
                    setIsTilting(false)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    balanceStep === 3
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200',
                  )}
                >
                  3. Kết Quả: 1 🍉 = 3 🍊
                </button>
              </div>
            </div>
          )}

          {/* 6. 3D_CUBE_CLUSTER Interactive Controller */}
          {spec.template === '3D_CUBE_CLUSTER' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                  <Layers className="size-3.5 text-indigo-600" />
                  <span>Bóc Tách Từng Tầng Khối Lập Phương:</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleHighlightCubes}
                    className="inline-flex items-center gap-1 rounded-xl bg-amber-50 hover:bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200 active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="size-3 text-amber-600" />
                    <span>Đổi Màu</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleToggleWireframe}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold border transition-all active:scale-95 cursor-pointer',
                      isWireframe
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200',
                    )}
                  >
                    <Box className="size-3" />
                    <span>{isWireframe ? 'Đặc' : 'X-Ray'}</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedLayer(0)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    selectedLayer === 0
                      ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200',
                  )}
                >
                  🧱 Tầng 1: Đáy (4 khối)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLayer(1)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    selectedLayer === 1
                      ? 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200',
                  )}
                >
                  🧱 Tầng 2: Giữa (3 khối)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLayer(2)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    selectedLayer === 2
                      ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300'
                      : 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-rose-200',
                  )}
                >
                  🧱 Tầng 3: Đỉnh (1 khối)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLayer(-1)}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer border',
                    selectedLayer === -1
                      ? 'bg-indigo-600 text-white border-indigo-700 ring-2 ring-indigo-300 shadow-xs'
                      : 'bg-slate-100 hover:bg-indigo-50 text-slate-800 border-slate-200',
                  )}
                >
                  🌟 Đếm Cả Khối: 8 khối
                </button>
              </div>
            </div>
          )}

          {/* 7. INTERACTIVE_CLOCK Interactive Controller */}
          {spec.template === 'INTERACTIVE_CLOCK' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1">
                  <Clock className="size-3.5 text-indigo-600" />
                  <span>Chọn Giờ &amp; Tính Góc Kim Đồng Hồ:</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setClockHour((prev) => (prev === 1 ? 12 : prev - 1))}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 active:scale-95 cursor-pointer"
                  >
                    -1h
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockHour((prev) => (prev % 12) + 1)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 active:scale-95 cursor-pointer"
                  >
                    +1h
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockMinute((prev) => (prev < 5 ? 55 : prev - 5))}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 active:scale-95 cursor-pointer"
                  >
                    -5m
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockMinute((prev) => (prev + 5) % 60)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 active:scale-95 cursor-pointer"
                  >
                    +5m
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setClockHour(5)
                    setClockMinute(5)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    clockHour === 5 && clockMinute === 5
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200',
                  )}
                >
                  ⏰ 5:05 (122.5°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClockHour(3)
                    setClockMinute(15)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    clockHour === 3 && clockMinute === 15
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                  )}
                >
                  ⏰ 3:15 (7.5°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClockHour(6)
                    setClockMinute(30)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    clockHour === 6 && clockMinute === 30
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                  )}
                >
                  ⏰ 6:30 (15°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClockHour(12)
                    setClockMinute(0)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    clockHour === 12 && clockMinute === 0
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                  )}
                >
                  ⏰ 12:00 (0°)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClockHour(4)
                    setClockMinute(10)
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer border',
                    clockHour === 4 && clockMinute === 10
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-300'
                      : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200',
                  )}
                >
                  ⏰ 4:10 (65°)
                </button>
              </div>
            </div>
          )}

          {/* Bottom Common Actions Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAutoRotate(!autoRotate)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold border transition-all active:scale-95 cursor-pointer',
                  autoRotate
                    ? 'bg-brand-500 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200',
                )}
              >
                <RotateCw className={cn('size-3.5', autoRotate && 'animate-spin')} />
                <span>{autoRotate ? 'Dừng Xoay' : 'Tự Xoay 3D'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-xl bg-slate-50 hover:bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCcw className="size-3.5 text-sky-600" />
              <span>Reset Góc Nhìn</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Hierarchy Builders for 7 Geometry Templates ───────────────
function buildTemplateHierarchy(
  group: THREE.Group,
  spec: AsmoVisualSpec,
  state: {
    foldProgress: number
    selectedFacePair: string
    activeWing: number | 'all'
    eatenCount: number
    balanceStep: number
    selectedLayer: number
    clockHour: number
    clockMinute: number
  },
  refs: {
    cubeMeshesRef: React.MutableRefObject<Array<{ mesh: THREE.Mesh; origColor: number; layer: number }>>
    foldingGroupsRef: React.MutableRefObject<any>
    balanceRefs: React.MutableRefObject<any>
    clockRefs: React.MutableRefObject<any>
    pizzaSlicesRef: React.MutableRefObject<THREE.Mesh[]>
    matchstickGroupsRef: React.MutableRefObject<Array<{ cylinder: THREE.Mesh; head: THREE.Mesh; wingIdx: number }>>
  },
): { pathPoints?: THREE.Vector3[] } {
  let createdPathPoints: THREE.Vector3[] | undefined

  switch (spec.template) {
    case 'NET_CUBE_FOLDING': {
      // 6 Faces numbered 1..6 with soft clay colors:
      // Face 1: Indigo (#4f46e5) - Center Base at (0, 0, 0)
      // Face 2: Cyan (#06b6d4) - Right at (1, 0, 0)
      // Face 3: Pink (#ec4899) - Left at (-1, 0, 0)
      // Face 4: Emerald (#10b981) - Top at (0, 1, 0)
      // Face 5: Teal (#059669) - Bottom at (0, -1, 0)
      // Face 6: Amber (#f59e0b) - Bottom-most (Lid) at (0, -2, 0)

      const facesData = [
        { id: 1, num: '1', color: '#4f46e5', label: 'Mặt 1 (Đáy)', numColor: 0x4f46e5 },
        { id: 2, num: '2', color: '#06b6d4', label: 'Mặt 2 (Phải)', numColor: 0x06b6d4 },
        { id: 3, num: '3', color: '#ec4899', label: 'Mặt 3 (Trái)', numColor: 0xec4899 },
        { id: 4, num: '4', color: '#10b981', label: 'Mặt 4 (Trên)', numColor: 0x10b981 },
        { id: 5, num: '5', color: '#059669', label: 'Mặt 5 (Dưới)', numColor: 0x059669 },
        { id: 6, num: '6', color: '#f59e0b', label: 'Mặt 6 (Nắp)', numColor: 0xf59e0b },
      ]

      const isPair16 = state.selectedFacePair === '1_6'
      const isPair23 = state.selectedFacePair === '2_3'
      const isPair45 = state.selectedFacePair === '4_5'

      const isFaceHighlighted = (id: number) => {
        if (state.selectedFacePair === 'all') return false
        if (isPair16 && (id === 1 || id === 6)) return true
        if (isPair23 && (id === 2 || id === 3)) return true
        if (isPair45 && (id === 4 || id === 5)) return true
        return false
      }

      const isFaceActive = (id: number) => {
        if (state.selectedFacePair === 'all') return true
        return isFaceHighlighted(id)
      }

      const createFaceMesh = (fInfo: (typeof facesData)[0]) => {
        const isHighlighted = isFaceHighlighted(fInfo.id)
        const isActive = isFaceActive(fInfo.id)
        const texture = createFaceTexture(fInfo.num, fInfo.color, fInfo.label, isHighlighted)

        const geom = new THREE.PlaneGeometry(0.96, 0.96)
        const mat = new THREE.MeshStandardMaterial({
          map: texture,
          side: THREE.DoubleSide,
          roughness: 0.3,
          metalness: 0.05,
          transparent: !isActive,
          opacity: isActive ? 1.0 : 0.35,
          emissive: isHighlighted ? fInfo.numColor : 0x000000,
          emissiveIntensity: isHighlighted ? 0.6 : 0,
        })
        const mesh = new THREE.Mesh(geom, mat)

        const edgeGeom = new THREE.EdgesGeometry(geom)
        const edgeLine = new THREE.LineSegments(
          edgeGeom,
          new THREE.LineBasicMaterial({
            color: isHighlighted ? 0xfef08a : 0xffffff,
            linewidth: 2.5,
          }),
        )
        mesh.add(edgeLine)
        return mesh
      }

      const theta = state.foldProgress * (Math.PI / 2)

      // Group 1: Base Face 1 at (0, 0, 0)
      const g1 = new THREE.Group()
      const mesh1 = createFaceMesh(facesData[0])
      mesh1.position.set(0, 0, 0)
      g1.add(mesh1)
      group.add(g1)

      // Group 2: Right Face 2 - Pivot at (0.5, 0, 0)
      const g2 = new THREE.Group()
      g2.position.set(0.5, 0, 0)
      const mesh2 = createFaceMesh(facesData[1])
      mesh2.position.set(0.5, 0, 0)
      g2.add(mesh2)
      g2.rotation.y = -theta
      group.add(g2)

      // Group 3: Left Face 3 - Pivot at (-0.5, 0, 0)
      const g3 = new THREE.Group()
      g3.position.set(-0.5, 0, 0)
      const mesh3 = createFaceMesh(facesData[2])
      mesh3.position.set(-0.5, 0, 0)
      g3.add(mesh3)
      g3.rotation.y = +theta
      group.add(g3)

      // Group 4: Top Face 4 - Pivot at (0, 0.5, 0)
      const g4 = new THREE.Group()
      g4.position.set(0, 0.5, 0)
      const mesh4 = createFaceMesh(facesData[3])
      mesh4.position.set(0, 0.5, 0)
      g4.add(mesh4)
      g4.rotation.x = +theta
      group.add(g4)

      // Group 5: Bottom Face 5 - Pivot at (0, -0.5, 0)
      const g5 = new THREE.Group()
      g5.position.set(0, -0.5, 0)
      const mesh5 = createFaceMesh(facesData[4])
      mesh5.position.set(0, -0.5, 0)
      g5.add(mesh5)
      g5.rotation.x = -theta
      group.add(g5)

      // Group 6: Lid Face 6 - Child of Group 5 at local (0, -1.0, 0)
      const g6 = new THREE.Group()
      g6.position.set(0, -1.0, 0)
      const mesh6 = createFaceMesh(facesData[5])
      mesh6.position.set(0, -0.5, 0)
      g6.add(mesh6)
      g6.rotation.x = -theta
      g5.add(g6)

      refs.foldingGroupsRef.current = {
        g1,
        g2,
        g3,
        g4,
        g5,
        g6,
        faceMeshes: [mesh1, mesh2, mesh3, mesh4, mesh5, mesh6],
      }
      break
    }

    case 'GRID_PATH_MAZE': {
      const [cols, rows] = spec.gridSize ?? [3, 2]
      const offsetX = cols * 0.5
      const offsetY = rows * 0.5

      // Grid background backing - Soft white porcelain board
      const backGeom = new THREE.PlaneGeometry(cols + 0.6, rows + 0.6)
      const backMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, side: THREE.DoubleSide })
      const backPlane = new THREE.Mesh(backGeom, backMat)
      backPlane.position.set(0, 0, -0.05)
      group.add(backPlane)

      // Soft gray grid lines
      for (let i = 0; i <= cols; i++) {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(i - offsetX, -offsetY, 0),
          new THREE.Vector3(i - offsetX, rows - offsetY, 0),
        ])
        group.add(new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0xcbd5e1, linewidth: 2 })))
      }
      for (let j = 0; j <= rows; j++) {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-offsetX, j - offsetY, 0),
          new THREE.Vector3(cols - offsetX, j - offsetY, 0),
        ])
        group.add(new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0xcbd5e1, linewidth: 2 })))
      }

      // Start Node A (Emerald Green) & End Node B (Ruby Red)
      const nodeGeom = new THREE.SphereGeometry(0.22, 16, 16)
      const startNode = new THREE.Mesh(
        nodeGeom,
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, roughness: 0.2 }),
      )
      startNode.position.set(0 - offsetX, 0 - offsetY, 0.1)
      group.add(startNode)

      const endNode = new THREE.Mesh(
        nodeGeom,
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, roughness: 0.2 }),
      )
      endNode.position.set(cols - offsetX, rows - offsetY, 0.1)
      group.add(endNode)

      // Active Path
      const activeIdx = spec.activePathIndex ?? 0
      const activePathData = GRID_MAZE_10_PATHS[activeIdx]
      const rawPath = spec.customPathPoints || activePathData?.points || [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2]]

      const pathPoints = rawPath.map(([x, y]) => new THREE.Vector3(x - offsetX, y - offsetY, 0.12))
      createdPathPoints = pathPoints

      // Render glowing tube/line for active path in vivid sky blue
      const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints)
      const pathLine = new THREE.Line(
        pathGeom,
        new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 6 }),
      )
      group.add(pathLine)

      // Waypoint glowing spheres
      rawPath.forEach(([x, y], ptIdx) => {
        const isStart = ptIdx === 0
        const isEnd = ptIdx === rawPath.length - 1
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 12, 12),
          new THREE.MeshStandardMaterial({
            color: isStart ? 0x10b981 : isEnd ? 0xef4444 : 0xf59e0b,
            emissive: isStart ? 0x059669 : isEnd ? 0xdc2626 : 0xd97706,
            emissiveIntensity: 0.7,
            roughness: 0.2,
          }),
        )
        dot.position.set(x - offsetX, y - offsetY, 0.14)
        group.add(dot)
      })

      // Animated ant crawler marker along the path
      const traveler = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xd97706,
          emissiveIntensity: 0.8,
          roughness: 0.2,
        }),
      )
      traveler.name = 'grid_traveler'
      traveler.position.copy(pathPoints[0])
      group.add(traveler)
      break
    }

    case 'MATCHSTICK_FIGURE': {
      const activeWing = state.activeWing
      const matches = spec.matches ?? []

      const wingColors = [0x06b6d4, 0xf59e0b, 0xf43f5e, 0x8b5cf6]

      matches.forEach((m, matchIdx) => {
        const wingIndex = Math.floor(matchIdx / 3) // 0, 1, 2, 3
        const isWingActive = activeWing === 'all' || activeWing === wingIndex
        const wingColor = wingColors[wingIndex % wingColors.length]

        const p1 = new THREE.Vector3(...m.from)
        const p2 = new THREE.Vector3(...m.to)
        const dir = new THREE.Vector3().subVectors(p2, p1)
        const length = dir.length()

        const geom = new THREE.CylinderGeometry(
          isWingActive ? 0.075 : 0.045,
          isWingActive ? 0.075 : 0.045,
          length,
          12,
        )
        const mat = new THREE.MeshStandardMaterial({
          color: isWingActive ? wingColor : 0xcbd5e1,
          emissive: isWingActive ? wingColor : 0x000000,
          emissiveIntensity: isWingActive ? 0.5 : 0,
          transparent: !isWingActive,
          opacity: isWingActive ? 1.0 : 0.25,
          roughness: 0.3,
        })
        const cylinder = new THREE.Mesh(geom, mat)
        cylinder.position.copy(p1).addScaledVector(dir, 0.5)
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        group.add(cylinder)

        // Head of matchstick (Sulfur)
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(isWingActive ? 0.12 : 0.07, 12, 12),
          new THREE.MeshStandardMaterial({
            color: isWingActive ? 0xf43f5e : 0x94a3b8,
            emissive: isWingActive ? 0xe11d48 : 0x000000,
            emissiveIntensity: isWingActive ? 0.8 : 0,
            transparent: !isWingActive,
            opacity: isWingActive ? 1.0 : 0.25,
            roughness: 0.2,
          }),
        )
        head.position.copy(p2)
        group.add(head)

        refs.matchstickGroupsRef.current.push({ cylinder, head, wingIdx: wingIndex })
      })
      break
    }

    case 'SHADED_AREA_FRACTION': {
      const total = spec.totalSlices ?? 10
      const eaten = state.eatenCount
      const radius = 2.0

      // Plate
      const plateGeom = new THREE.CylinderGeometry(radius + 0.15, radius + 0.2, 0.1, 48)
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0xfef3c7,
        roughness: 0.5,
      })
      const plate = new THREE.Mesh(plateGeom, plateMat)
      plate.rotation.x = Math.PI / 2
      plate.position.set(0, 0, -0.1)
      group.add(plate)

      refs.pizzaSlicesRef.current = []

      // Individual Slices
      for (let i = 0; i < total; i++) {
        const isEaten = i < eaten
        const startAngle = (i / total) * Math.PI * 2
        const sliceAngle = (1 / total) * Math.PI * 2

        const sliceRadiusOffset = isEaten ? 0.4 : 0.0
        const color = isEaten ? 0xf43f5e : 0x10b981
        const emissive = isEaten ? 0xe11d48 : 0x059669
        const emissiveIntensity = 0.5
        const opacity = isEaten ? 0.85 : 1.0

        const midAngle = startAngle + sliceAngle / 2
        const offsetX = Math.cos(midAngle) * sliceRadiusOffset
        const offsetY = Math.sin(midAngle) * sliceRadiusOffset

        const geom = new THREE.CylinderGeometry(
          radius,
          radius,
          0.18,
          24,
          1,
          false,
          startAngle,
          sliceAngle * 0.94,
        )
        const mat = new THREE.MeshStandardMaterial({
          color,
          emissive,
          emissiveIntensity,
          roughness: 0.3,
          metalness: 0.1,
          transparent: opacity < 1.0,
          opacity,
        })
        const slice = new THREE.Mesh(geom, mat)
        slice.rotation.x = Math.PI / 2
        slice.position.set(offsetX, offsetY, isEaten ? 0.15 : 0)

        // Add crust border edge
        const edgeGeom = new THREE.EdgesGeometry(geom)
        const edgeLine = new THREE.LineSegments(
          edgeGeom,
          new THREE.LineBasicMaterial({
            color: isEaten ? 0xffffff : 0xd97706,
            linewidth: 1.5,
          }),
        )
        slice.add(edgeLine)

        group.add(slice)
        refs.pizzaSlicesRef.current.push(slice)
      }
      break
    }

    case '3D_BALANCE_SCALE': {
      const step = state.balanceStep

      // Base
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.25 })
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.2, 32), baseMat)
      base.position.y = -1.2
      group.add(base)

      // Pillar
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.05 })
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 16), pillarMat)
      pillar.position.y = -0.1
      group.add(pillar)

      // Beam
      const beamMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.2 })
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.15, 0.15), beamMat)
      beam.position.y = 1.0
      group.add(beam)

      // Center Pivot Pin
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.5, roughness: 0.2 }),
      )
      pin.position.set(0, 1.0, 0.1)
      group.add(pin)

      // Pans Materials
      const panMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.2, metalness: 0.1 })
      const panRimMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.4, roughness: 0.25 })

      // Left Pan Group
      const leftPanGroup = new THREE.Group()
      leftPanGroup.position.set(-2, 0.3, 0)
      const leftPan = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 24), panMat)
      leftPanGroup.add(leftPan)
      const leftPanRim = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.03, 12, 24), panRimMat)
      leftPanRim.rotation.x = Math.PI / 2
      leftPanRim.position.y = 0.04
      leftPanGroup.add(leftPanRim)
      group.add(leftPanGroup)

      // Right Pan Group
      const rightPanGroup = new THREE.Group()
      rightPanGroup.position.set(2, 0.3, 0)
      const rightPan = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 24), panMat)
      rightPanGroup.add(rightPan)
      const rightPanRim = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.03, 12, 24), panRimMat)
      rightPanRim.rotation.x = Math.PI / 2
      rightPanRim.position.y = 0.04
      rightPanGroup.add(rightPanRim)
      group.add(rightPanGroup)

      // Left Pan Watermelons
      const leftItems: THREE.Mesh[] = []
      for (let i = 0; i < 2; i++) {
        const isKept = i === 0
        const isVisible = step !== 3 || isKept
        const isDimmed = step === 2 && !isKept

        if (isVisible) {
          const wm = new THREE.Mesh(
            new THREE.SphereGeometry(0.35, 16, 16),
            new THREE.MeshStandardMaterial({
              color: 0x10b981,
              roughness: 0.25,
              metalness: 0.1,
              emissive: isKept ? 0x059669 : 0x000000,
              emissiveIntensity: isKept ? 0.6 : 0,
              transparent: isDimmed,
              opacity: isDimmed ? 0.25 : 1.0,
            }),
          )
          wm.position.set(-0.25 + i * 0.5, 0.35 + (isDimmed ? 0.3 : 0), 0)
          leftPanGroup.add(wm)
          leftItems.push(wm)
        }
      }

      // Right Pan Oranges
      const rightItems: THREE.Mesh[] = []
      for (let i = 0; i < 6; i++) {
        const isKept = i < 3
        const isVisible = step !== 3 || isKept
        const isDimmed = step === 2 && !isKept

        if (isVisible) {
          const org = new THREE.Mesh(
            new THREE.SphereGeometry(0.18, 16, 16),
            new THREE.MeshStandardMaterial({
              color: 0xf97316,
              roughness: 0.25,
              metalness: 0.05,
              emissive: isKept ? 0xea580c : 0x000000,
              emissiveIntensity: isKept ? 0.6 : 0,
              transparent: isDimmed,
              opacity: isDimmed ? 0.25 : 1.0,
            }),
          )
          const row = Math.floor(i / 3)
          const col = i % 3
          org.position.set(-0.3 + col * 0.3, 0.2 + row * 0.32 + (isDimmed ? 0.3 : 0), 0)
          rightPanGroup.add(org)
          rightItems.push(org)
        }
      }

      refs.balanceRefs.current = {
        beam,
        leftPanGroup,
        rightPanGroup,
        leftItems,
        rightItems,
      }
      break
    }

    case '3D_CUBE_CLUSTER': {
      const grid = new THREE.GridHelper(8, 8, 0x818cf8, 0xe2e8f0)
      grid.position.y = -1.35
      group.add(grid)

      const cubes = spec.cubes ?? []
      const activeLayer = state.selectedLayer

      cubes.forEach(([x, y, z]) => {
        const geom = new THREE.BoxGeometry(0.95, 0.95, 0.95)
        let color = 0x6366f1
        let opacity = 1.0

        if (activeLayer >= 0) {
          if (y === activeLayer) {
            color = activeLayer === 0 ? 0xf59e0b : activeLayer === 1 ? 0x10b981 : 0xf43f5e
            opacity = 1.0
          } else {
            opacity = 0.25
          }
        } else {
          // All layers colored distinctly: 0: Amber, 1: Emerald, 2: Coral
          color = y === 0 ? 0xf59e0b : y === 1 ? 0x10b981 : 0xf43f5e
        }

        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.25,
          metalness: 0.1,
          transparent: opacity < 1.0,
          opacity,
        })
        const mesh = new THREE.Mesh(geom, mat)
        mesh.position.set(x - 0.5, y - 0.8, z - 0.5)

        const edges = new THREE.EdgesGeometry(geom)
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2.5 }),
        )
        mesh.add(line)

        group.add(mesh)
        refs.cubeMeshesRef.current.push({ mesh, origColor: color, layer: y })
      })
      break
    }

    case 'INTERACTIVE_CLOCK': {
      const hour = state.clockHour
      const minute = state.clockMinute

      // Dial Face
      const dial = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 0.15, 48),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }),
      )
      dial.rotation.x = Math.PI / 2
      group.add(dial)

      // Gold Rim
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.08, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.25 }),
      )
      group.add(rim)

      // 12 Ticks
      for (let i = 1; i <= 12; i++) {
        const isMajor = i % 3 === 0
        const tickAngle = (i * 30 * Math.PI) / 180
        const markGeom = new THREE.BoxGeometry(
          isMajor ? 0.12 : 0.07,
          isMajor ? 0.32 : 0.2,
          0.06,
        )
        const markMat = new THREE.MeshStandardMaterial({
          color: isMajor ? 0x0f172a : 0x64748b,
        })
        const mark = new THREE.Mesh(markGeom, markMat)
        mark.position.set(Math.sin(tickAngle) * 1.8, Math.cos(tickAngle) * 1.8, 0.1)
        mark.rotation.z = -tickAngle
        group.add(mark)
      }

      // Hour Hand (Ruby Red)
      const hourTotal = (hour % 12) + minute / 60
      const hourAngle = (hourTotal * 30 * Math.PI) / 180

      const hourHandMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xdc2626,
        emissiveIntensity: 0.4,
        roughness: 0.25,
      })
      const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.06), hourHandMat)
      hourHand.position.set(Math.sin(hourAngle) * 0.45, Math.cos(hourAngle) * 0.45, 0.15)
      hourHand.rotation.z = -hourAngle
      group.add(hourHand)

      // Minute Hand (Sky Cyan)
      const minAngle = (minute * 6 * Math.PI) / 180

      const minHandMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.25,
      })
      const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.06), minHandMat)
      minHand.position.set(Math.sin(minAngle) * 0.7, Math.cos(minAngle) * 0.7, 0.18)
      minHand.rotation.z = -minAngle
      group.add(minHand)

      // Center Pin
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5, roughness: 0.25 }),
      )
      pin.position.z = 0.22
      group.add(pin)

      // Highlighted Angle Sector Arc between hour and minute hands
      let sectorMesh: THREE.Mesh | null = null
      const startRad = -hourAngle + Math.PI / 2
      let deltaRad = hourAngle - minAngle
      if (deltaRad < 0) deltaRad += Math.PI * 2
      if (deltaRad > Math.PI) {
        deltaRad = Math.PI * 2 - deltaRad
      }

      if (Math.abs(deltaRad) > 0.05) {
        const sectorGeom = new THREE.RingGeometry(0.25, 1.3, 32, 1, startRad, deltaRad)
        const sectorMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
        })
        sectorMesh = new THREE.Mesh(sectorGeom, sectorMat)
        sectorMesh.position.z = 0.12
        group.add(sectorMesh)
      }

      refs.clockRefs.current = {
        hourHand,
        minHand,
        sectorMesh,
        group,
      }
      break
    }
  }

  return { pathPoints: createdPathPoints }
}
