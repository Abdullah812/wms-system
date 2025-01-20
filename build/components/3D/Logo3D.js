import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
export function Logo3D() {
    const groupRef = useRef(null);
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        }
    });
    return (_jsxs("group", { ref: groupRef, position: [0, 0, 0], scale: 1.5, children: [_jsxs("mesh", { position: [-1, 0, 0], children: [_jsx("boxGeometry", { args: [0.4, 2, 0.2] }), _jsx("meshStandardMaterial", { color: "#1e40af", metalness: 0.8, roughness: 0.2 })] }), _jsxs("mesh", { position: [0, 0, 0], rotation: [0, 0, Math.PI / 4], children: [_jsx("boxGeometry", { args: [0.4, 2, 0.2] }), _jsx("meshStandardMaterial", { color: "#2563eb", metalness: 0.8, roughness: 0.2 })] }), _jsxs("mesh", { position: [1, 0, 0], children: [_jsx("boxGeometry", { args: [0.4, 2, 0.2] }), _jsx("meshStandardMaterial", { color: "#3b82f6", metalness: 0.8, roughness: 0.2 })] }), _jsxs("mesh", { position: [2, 0.5, 0], children: [_jsx("torusGeometry", { args: [0.5, 0.2, 16, 32, Math.PI] }), _jsx("meshStandardMaterial", { color: "#60a5fa", metalness: 0.6, roughness: 0.3 })] }), _jsxs("mesh", { position: [2, -0.5, 0], rotation: [0, 0, Math.PI], children: [_jsx("torusGeometry", { args: [0.5, 0.2, 16, 32, Math.PI] }), _jsx("meshStandardMaterial", { color: "#93c5fd", metalness: 0.6, roughness: 0.3 })] })] }));
}
