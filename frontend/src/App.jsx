import { useState } from 'react';
import AvatarPreview from './components/AvatarPreview.jsx';
import BackgroundRemovalPage from './components/BackgroundRemovalPage.jsx';
import ImageResizerPage from './components/ImageResizerPage.jsx';

const initialPresetId = typeof window !== 'undefined' ? window.__INITIAL_PRESET_ID : undefined;
const initialPage = typeof window !== 'undefined' ? window.__INITIAL_PAGE : undefined;
// SEO landing pages already render their own keyword-specific <h1>, so the app
// header drops to <h2> there to keep one primary heading per page.
const isSeoLandingPage = Boolean(initialPresetId || initialPage);

const PAGE_COPY = {
  resizer: {
    title: 'Creator Image Resizer',
    description: 'Resize, convert, and optimize images directly in your browser.',
  },
  background: {
    title: 'AI Background Remover',
    description: 'Remove an image background in your browser — no upload, no signup.',
  },
  avatar: {
    title: 'Avatar Preview',
    description: 'Preview simple browser motion effects for transparent PNG character images.',
  },
};

const TABS = [
  { id: 'resizer', label: 'Image Resizer' },
  { id: 'background', label: 'Background Remover' },
  { id: 'avatar', label: 'Avatar Preview' },
];

function App() {
  const [activePage, setActivePage] = useState(
    PAGE_COPY[initialPage] ? initialPage : 'resizer',
  );
  const TitleTag = isSeoLandingPage ? 'h2' : 'h1';
  const copy = PAGE_COPY[activePage] ?? PAGE_COPY.resizer;

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Browser-first creator utility</p>
        <TitleTag>{copy.title}</TitleTag>
        <p>{copy.description}</p>
      </header>

      <nav className="page-tabs" aria-label="Tool navigation">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activePage === tab.id ? 'is-active' : ''}
            onClick={() => setActivePage(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activePage === 'avatar' ? <AvatarPreview /> : null}
      {activePage === 'background' ? <BackgroundRemovalPage /> : null}
      {activePage === 'resizer' ? <ImageResizerPage initialPresetId={initialPresetId} /> : null}
    </main>
  );
}

export default App;
