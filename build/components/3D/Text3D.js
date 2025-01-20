import { jsx as _jsx } from "react/jsx-runtime";
import { Center } from '@react-three/drei';
import { Text } from '@react-three/drei';
export function FloatingText() {
    return (_jsx(Center, { position: [0, 3, 0], children: _jsx(Text, { fontSize: 1, color: "#1e40af", anchorX: "center", anchorY: "middle", children: "WMS System" }) }));
}
