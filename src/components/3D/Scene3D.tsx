import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Logo3D } from './Logo3D'
import { FloatingText } from './Text3D'
import { Suspense } from 'react'

export function Scene3D() {
  return (
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 2, 8] }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <FloatingText />
          <Logo3D />
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            zoomSpeed={0.6}
            panSpeed={0.5}
            rotateSpeed={0.4}
          />
        </Suspense>
      </Canvas>
    </div>
  )
} 