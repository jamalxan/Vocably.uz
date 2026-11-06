import { describe, it, expect, vi } from 'vitest';
import { renderTier, tierOverride, dprFor, createFpsWatchdog, probeWebgl, stepDown } from './gpu';

const gl = (renderer) => ({ ok: true, renderer });

describe('render tier', () => {
  it('uses 2D without WebGL2, with reduced motion, on software rasterisers, or when the device fell back before', () => {
    expect(renderTier({ webgl: { ok: false, renderer: '' } })).toBe('none');
    expect(renderTier({ webgl: gl('ANGLE (NVIDIA GeForce RTX 3060)'), reducedMotion: true })).toBe('none');
    expect(renderTier({})).toBe('none');
    expect(renderTier({ webgl: gl('ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)') })).toBe('none');
    expect(renderTier({ webgl: gl('llvmpipe (LLVM 15.0.7, 256 bits)') })).toBe('none');
    expect(renderTier({ webgl: gl('Apple GPU'), remembered2d: true })).toBe('none');
  });

  it('uses the low tier on budget phones', () => {
    expect(renderTier({ webgl: gl('Mali-G52 MC2') })).toBe('low');
    expect(renderTier({ webgl: gl('PowerVR Rogue GE8320') })).toBe('low');
    expect(renderTier({ webgl: gl('Adreno (TM) 506') })).toBe('low');
    expect(renderTier({ webgl: gl('Adreno (TM) 610') })).toBe('low');
    expect(renderTier({ webgl: gl('Adreno (TM) 730'), memoryGb: 2 })).toBe('low');
    expect(renderTier({ webgl: gl('Adreno (TM) 730'), cores: 2 })).toBe('low');
    // a typical 8-core / 4 GB Android phone
    expect(renderTier({ webgl: gl('Mali-G68 MC4'), mobile: true, cores: 8, memoryGb: 4 })).toBe('low');
    expect(renderTier({ webgl: gl('Mali-G68 MC4'), mobile: true, cores: 8 })).toBe('low');
  });

  it('uses the high tier for capable GPUs', () => {
    expect(renderTier({ webgl: gl('Adreno (TM) 730'), mobile: true, memoryGb: 8, cores: 8 })).toBe('high');
    expect(renderTier({ webgl: gl('Apple GPU'), mobile: true })).toBe('high');
    expect(renderTier({ webgl: gl('ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)'), memoryGb: 8 })).toBe('high');
  });

  it('honours ?render= for QA, but never forces 3D without WebGL2', () => {
    expect(tierOverride('?render=2d')).toBe('none');
    expect(tierOverride('?a=1&render=LOW')).toBe('low');
    expect(tierOverride('?render=ultra')).toBeNull();
    expect(renderTier({ webgl: gl('Apple GPU'), search: '?render=2d' })).toBe('none');
    expect(renderTier({ webgl: gl('SwiftShader'), search: '?render=high' })).toBe('high');
    expect(renderTier({ webgl: gl('Apple GPU'), remembered2d: true, search: '?render=low' })).toBe('low');
    expect(renderTier({ webgl: { ok: false }, search: '?render=high' })).toBe('none');
  });

  it('caps DPR by tier and steps down high → low → 2D', () => {
    expect(dprFor('high', 3)).toEqual([1, 1.5]);
    expect(dprFor('high', 1)).toEqual([1, 1]);
    expect(dprFor('low', 3)).toEqual([1, 1]);
    expect(stepDown('high')).toBe('low');
    expect(stepDown('low')).toBe('none');
  });

  it('probes WebGL2 only and never throws', () => {
    const opts = { cache: false };
    expect(probeWebgl(null, opts)).toEqual({ ok: false, renderer: '' });
    const webgl1Only = { createElement: () => ({ getContext: (kind) => (kind === 'webgl' ? {} : null) }) };
    expect(probeWebgl(webgl1Only, opts).ok).toBe(false);
    const broken = { createElement: () => { throw new Error('no canvas'); } };
    expect(probeWebgl(broken, opts).ok).toBe(false);
    const ctx = { RENDERER: 1, getExtension: (n) => (n === 'WEBGL_debug_renderer_info' ? { UNMASKED_RENDERER_WEBGL: 2 } : null), getParameter: (p) => (p === 2 ? 'Mali-G52' : 'WebKit WebGL') };
    const webgl2 = { createElement: () => ({ getContext: (kind) => (kind === 'webgl2' ? ctx : null) }) };
    expect(probeWebgl(webgl2, opts)).toEqual({ ok: true, renderer: 'Mali-G52' });
  });
});

describe('fps watchdog', () => {
  const run = (wd, from, to, step) => {
    let fired = false;
    for (let t = from; t <= to; t += step) fired = wd.sample(t) || fired;
    return fired;
  };

  it('ignores warm-up, then fires once after two slow windows in a row', () => {
    const onLow = vi.fn();
    const wd = createFpsWatchdog({ onLow });
    run(wd, 0, 1900, 66); // slow, but still warming up
    expect(onLow).not.toHaveBeenCalled();
    run(wd, 1900, 5100, 66); // first slow window
    expect(onLow).not.toHaveBeenCalled();
    run(wd, 5100, 8400, 66); // second slow window
    expect(onLow).toHaveBeenCalledTimes(1);
    expect(wd.fired).toBe(true);
    run(wd, 8400, 20_000, 66);
    expect(onLow).toHaveBeenCalledTimes(1);
  });

  it('re-arms after reset, so the controller can step down twice', () => {
    const onLow = vi.fn();
    const wd = createFpsWatchdog({ onLow });
    run(wd, 0, 9000, 66);
    expect(onLow).toHaveBeenCalledTimes(1);
    wd.reset(10_000);
    run(wd, 10_000, 11_500, 66); // warm-up again
    expect(onLow).toHaveBeenCalledTimes(1);
    run(wd, 11_500, 19_000, 66);
    expect(onLow).toHaveBeenCalledTimes(2);
  });

  it('does not fire at a healthy frame rate, and a fast window clears a strike', () => {
    const onLow = vi.fn();
    const wd = createFpsWatchdog({ onLow });
    run(wd, 0, 2000, 16);
    run(wd, 2000, 5100, 66); // slow
    run(wd, 5100, 8200, 16); // healthy → strike cleared
    run(wd, 8200, 11_300, 66); // slow again (1 strike)
    expect(onLow).not.toHaveBeenCalled();
    run(wd, 11_300, 30_000, 33); // 30 fps
    expect(onLow).not.toHaveBeenCalled();
  });

  it('treats an occasional long gap as a restart, but many in a row as a device that cannot render', () => {
    const onLow = vi.fn();
    const wd = createFpsWatchdog({ onLow });
    run(wd, 0, 2200, 16);
    // hiccups between healthy stretches
    for (let k = 0; k < 6; k++) {
      wd.sample(2200 + k * 2000 + 900); // 900 ms gap
      run(wd, 2200 + k * 2000 + 916, 2200 + k * 2000 + 1990, 16);
    }
    expect(onLow).not.toHaveBeenCalled();
    // 3 fps for a while
    run(wd, 20_000, 24_000, 330);
    expect(onLow).toHaveBeenCalledTimes(1);
  });
});
