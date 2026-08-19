import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCw, Eye, Sparkles, RefreshCcw, Box, Compass, Play, Pause, ChevronLeft, ChevronRight, Navigation } from 'lucide-react'
import type { AsmoVisualSpec } from '../types'
import { GRID_MAZE_10_PATHS } from '../data/asmo-3d-templates'
import { cn } from '@/shared/lib/cn'

type Props = {
  spec: AsmoVisualSpec
  className?: string
  height?: number | string
  interactive?: boolean
  onPathChange?: (newPathIndex: number) => void
}

export function AsmoThreeViewer({
  spec,
  className,
  height = 360,
  interactive = true,
  onPathChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const activeGroupRef = useRef<THREE.Group | null>(null)
  const animFrameIdRef = useRef<number | null>(null)

  const cubeMeshesRef = useRef<Array<{ mesh: THREE.Mesh; origColor: number }>>([])
  const [highlightStep, setHighlightStep] = useState(0)
  const [isWireframe, setIsWireframe] = useState(false)
  const [autoRotate, setAutoRotate] = useState(spec.autoRotate ?? false)

  // Auto-play state for grid paths simulation
  const [isAutoPlayingPaths, setIsAutoPlayingPaths] = useState(false)
  const currentPathIdx = spec.activePathIndex ?? 0

  // Sync autoRotate when template spec changes
  useEffect(() => {
    setAutoRotate(spec.autoRotate ?? false)
    setHighlightStep(0)
    setIsWireframe(false)
    setIsAutoPlayingPaths(false)
  }, [spec.template])

  // Timer for auto playing through 10 grid paths
  useEffect(() => {
    if (!isAutoPlayingPaths || spec.template !== 'GRID_PATH_MAZE' || !onPathChange) return
    const timer = setInterval(() => {
      onPathChange((currentPathIdx + 1) % GRID_MAZE_10_PATHS.length)
    }, 2200)
    return () => clearInterval(timer)
  }, [isAutoPlayingPaths, currentPathIdx, spec.template, onPathChange])

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

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85)
    dirLight1.position.set(8, 12, 10)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.5)
    dirLight2.position.set(-8, -6, -8)
    scene.add(dirLight2)

    // 4. Main Group
    const activeGroup = new THREE.Group()
    scene.add(activeGroup)
    activeGroupRef.current = activeGroup
    cubeMeshesRef.current = []

    // 5. Build Template Geometry (Centered at 0,0,0)
    const { pathPoints } = buildTemplate(activeGroup, spec, cubeMeshesRef)

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
        const totalDuration = (pathPoints.length - 1) * 0.6 // seconds
        const t = ((Date.now() * 0.001) % totalDuration) / 0.6
        const segIdx = Math.min(Math.floor(t), pathPoints.length - 2)
        const segFrac = t - segIdx
        const pA = pathPoints[segIdx]
        const pB = pathPoints[segIdx + 1]
        if (pA && pB) {
          traveler.position.lerpVectors(pA, pB, segFrac)
        }
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

      // Dispose resources
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
  }, [spec, height, autoRotate])

  // Actions
  const handleHighlight = () => {
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
    cubeMeshesRef.current.forEach(({ mesh, origColor }) => {
      const mat = mesh.material as THREE.MeshStandardMaterial
      mat.color.setHex(origColor)
      mat.wireframe = false
      mat.transparent = false
      mat.opacity = 1.0
    })
  }

  const currentPathData = GRID_MAZE_10_PATHS[currentPathIdx]

  return (
    <div className={cn('relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border border-slate-700/60 shadow-lg', className)}>
      {/* 3D Viewport */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing touch-none select-none"
      />

      {/* Grid Maze Path Navigation Overlay (When viewing template GRID_PATH_MAZE) */}
      {spec.template === 'GRID_PATH_MAZE' && onPathChange && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-2xl bg-black/60 px-3 py-1.5 backdrop-blur-md border border-cyan-500/30 text-white shadow-lg">
          <Navigation className="size-3.5 text-cyan-400" />
          <span className="text-xs font-extrabold text-cyan-300">
            {currentPathData?.name || `Đường ${currentPathIdx + 1}`}:
          </span>
          <span className="text-xs font-mono font-bold text-amber-300">
            {currentPathData?.code}
          </span>
          <div className="flex items-center gap-1 ml-1 border-l border-white/20 pl-1.5">
            <button
              type="button"
              onClick={() => onPathChange((currentPathIdx - 1 + GRID_MAZE_10_PATHS.length) % GRID_MAZE_10_PATHS.length)}
              className="p-1 rounded-lg hover:bg-white/20 active:scale-95 transition-all text-slate-300"
              title="Đường trước"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsAutoPlayingPaths(!isAutoPlayingPaths)}
              className={cn(
                'p-1 rounded-lg active:scale-95 transition-all',
                isAutoPlayingPaths ? 'bg-cyan-500 text-white' : 'hover:bg-white/20 text-slate-300',
              )}
              title={isAutoPlayingPaths ? 'Tạm dừng tự phát' : 'Tự động phát 10 con đường'}
            >
              {isAutoPlayingPaths ? <Pause className="size-3.5" /> : <Play className="size-3.5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => onPathChange((currentPathIdx + 1) % GRID_MAZE_10_PATHS.length)}
              className="p-1 rounded-lg hover:bg-white/20 active:scale-95 transition-all text-slate-300"
              title="Đường sau"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Controls Overlay */}
      {interactive && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {spec.template === '3D_CUBE_CLUSTER' && (
              <>
                <button
                  type="button"
                  onClick={handleHighlight}
                  className="inline-flex items-center gap-1 rounded-xl bg-slate-800/90 hover:bg-brand-600 px-3 py-1.5 text-xs font-bold text-white border border-slate-600 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                >
                  <Sparkles className="size-3.5 text-sun-300" />
                  Đổi màu
                </button>
                <button
                  type="button"
                  onClick={handleToggleWireframe}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold border shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer',
                    isWireframe
                      ? 'bg-brand-600 border-brand-400 text-white'
                      : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-200',
                  )}
                >
                  <Box className="size-3.5" />
                  {isWireframe ? 'Đặc' : 'X-Ray'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={cn(
                'inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold border shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer',
                autoRotate
                  ? 'bg-brand-600/90 border-brand-400 text-white shadow-sm'
                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-300',
              )}
            >
              <RotateCw className={cn('size-3.5', autoRotate && 'animate-spin')} />
              {autoRotate ? 'Dừng xoay' : 'Tự xoay 3D'}
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold text-slate-200 border border-slate-600 shadow-md backdrop-blur-md pointer-events-auto transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCcw className="size-3.5 text-sky-400" />
            Reset góc nhìn
          </button>
        </div>
      )}

      {/* Top Badge: Drag Helper */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-slate-300 backdrop-blur-md border border-white/10">
        <Compass className="size-3 text-sky-400" />
        Vuốt/Kéo chuột để xoay hình 360°
      </div>
    </div>
  )
}

// ── Builders for 7 Geometry Templates ─────────────────────────
function buildTemplate(
  group: THREE.Group,
  spec: AsmoVisualSpec,
  cubeMeshesRef: React.MutableRefObject<Array<{ mesh: THREE.Mesh; origColor: number }>>,
): { pathPoints?: THREE.Vector3[] } {
  let createdPathPoints: THREE.Vector3[] | undefined

  switch (spec.template) {
    case '3D_CUBE_CLUSTER': {
      const grid = new THREE.GridHelper(8, 8, 0x6366f1, 0x334155)
      grid.position.y = -1.35
      group.add(grid)

      const cubes = spec.cubes ?? []
      const activeLayer = spec.explanationStep !== undefined ? spec.explanationStep : -1

      cubes.forEach(([x, y, z]) => {
        const geom = new THREE.BoxGeometry(0.95, 0.95, 0.95)
        let color = 0x4f46e5
        let opacity = 1.0

        if (activeLayer >= 0) {
          if (y === activeLayer) {
            color = activeLayer === 0 ? 0xf59e0b : activeLayer === 1 ? 0x10b981 : 0x8b5cf6
            opacity = 1.0
          } else {
            opacity = 0.35
          }
        }

        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.3,
          metalness: 0.2,
          transparent: opacity < 1.0,
          opacity,
        })
        const mesh = new THREE.Mesh(geom, mat)
        // Center the cluster at (0, 0, 0)
        mesh.position.set(x - 0.5, y - 0.8, z - 0.5)

        const edges = new THREE.EdgesGeometry(geom)
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0xc7d2fe, linewidth: 2 }),
        )
        mesh.add(line)

        group.add(mesh)
        cubeMeshesRef.current.push({ mesh, origColor: color })
      })
      break
    }

    case 'GRID_PATH_MAZE': {
      const [cols, rows] = spec.gridSize ?? [3, 2]
      const offsetX = cols * 0.5
      const offsetY = rows * 0.5

      // Grid background backing
      const backGeom = new THREE.PlaneGeometry(cols + 0.6, rows + 0.6)
      const backMat = new THREE.MeshBasicMaterial({ color: 0x0f172a, side: THREE.DoubleSide })
      const backPlane = new THREE.Mesh(backGeom, backMat)
      backPlane.position.set(0, 0, -0.05)
      group.add(backPlane)

      // Grid lines
      for (let i = 0; i <= cols; i++) {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(i - offsetX, -offsetY, 0),
          new THREE.Vector3(i - offsetX, rows - offsetY, 0),
        ])
        group.add(new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 1.5 })))
      }
      for (let j = 0; j <= rows; j++) {
        const geom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-offsetX, j - offsetY, 0),
          new THREE.Vector3(cols - offsetX, j - offsetY, 0),
        ])
        group.add(new THREE.Line(geom, new THREE.LineBasicMaterial({ color: 0x475569, linewidth: 1.5 })))
      }

      // Start Node A (Green) & End Node B (Red)
      const nodeGeom = new THREE.SphereGeometry(0.22, 16, 16)
      const startNode = new THREE.Mesh(
        nodeGeom,
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669 }),
      )
      startNode.position.set(0 - offsetX, 0 - offsetY, 0.1)
      group.add(startNode)

      const endNode = new THREE.Mesh(
        nodeGeom,
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626 }),
      )
      endNode.position.set(cols - offsetX, rows - offsetY, 0.1)
      group.add(endNode)

      // Get Active Path from activePathIndex or customPathPoints
      const activeIdx = spec.activePathIndex ?? 0
      const activePathData = GRID_MAZE_10_PATHS[activeIdx]
      const rawPath = spec.customPathPoints || activePathData?.points || [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1], [3, 2]]

      const pathPoints = rawPath.map(([x, y]) => new THREE.Vector3(x - offsetX, y - offsetY, 0.12))
      createdPathPoints = pathPoints

      // Render glowing tube/line for active path
      const pathGeom = new THREE.BufferGeometry().setFromPoints(pathPoints)
      const pathLine = new THREE.Line(
        pathGeom,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 5 }),
      )
      group.add(pathLine)

      // Waypoint glowing spheres
      rawPath.forEach(([x, y], ptIdx) => {
        const isStart = ptIdx === 0
        const isEnd = ptIdx === rawPath.length - 1
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 12, 12),
          new THREE.MeshStandardMaterial({
            color: isStart ? 0x10b981 : isEnd ? 0xef4444 : 0xfbbf24,
            emissive: isStart ? 0x059669 : isEnd ? 0xdc2626 : 0xd97706,
            emissiveIntensity: 0.7,
          }),
        )
        dot.position.set(x - offsetX, y - offsetY, 0.14)
        group.add(dot)
      })

      // Animated crawling marker along the path
      const traveler = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0xf59e0b,
          emissiveIntensity: 0.9,
          roughness: 0.2,
        }),
      )
      traveler.name = 'grid_traveler'
      traveler.position.copy(pathPoints[0])
      group.add(traveler)
      break
    }

    case 'INTERACTIVE_CLOCK': {
      const activeStep = spec.explanationStep !== undefined ? spec.explanationStep : -1

      const dial = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 2.2, 0.15, 48),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 }),
      )
      dial.rotation.x = Math.PI / 2
      group.add(dial)

      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.08, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0x6366f1, metalness: 0.8 }),
      )
      group.add(rim)

      // 12 Major & Minor Tick Marks
      for (let i = 1; i <= 12; i++) {
        const isMajor = i % 3 === 0
        const isTargetHour = (activeStep === 0 && (i === (spec.hour ?? 4)))
        const isTargetMinute = (activeStep === 1 && (i === Math.round((spec.minute ?? 10) / 5)))
        
        // Clockwise angle from 12
        const tickAngle = (i * 30 * Math.PI) / 180
        const markGeom = new THREE.BoxGeometry(
          isMajor ? 0.12 : 0.07,
          isMajor ? 0.32 : 0.2,
          0.06,
        )
        const markMat = new THREE.MeshStandardMaterial({
          color: isTargetHour ? 0xef4444 : isTargetMinute ? 0x38bdf8 : isMajor ? 0xffffff : 0x94a3b8,
          emissive: isTargetHour ? 0xdc2626 : isTargetMinute ? 0x0284c7 : 0x000000,
          emissiveIntensity: (isTargetHour || isTargetMinute) ? 0.8 : 0,
        })
        const mark = new THREE.Mesh(markGeom, markMat)
        mark.position.set(Math.sin(tickAngle) * 1.8, Math.cos(tickAngle) * 1.8, 0.1)
        mark.rotation.z = -tickAngle
        group.add(mark)
      }

      // Hour & Minute values
      const hour = spec.hour ?? 4
      const minute = spec.minute ?? 10

      // Hour Hand (Red): Angle clockwise from 12
      const hourTotalHours = (hour % 12) + minute / 60
      const hourAngle = (hourTotalHours * 30 * Math.PI) / 180
      const isHourActive = activeStep === 0 || activeStep === -1 || activeStep === 2
      
      const hourHandMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: activeStep === 0 ? 0xdc2626 : 0x000000,
        emissiveIntensity: activeStep === 0 ? 0.8 : 0,
        transparent: activeStep === 1,
        opacity: activeStep === 1 ? 0.3 : 1.0,
      })
      const hourHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 1.1, 0.06),
        hourHandMat,
      )
      hourHand.position.set(Math.sin(hourAngle) * 0.45, Math.cos(hourAngle) * 0.45, 0.15)
      hourHand.rotation.z = -hourAngle
      group.add(hourHand)

      // Minute Hand (Cyan): Angle clockwise from 12
      const minAngle = (minute * 6 * Math.PI) / 180
      const isMinActive = activeStep === 1 || activeStep === -1 || activeStep === 2

      const minHandMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: activeStep === 1 ? 0x0284c7 : 0x000000,
        emissiveIntensity: activeStep === 1 ? 0.9 : 0,
        transparent: activeStep === 0,
        opacity: activeStep === 0 ? 0.3 : 1.0,
      })
      const minHand = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.6, 0.06),
        minHandMat,
      )
      minHand.position.set(Math.sin(minAngle) * 0.7, Math.cos(minAngle) * 0.7, 0.18)
      minHand.rotation.z = -minAngle
      group.add(minHand)

      // Center Pin
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 }),
      )
      pin.position.z = 0.22
      group.add(pin)
      break
    }

    case 'SHADED_AREA_FRACTION': {
      const total = spec.totalSlices ?? 10
      const shaded = spec.shadedSlices ?? 7
      const eaten = total - shaded // e.g. 3 slices eaten
      const activeStep = spec.explanationStep !== undefined ? spec.explanationStep : -1
      const radius = 2.0

      // Outer pizza wooden plate
      const plateGeom = new THREE.CylinderGeometry(radius + 0.15, radius + 0.2, 0.1, 48)
      const plateMat = new THREE.MeshStandardMaterial({
        color: 0x78350f,
        roughness: 0.8,
      })
      const plate = new THREE.Mesh(plateGeom, plateMat)
      plate.rotation.x = Math.PI / 2
      plate.position.set(0, 0, -0.1)
      group.add(plate)

      // Individual Slices Facing Camera Directly
      for (let i = 0; i < total; i++) {
        const isEatenSlice = i < eaten
        const startAngle = (i / total) * Math.PI * 2
        const sliceAngle = (1 / total) * Math.PI * 2

        // Determine slice offset and visibility based on step
        let sliceRadiusOffset = 0
        let opacity = 1.0
        let color = 0xf59e0b // Cheese Gold for all pizza
        let emissive = 0x000000
        let emissiveIntensity = 0

        if (activeStep === 0) {
          // Step 1: All 10 slices shown on plate
          color = 0xf59e0b
          opacity = 1.0
        } else if (activeStep === 1) {
          // Step 2: 3 Eaten slices are lifted and dimmed
          if (isEatenSlice) {
            color = 0xef4444
            emissive = 0xdc2626
            emissiveIntensity = 0.6
            sliceRadiusOffset = 0.35 // Lifted outward
          } else {
            color = 0x94a3b8
            opacity = 0.4
          }
        } else if (activeStep === 2 || activeStep === -1) {
          // Step 3: 7 Remaining slices brightly glowing emerald
          if (isEatenSlice) {
            opacity = 0.08 // Almost gone
            color = 0x334155
          } else {
            color = 0x10b981
            emissive = 0x059669
            emissiveIntensity = 0.8
          }
        }

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
        slice.position.set(offsetX, offsetY, 0)

        // Add crust border edge
        const edgeGeom = new THREE.EdgesGeometry(geom)
        const edgeLine = new THREE.LineSegments(
          edgeGeom,
          new THREE.LineBasicMaterial({
            color: isEatenSlice && activeStep === 1 ? 0xffffff : 0xd97706,
            transparent: opacity < 1.0,
            opacity: Math.max(opacity, 0.2),
          }),
        )
        slice.add(edgeLine)

        group.add(slice)
      }
      break
    }

    case 'MATCHSTICK_FIGURE': {
      const activeStep = spec.explanationStep !== undefined ? spec.explanationStep : -1
      const matches = spec.matches ?? []

      matches.forEach((m, matchIdx) => {
        const wingIndex = Math.floor(matchIdx / 3) // 0: Top-Right, 1: Bottom-Right, 2: Bottom-Left, 3: Top-Left
        const isWingActive = activeStep === -1 || activeStep === 4 || activeStep === wingIndex

        const p1 = new THREE.Vector3(...m.from)
        const p2 = new THREE.Vector3(...m.to)
        const dir = new THREE.Vector3().subVectors(p2, p1)
        const length = dir.length()

        const geom = new THREE.CylinderGeometry(
          isWingActive && activeStep >= 0 && activeStep < 4 ? 0.08 : 0.05,
          isWingActive && activeStep >= 0 && activeStep < 4 ? 0.08 : 0.05,
          length,
          12,
        )
        const mat = new THREE.MeshStandardMaterial({
          color: isWingActive ? 0x38bdf8 : 0x334155,
          emissive: isWingActive && activeStep >= 0 && activeStep < 4 ? 0x0284c7 : 0x000000,
          emissiveIntensity: isWingActive && activeStep >= 0 && activeStep < 4 ? 0.8 : 0,
          transparent: !isWingActive,
          opacity: isWingActive ? 1.0 : 0.2,
          roughness: 0.4,
        })
        const cylinder = new THREE.Mesh(geom, mat)
        cylinder.position.copy(p1).addScaledVector(dir, 0.5)
        cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize())
        group.add(cylinder)

        // Head of matchstick (Red sulfur)
        const head = new THREE.Mesh(
          new THREE.SphereGeometry(isWingActive && activeStep >= 0 && activeStep < 4 ? 0.12 : 0.08, 12, 12),
          new THREE.MeshStandardMaterial({
            color: isWingActive ? 0xff0055 : 0x475569,
            emissive: isWingActive ? 0xdc2626 : 0x000000,
            emissiveIntensity: isWingActive ? 0.9 : 0,
            transparent: !isWingActive,
            opacity: isWingActive ? 1.0 : 0.2,
          }),
        )
        head.position.copy(p2)
        group.add(head)
      })
      break
    }

    case 'NET_CUBE_FOLDING': {
      const activeStep = spec.explanationStep !== undefined ? spec.explanationStep : -1
      const faces = spec.faces ?? []

      faces.forEach((f, fIdx) => {
        const isBottom = fIdx === 0
        const isOpposite = fIdx === 5
        const isHighlighted = (activeStep === 0 && isBottom) || (activeStep === 2 && isOpposite) || activeStep === 1 || activeStep === -1

        const geom = new THREE.PlaneGeometry(0.92, 0.92)
        const mat = new THREE.MeshStandardMaterial({
          color: f.color,
          emissive: (activeStep === 0 && isBottom) || (activeStep === 2 && isOpposite) ? 0x4f46e5 : 0x000000,
          emissiveIntensity: 0.6,
          side: THREE.DoubleSide,
          transparent: !isHighlighted,
          opacity: isHighlighted ? 1.0 : 0.35,
        })
        const mesh = new THREE.Mesh(geom, mat)
        mesh.position.set(f.pos[0], f.pos[1], f.pos[2])

        const edges = new THREE.EdgesGeometry(geom)
        mesh.add(
          new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 }),
          ),
        )
        group.add(mesh)
      })
      break
    }

    case '3D_BALANCE_SCALE': {
      const activeStep = spec.explanationStep !== undefined ? spec.explanationStep : -1
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 0.2, 32), baseMat)
      base.position.y = -1.2
      group.add(base)

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16), baseMat)
      pillar.position.y = -0.1
      group.add(pillar)

      const beamMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6 })
      const beam = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.15, 0.15), beamMat)
      beam.position.y = 1.0
      group.add(beam)

      // Left Pan with Watermelons
      const leftPan = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 24), baseMat)
      leftPan.position.set(-2, 0.3, 0)
      group.add(leftPan)

      const leftTotal = spec.leftWeightCount ?? 2
      // If step 2 (solved), show only 1 watermelon
      const leftVisibleCount = activeStep === 2 ? 1 : leftTotal

      for (let i = 0; i < leftVisibleCount; i++) {
        const isKept = i === 0
        const wm = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 16, 16),
          new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: (activeStep === 1 && isKept) ? 0x059669 : 0x000000,
            emissiveIntensity: 0.8,
            transparent: activeStep === 1 && !isKept,
            opacity: activeStep === 1 && !isKept ? 0.25 : 1.0,
          }),
        )
        wm.position.set(-2.2 + i * 0.45, 0.65, 0)
        group.add(wm)
      }

      // Right Pan with Oranges
      const rightPan = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 24), baseMat)
      rightPan.position.set(2, 0.3, 0)
      group.add(rightPan)

      const rightTotal = spec.rightWeightCount ?? 6
      // If step 2 (solved), show only 3 oranges
      const rightVisibleCount = activeStep === 2 ? 3 : rightTotal

      for (let i = 0; i < rightVisibleCount; i++) {
        const isKept = i < 3
        const org = new THREE.Mesh(
          new THREE.SphereGeometry(0.18, 16, 16),
          new THREE.MeshStandardMaterial({
            color: 0xf97316,
            emissive: (activeStep === 1 && isKept) ? 0xea580c : 0x000000,
            emissiveIntensity: 0.8,
            transparent: activeStep === 1 && !isKept,
            opacity: activeStep === 1 && !isKept ? 0.25 : 1.0,
          }),
        )
        const row = Math.floor(i / 3)
        const col = i % 3
        org.position.set(1.7 + col * 0.3, 0.48 + row * 0.32, 0)
        group.add(org)
      }
      break
    }
  }

  return { pathPoints: createdPathPoints }
}
