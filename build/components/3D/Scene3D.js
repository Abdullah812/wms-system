import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Logo3D } from './Logo3D';
import { FloatingText } from './Text3D';
import { Suspense } from 'react';
export function Scene3D() {
    return (_jsx("div", { className: "h-[400px] w-full", children: _jsx(Canvas, { camera: { position: [0, 2, 8] }, children: _jsxs(Suspense, { fallback: null, children: [_jsx("ambientLight", { intensity: 0.6 }), _jsx("pointLight", { position: [10, 10, 10], intensity: 1 }), _jsx("pointLight", { position: [-10, -10, -10], intensity: 0.5 }), _jsx(FloatingText, {}), _jsx(Logo3D, {}), _jsx(OrbitControls, { enableZoom: true, enablePan: true, enableRotate: true, zoomSpeed: 0.6, panSpeed: 0.5, rotateSpeed: 0.4 })] }) }) }));
}
