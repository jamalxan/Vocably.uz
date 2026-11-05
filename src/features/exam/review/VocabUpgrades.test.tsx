// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import VocabUpgrades from './VocabUpgrades';

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const items = [
  { original: 'a lot of', better: 'a considerable number of', noteUz: 'rasmiyroq' },
  { original: 'big', better: 'substantial' },
];

let root: Root | null = null;
let host: HTMLDivElement | null = null;

async function render() {
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
  await act(async () => root!.render(<VocabUpgrades items={items} />));
  return host;
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  vi.unstubAllGlobals();
});

describe('VocabUpgrades', () => {
  it('renders each upgrade with its own SRS button', async () => {
    const el = await render();
    expect(el.textContent).toContain('a lot of');
    expect(el.textContent).toContain('a considerable number of');
    expect(el.textContent).toContain('rasmiyroq');
    expect(el.querySelectorAll('button')).toHaveLength(3); // add-all + 2 rows
  });

  it('adds one phrase, then "add all" sends only the rest', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({ added: 1, skipped: 0 }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const el = await render();
    const rowButtons = () => [...el.querySelectorAll('button')].slice(1);

    await act(async () => rowButtons()[1].click());
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]!.body)).items).toEqual([{ original: 'big', better: 'substantial' }]);
    expect(rowButtons()[1].disabled).toBe(true);

    await act(async () => (el.querySelector('button') as HTMLButtonElement).click());
    expect(JSON.parse(String(fetchMock.mock.calls[1]![1]!.body)).items).toEqual([{ original: 'a lot of', better: 'a considerable number of' }]);
    expect(rowButtons().every((b) => b.disabled)).toBe(true);
  });

  it('shows the server error and keeps the phrase addable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Limit' }), { status: 409 })));
    const el = await render();
    await act(async () => ([...el.querySelectorAll('button')][1] as HTMLButtonElement).click());
    expect(el.querySelector('[role="alert"]')?.textContent).toBe('Limit');
    expect(([...el.querySelectorAll('button')][1] as HTMLButtonElement).disabled).toBe(false);
  });
});
