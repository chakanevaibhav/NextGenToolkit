"use client";

import { useState } from "react";
import { UploadCloud, FileDown, File as FileIcon, Loader2 } from "lucide-react";
import styles from "./compress.module.css";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("recommended");
  const [compressedFile, setCompressedFile] = useState<{ url: string; name: string; size: number } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCompressedFile(null); // Reset on new file
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", compressionLevel);

      const res = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Compression failed");
        return;
      }

      const compressedSizeHeader = res.headers.get("X-File-Size");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      setCompressedFile({
        url,
        name: `compressed_${file.name}`,
        size: compressedSizeHeader ? parseInt(compressedSizeHeader, 10) : blob.size
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsCompressing(false);
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
          
          {!compressedFile && (
            <div className={styles.compressionOptions}>
              <h3>Compression Level</h3>
              <div className={styles.optionsGrid}>
                <label className={styles.optionCard}>
                  <input 
                    type="radio" 
                    name="compression" 
                    value="recommended" 
                    checked={compressionLevel === "recommended"}
                    onChange={(e) => setCompressionLevel(e.target.value)}
                  />
                  <div className={styles.optionContent}>
                    <h4>Recommended</h4>
                    <p>Good quality, good compression</p>
                  </div>
                </label>
                <label className={styles.optionCard}>
                  <input 
                    type="radio" 
                    name="compression" 
                    value="extreme" 
                    checked={compressionLevel === "extreme"}
                    onChange={(e) => setCompressionLevel(e.target.value)}
                  />
                  <div className={styles.optionContent}>
                    <h4>Extreme</h4>
                    <p>Lower quality, highest compression</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {compressedFile ? (
            <div className={`glass-panel ${styles.successArea}`}>
              <h3 style={{ color: "var(--success)" }}>Compression Complete!</h3>
              <div className={styles.statsCard}>
                <div className={styles.statItem}>
                  <span>Original Size:</span>
                  <strong>{(file.size / 1024 / 1024).toFixed(2)} MB</strong>
                </div>
                <div className={styles.statItem}>
                  <span>New Size:</span>
                  <strong style={{ color: "var(--success)" }}>{(compressedFile.size / 1024 / 1024).toFixed(2)} MB</strong>
                </div>
                <div className={styles.statItem}>
                  <span>Saved:</span>
                  <strong>
                    {(((file.size - compressedFile.size) / file.size) * 100).toFixed(0)}%
                  </strong>
                </div>
              </div>
              
              {compressedFile.size >= file.size && (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "12px" }}>
                  This PDF is already highly optimized. We preserved the original file to prevent size increases.
                </p>
              )}

              <div className={styles.actionArea} style={{ marginTop: '20px' }}>
                <button className="btn-secondary" onClick={() => {
                  setFile(null);
                  setCompressedFile(null);
                }}>Compress Another</button>
                <a 
                  href={compressedFile.url} 
                  download={compressedFile.name}
                  className="btn-primary" 
                  style={{ display: 'flex', gap: '8px', alignItems: 'center', textDecoration: 'none' }}
                >
                  <FileDown size={18} />
                  Download Compressed PDF
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.actionArea}>
              <button className="btn-secondary" onClick={() => setFile(null)} disabled={isCompressing}>Cancel</button>
              <button 
                className="btn-primary" 
                style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                onClick={handleCompress}
                disabled={isCompressing}
              >
                {isCompressing ? <Loader2 size={18} className="spin" /> : <FileDown size={18} />}
                {isCompressing ? "Compressing..." : "Compress PDF"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
