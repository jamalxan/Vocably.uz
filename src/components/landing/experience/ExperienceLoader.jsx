'use client';
import { Component } from 'react';
import dynamic from 'next/dynamic';
import FallbackBackdrop from './FallbackBackdrop';
import useWebGLSupport from './useWebGLSupport';

// three.js + R3F are code-split out of the initial page load and only
// fetched in the browser, after hydration. The CSS backdrop underneath shows
// immediately (no blank/black flash) and stays as the animated background if
// WebGL isn't available.
const ExperienceCanvas = dynamic(() => import('./ExperienceCanvas'), { ssr: false });

// Errors thrown inside the R3F tree propagate to React — without this
// boundary a single shader/GPU failure would unmount the entire landing
// page. With it, the page keeps working on the CSS backdrop.
class CanvasBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn('[landing] 3D experience disabled:', error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function ExperienceLoader() {
  const webgl = useWebGLSupport();
  return (
    <>
      <FallbackBackdrop animated={webgl === false} />
      {webgl && (
        <CanvasBoundary>
          <ExperienceCanvas />
        </CanvasBoundary>
      )}
    </>
  );
}
