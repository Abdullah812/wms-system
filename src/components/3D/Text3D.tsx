import { Center } from '@react-three/drei'
import { Text } from '@react-three/drei'

export function FloatingText() {
  return (
    <Center position={[0, 3, 0]}>
      <Text
        fontSize={1}
        color="#1e40af"
        anchorX="center"
        anchorY="middle"
      >
        WMS System
      </Text>
    </Center>
  )
} 