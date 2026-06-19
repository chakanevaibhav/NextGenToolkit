"use client";

import { useState, useRef, useEffect } from "react";
import { UploadCloud, PenTool, FileSignature, Loader2, GripHorizontal } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import styles from "./sign.module.css";

// Set up pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function SignPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [renderedPdfWidth, setRenderedPdfWidth] = useState<number>(0);
  const [renderedPdfHeight, setRenderedPdfHeight] = useState<number>(0);
  const [originalPdfWidth, setOriginalPdfWidth] = useState<number>(0);
  const [originalPdfHeight, setOriginalPdfHeight] = useState<number>(0);

  const [sigPosition, setSigPosition] = useState({ x: 0, y: 0 });
  const [sigSize, setSigSize] = useState({ width: 150, height: 75 });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPdfUrl(URL.createObjectURL(selectedFile));

      // Get original PDF dimensions using pdf-lib
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const firstPage = pdfDoc.getPages()[0];
      const { width, height } = firstPage.getSize();
      setOriginalPdfWidth(width);
      setOriginalPdfHeight(height);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageRenderSuccess = (pageData: any) => {
    setRenderedPdfWidth(pageData.width);
    setRenderedPdfHeight(pageData.height);
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
    setSigPosition({ x: 0, y: 0 }); // reset position
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const handleDrag = (e: DraggableEvent, data: DraggableData) => {
    setSigPosition({ x: data.x, y: data.y });
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
      const targetPage = pages[pageNumber - 1]; // Support signing the currently viewed page
      
      const { width: originalWidth, height: originalHeight } = targetPage.getSize();
      
      // Calculate scale ratio between rendered DOM and original PDF points
      const scaleX = originalWidth / renderedPdfWidth;
      const scaleY = originalHeight / renderedPdfHeight;

      // Map DOM coordinates to PDF coordinates
      // pdf-lib origin (0,0) is bottom-left. DOM origin is top-left.
      const pdfX = sigPosition.x * scaleX;
      const pdfY = originalHeight - ((sigPosition.y + sigSize.height) * scaleY);
      
      const pdfSigWidth = sigSize.width * scaleX;
      const pdfSigHeight = sigSize.height * scaleY;

      targetPage.drawImage(signatureImage, {
        x: pdfX,
        y: pdfY,
        width: pdfSigWidth,
        height: pdfSigHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
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
        <p>Draw your signature and drag it exactly where you want it to appear.</p>
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
          {/* Toolbar */}
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
                style={{ touchAction: "none", cursor: "crosshair" }}
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
            
            {signatureData && (
              <div style={{ marginTop: "15px", padding: "10px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.3)" }}>
                <p style={{ color: "#10b981", fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>Signature Saved!</p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Drag the signature on the right to place it.</p>
              </div>
            )}

            <hr className={styles.divider} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Page {pageNumber} of {numPages || '--'}</p>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  className={styles.toolBtn} 
                  disabled={pageNumber <= 1} 
                  onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                  style={{ padding: '4px 8px' }}
                >
                  Prev
                </button>
                <button 
                  className={styles.toolBtn} 
                  disabled={pageNumber >= (numPages || 1)} 
                  onClick={() => setPageNumber(p => Math.min(numPages || 1, p + 1))}
                  style={{ padding: '4px 8px' }}
                >
                  Next
                </button>
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
              onClick={handleFinish}
              disabled={isSigning || !signatureData}
            >
              {isSigning ? <Loader2 size={18} className="spin" /> : <FileSignature size={18} />}
              {isSigning ? "Signing..." : "Finish & Download"}
            </button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '12px' }} onClick={() => { setFile(null); setPdfUrl(null); clearSignature(); }}>
              Cancel
            </button>
          </div>
          
          {/* PDF Canvas View with Draggable Overlay */}
          <div className={`glass-panel ${styles.pdfViewer}`} style={{ position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '20px' }}>
            {pdfUrl ? (
              <div style={{ position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={<div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Loading PDF...</div>}
                >
                  <Page 
                    pageNumber={pageNumber} 
                    onRenderSuccess={onPageRenderSuccess}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    width={500}
                  />
                </Document>

                {/* Draggable Signature Overlay */}
                {signatureData && (
                  <Draggable
                    position={sigPosition}
                    onDrag={handleDrag}
                    bounds="parent"
                  >
                    <div style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: sigSize.width, 
                      height: sigSize.height,
                      cursor: 'move',
                      border: '2px dashed #6366f1',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      zIndex: 10
                    }}>
                      <img 
                        src={signatureData} 
                        alt="Signature Overlay" 
                        style={{ width: '100%', height: '100%', pointerEvents: 'none' }} 
                      />
                      <div style={{ 
                        position: 'absolute', 
                        top: '-25px', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        backgroundColor: '#6366f1', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <GripHorizontal size={14} /> Drag Me
                      </div>
                    </div>
                  </Draggable>
                )}
              </div>
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
