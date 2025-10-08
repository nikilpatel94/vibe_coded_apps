import React from 'react';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

const marsTextureUrl = '/textures/mars_tex.jpg';

function MarsGlobe() {
  const texture = useLoader(TextureLoader, marsTextureUrl);

  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

export default MarsGlobe;
