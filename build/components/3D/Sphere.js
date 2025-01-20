import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { useSpring, animated } from '@react-spring/three';
export function FloatingSphere() {
    const meshRef = useRef(null);
    const [hovered, setHovered] = useState(false);
    const { scale, color } = useSpring({
        scale: hovered ? 1.2 : 1,
        color: hovered ? '#60a5fa' : '#3b82f6',
    });
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.5;
        }
    });
    return (_jsxs(animated.mesh, { ref: meshRef, position: [3, 0, 0], scale: scale, onPointerOver: () => setHovered(true), onPointerOut: () => setHovered(false), children: [_jsx("sphereGeometry", { args: [1, 32, 32] }), _jsx(animated.meshStandardMaterial, { color: color, metalness: 0.8, roughness: 0.2 })] }));
}
