import ShaderComponent from '../components/ViewportShader';
import { VERTEX_DEFAULT, FRAG_NetworkExploration, FRAG_ParticleNetwork1, FRAG_LightLanes } from "./shader_code";
import { Canvas } from '@react-three/fiber';

//import { PerspectiveCamera } from 'three';

export default function ScreenspaceBackground({fragShader}) {
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
                    fragShader={fragShader}
                />
            </Canvas>
      </div>
    );
}