'use client';
import dynamic from 'next/dynamic';
import LearningCoreFallback from './LearningCoreFallback';

// Server Components (Hero.jsx, page.jsx) can't call next/dynamic with
// ssr:false themselves — this tiny client wrapper does it on their behalf,
// so the ~600KB three.js/@react-three/fiber bundle is code-split out of the
// initial page load and only fetched once this component mounts in the
// browser (brief §25: "lazy loading; dynamic import").
const LearningCore3D = dynamic(() => import('./LearningCore3D'), {
  ssr: false,
  loading: () => <LearningCoreFallback />,
});

export default function LearningCore3DLoader(props) {
  return <LearningCore3D {...props} />;
}
