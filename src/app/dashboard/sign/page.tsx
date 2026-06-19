"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, PenTool, FileSignature, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import styles from "./sign.module.css";

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPdfUrl(URL.createObjectURL(selectedFile));
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const handleFinish = async () => {
    if (!file || !signatureData) {
      alert("Please upload a PDF and draw your signature first.");
      return;
    }

    setIsSigning(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const signatureImageBytes = await fetch(signatureData).then((res) => res.arrayBuffer());
      const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      
      const { width } = firstPage.getSize();
      
      // Stamp the signature at bottom right of the first page
      firstPage.drawImage(signatureImage, {
        x: width - 200,
        y: 50,
        width: 150,
        height: 75,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `signed_${file.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to sign PDF");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Sign PDF</h1>
        <p>Draw your signature and place it automatically at the bottom of the first page.</p>
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
            <h3>Draw Signature</h3>
            <div style={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "10px", width: "100%", maxWidth: "300px" }}>
              <canvas 
                ref={canvasRef}
                width={300}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ touchAction: "none" }}
              />
            </div>
            <div className={styles.toolButtons}>
              <button className={styles.toolBtn} onClick={clearSignature}>
                Clear
              </button>
              <button className={styles.toolBtn} onClick={saveSignature}>
                <PenTool size={20} /> Save Signature
              </button>
            </div>
            
            {signatureData && <p style={{ color: "green", fontSize: "14px", marginTop: "10px" }}>Signature Saved!</p>}

            <hr className={styles.divider} />
            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
              onClick={handleFinish}
              disabled={isSigning}
            >
              {isSigning ? <Loader2 size={18} className="spin" /> : <FileSignature size={18} />}
              {isSigning ? "Signing..." : "Finish & Download"}
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={() => { setFile(null); setPdfUrl(null); }}>
              Cancel
            </button>
          </div>
          
          <div className={`glass-panel ${styles.pdfViewer}`}>
            {pdfUrl ? (
              <iframe src={pdfUrl} width="100%" height="100%" style={{ border: "none", borderRadius: "8px" }} title="PDF Preview" />
            ) : (
              <div className={styles.viewerPlaceholder}>
                <p>Loading preview...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
