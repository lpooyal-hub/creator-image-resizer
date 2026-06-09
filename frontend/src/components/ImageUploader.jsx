import { useRef, useState } from 'react';

function ImageUploader({ onFileSelect, acceptedTypes }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (fileList) => {
    const [file] = Array.from(fileList || []);
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <section
      className={`uploader ${isDragging ? 'is-dragging' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        selectFile(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        className="visually-hidden"
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={(event) => selectFile(event.target.files)}
      />
      <div>
        <p className="uploader-title">Drop an image here</p>
        <p className="muted">PNG, JPEG, or WebP. Images stay in your browser.</p>
      </div>
      <button type="button" className="primary-button" onClick={() => inputRef.current?.click()}>
        Choose image
      </button>
    </section>
  );
}

export default ImageUploader;

