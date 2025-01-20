import { useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import { Mesh } from 'three'
import { useSpring, animated } from '@react-spring/three'

export function Cube() {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)

  const springs = useSpring({
    scale: clicked ? 1.5 : 1,
    color: hovered ? '#ff6b6b' : '#00ff00',
  })

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5
      meshRef.current.rotation.y += delta * 0.2
    }
  })

  return (
    <animated.mesh
      ref={meshRef}
      scale={springs.scale}
      onClick={() => setClicked(!clicked)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[2, 2, 2]} />
      <animated.meshStandardMaterial color={springs.color} metalness={0.5} roughness={0.2} />
    </animated.mesh>
  )
} 