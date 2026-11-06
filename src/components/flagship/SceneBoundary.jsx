'use client';
import { Component } from 'react';

// Error boundary for a flagship 3D scene. three r180 throws when it cannot create a WebGL2 context
// (and R3F rethrows from <Canvas>); instead of a blank game we tell the controller, which switches to
// that game's 2D renderer. Renders nothing after a failure.
export default class SceneBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    console.error('[flagship] 3D scene failed, switching to 2D', err);
    this.props.onError?.(err);
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
