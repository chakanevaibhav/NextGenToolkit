"use client";

import { useState } from "react";
import { UploadCloud, PenTool, FileSignature, Type } from "lucide-react";
import styles from "./sign.module.css";

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Sign PDF</h1>
        <p>Draw or type your signature and place it securely on your document.</p>
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
            <h3>Upload PDF to Sign</h3>
            <p>Drag & drop or click to browse</p>
          </label>
        </div>
      ) : (
        <div className={styles.editorContainer}>
          <div className={styles.toolbar}>
            <h3>Tools</h3>
            <div className={styles.toolButtons}>
              <button className={styles.toolBtn}>
                <PenTool size={20} /> Draw Signature
              </button>
              <button className={styles.toolBtn}>
                <Type size={20} /> Type Text
              </button>
            </div>
            <hr className={styles.divider} />
            <button className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <FileSignature size={18} /> Finish & Download
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={() => setFile(null)}>
              Cancel
            </button>
          </div>
          
          <div className={`glass-panel ${styles.pdfViewer}`}>
            <div className={styles.viewerPlaceholder}>
              <p>PDF Viewer & Interactive Editor will render here using pdf-lib</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
