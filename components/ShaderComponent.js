import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from 'three';
//import { ShaderMaterial, PlaneGeometry } from "three";
//extend({ PlaneBufferGeometry, ShaderMaterial });

function ShaderComponent({vertShader, fragShader}) {
    const meshRef = useRef();
    const { viewport } = useThree();

    // update time
    useFrame((state) => {
        meshRef.current.material.uniforms.u_time.value = state.clock.getElapsedTime();
        meshRef.current.material.uniforms.u_resolution.value.set(viewport.width, viewport.height);
    });

    // Define uniforms using memoization to optimize performance
    const uniforms = useMemo(
        () => ({
            u_time: {
                type: "f",
                value: 1.0
            },
            u_resolution: {
                type: "v2",
                value: new THREE.Vector2(viewport.width, viewport.height)
            }
        }),
        []
    );

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <shaderMaterial
              uniforms={uniforms}
              vertexShader={vertShader}
              fragmentShader={fragShader}
              side={THREE.DoubleSide}
            />
        </mesh>    
    );
}

export default ShaderComponent;