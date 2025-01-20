import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'

export function Logo3D() {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={1.5}>
      {/* الحرف W */}
      <mesh position={[-1, 0, 0]}>
        <boxGeometry args={[0.4, 2, 0.2]} />
        <meshStandardMaterial color="#1e40af" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.4, 2, 0.2]} />
        <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[1, 0, 0]}>
        <boxGeometry args={[0.4, 2, 0.2]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* الحرف S */}
      <mesh position={[2, 0.5, 0]}>
        <torusGeometry args={[0.5, 0.2, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[2, -0.5, 0]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.5, 0.2, 16, 32, Math.PI]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
} 