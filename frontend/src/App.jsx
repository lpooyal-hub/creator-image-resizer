import { useState } from 'react';
import AvatarPreview from './components/AvatarPreview.jsx';
import ImageResizerPage from './components/ImageResizerPage.jsx';

function App() {
  const [activePage, setActivePage] = useState('resizer');
  const isAvatarPage = activePage === 'avatar';

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Browser-first creator utility</p>
        <h1>{isAvatarPage ? 'Avatar Preview' : 'Creator Image Resizer'}</h1>
        <p>
          {isAvatarPage
            ? 'Preview simple browser motion effects for transparent PNG character images.'
            : 'Resize, convert, and optimize images directly in your browser.'}
        </p>
      </header>

      <nav className="page-tabs" aria-label="Tool navigation">
        <button
          type="button"
          className={activePage === 'resizer' ? 'is-active' : ''}
          onClick={() => setActivePage('resizer')}
        >
          Image Resizer
        </button>
        <button
          type="button"
          className={activePage === 'avatar' ? 'is-active' : ''}
          onClick={() => setActivePage('avatar')}
        >
          Avatar Preview
        </button>
      </nav>

      {isAvatarPage ? <AvatarPreview /> : <ImageResizerPage />}
    </main>
  );
}

export default App;
