import ShaderComponent from '../components/ShaderComponent';
import { VERTEX_DEFAULT, FRAG_NetworkExploration } from "../shader/shader_code";
import { Canvas } from '@react-three/fiber';

//import { PerspectiveCamera } from 'three';

export default function ScreenspaceBackground() {
    const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1 }}>
            <Canvas           
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            camera={{ makeDefault: true }}
            pixelRatio={pixelRatio}
            >
                <ShaderComponent
                    vertShader={VERTEX_DEFAULT}
                    fragShader={FRAG_NetworkExploration}
                />
            </Canvas>
      </div>
    );
}