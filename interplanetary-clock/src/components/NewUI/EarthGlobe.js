import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

const earthTextureUrl = '/textures/earth_tex.jpg';

function EarthGlobe() {
  const texture = useLoader(TextureLoader, earthTextureUrl);

  return (
    <mesh>
      <sphereGeometry args={[2, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default EarthGlobe;
