import { useEffect, useRef, useState } from 'react';

function AvatarPreview() {
  const inputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [idleFloating, setIdleFloating] = useState(true);
  const [mouseFollow, setMouseFollow] = useState(true);
  const [blinkEffect, setBlinkEffect] = useState(false);
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const resetImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    setImageUrl('');
    setError('');
    setPointerOffset({ x: 0, y: 0 });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const loadImage = (file) => {
    if (!file) {
      setError('Please choose a PNG image.');
      return;
    }

    if (file.type !== 'image/png') {
      setError('Unsupported file type. Please upload a transparent PNG image.');
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }

      setImageUrl(nextUrl);
      setError('');
      setPointerOffset({ x: 0, y: 0 });
    };

    image.onerror = () => {
      URL.revokeObjectURL(nextUrl);
      setError('Image load failed. Please try another PNG file.');
    };

    image.src = nextUrl;
  };

  const handlePointerMove = (event) => {
    if (!mouseFollow) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 18;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 14;
    setPointerOffset({ x, y });
  };

  const avatarStyle = mouseFollow
    ? {
        '--avatar-x': `${pointerOffset.x}px`,
        '--avatar-y': `${pointerOffset.y}px`,
      }
    : {
        '--avatar-x': '0px',
        '--avatar-y': '0px',
      };

  return (
    <section className="avatar-page">
      <div className="notice-stack">
        <p className="experiment-notice">Experimental avatar preview. This does not create a Live2D model.</p>
        <p className="privacy-notice">
          Your image is processed locally in your browser and is not uploaded to our server.
        </p>
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <div className="avatar-grid">
        <section className="panel avatar-stage-panel">
          <div
            className="avatar-stage"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setPointerOffset({ x: 0, y: 0 })}
          >
            {imageUrl ? (
              <img
                className={`avatar-image ${idleFloating ? 'is-floating' : ''} ${blinkEffect ? 'has-blink' : ''}`}
                src={imageUrl}
                alt="Uploaded avatar preview"
                style={avatarStyle}
              />
            ) : (
              <div className="avatar-placeholder">
                <p>Upload a transparent PNG character image</p>
                <span>Simple motion effects will preview here.</span>
              </div>
            )}
          </div>
        </section>

        <aside className="controls-stack">
          <section className="panel control-panel">
            <div className="panel-heading">
              <h2>Avatar Preview</h2>
            </div>
            <input
              ref={inputRef}
              className="visually-hidden"
              type="file"
              accept="image/png"
              onChange={(event) => loadImage(event.target.files?.[0])}
            />
            <button type="button" className="primary-button wide-button" onClick={() => inputRef.current?.click()}>
              Choose PNG image
            </button>
            <p className="avatar-help">Transparent PNG works best. This preview only applies browser motion effects.</p>
          </section>

          <section className="panel control-panel">
            <div className="panel-heading">
              <h2>Motion</h2>
            </div>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={idleFloating}
                onChange={(event) => setIdleFloating(event.target.checked)}
              />
              <span>Idle floating</span>
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={mouseFollow}
                onChange={(event) => {
                  setMouseFollow(event.target.checked);
                  setPointerOffset({ x: 0, y: 0 });
                }}
              />
              <span>Mouse-follow movement</span>
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={blinkEffect}
                onChange={(event) => setBlinkEffect(event.target.checked)}
              />
              <span>Blink-like opacity effect</span>
            </label>
          </section>

          <button type="button" className="secondary-button wide-button" onClick={resetImage}>
            Reset image
          </button>
        </aside>
      </div>
    </section>
  );
}

export default AvatarPreview;

