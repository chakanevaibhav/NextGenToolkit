"use client";

import { useState } from "react";
import { UploadCloud, FileDown, File as FileIcon } from "lucide-react";
import styles from "./compress.module.css";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Compress PDF</h1>
        <p>Reduce your PDF file size while maintaining the best possible quality.</p>
      </header>

      {!file ? (
        <div className={`glass-panel ${styles.uploadArea}`}>
          <input 
            type="file" 
            id="file-upload" 
            className={styles.fileInput} 
            accept="application/pdf"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload" className={styles.uploadLabel}>
            <UploadCloud size={48} className={styles.uploadIcon} />
            <h3>Drag & drop your PDF here</h3>
            <p>or click to browse files</p>
          </label>
        </div>
      ) : (
        <div className={styles.fileDetail}>
          <div className={styles.fileCard}>
            <FileIcon size={48} className={styles.fileCardIcon} />
            <div className={styles.fileInfo}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>
                Original: {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
          
          <div className={styles.compressionOptions}>
            <h3>Compression Level</h3>
            <div className={styles.optionsGrid}>
              <label className={styles.optionCard}>
                <input type="radio" name="compression" value="recommended" defaultChecked />
                <div className={styles.optionContent}>
                  <h4>Recommended</h4>
                  <p>Good quality, good compression</p>
                </div>
              </label>
              <label className={styles.optionCard}>
                <input type="radio" name="compression" value="extreme" />
                <div className={styles.optionContent}>
                  <h4>Extreme</h4>
                  <p>Lower quality, highest compression</p>
                </div>
              </label>
            </div>
          </div>
          
          <div className={styles.actionArea}>
            <button className="btn-secondary" onClick={() => setFile(null)}>Cancel</button>
            <button className="btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <FileDown size={18} /> Compress PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
