"use client";

import { useState } from "react";
import { UploadCloud, File as FileIcon, Scissors, Layers } from "lucide-react";
import styles from "./split-merge.module.css";

export default function SplitMergePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<"split" | "merge">("split");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Split & Merge PDFs</h1>
        <p>Extract pages or combine multiple documents seamlessly in your browser.</p>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === "split" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("split")}
        >
          <Scissors size={18} /> Split PDF
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === "merge" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("merge")}
        >
          <Layers size={18} /> Merge PDFs
        </button>
      </div>

      <div className={`glass-panel ${styles.uploadArea}`}>
        <input 
          type="file" 
          id="file-upload" 
          className={styles.fileInput} 
          multiple={activeTab === "merge"} 
          accept="application/pdf"
          onChange={handleFileUpload}
        />
        <label htmlFor="file-upload" className={styles.uploadLabel}>
          <UploadCloud size={48} className={styles.uploadIcon} />
          <h3>Drag & drop your PDF{activeTab === "merge" ? "s" : ""} here</h3>
          <p>or click to browse files</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          <h3>Selected Files ({files.length})</h3>
          <div className={styles.fileGrid}>
            {files.map((file, index) => (
              <div key={index} className={styles.fileCard}>
                <FileIcon size={24} className={styles.fileCardIcon} />
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
          
          <div className={styles.actionArea}>
            <button className="btn-primary">
              {activeTab === "split" ? "Split Document" : "Merge Documents"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
