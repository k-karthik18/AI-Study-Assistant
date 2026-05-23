import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import apiService from '../services/api';

export default function PDFUpload({ onUploadSuccess, currentDoc, userId }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const processFile = async (file) => {
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setStatus('error');
      setErrorMsg('Invalid file format. Please upload a PDF textbook or document.');
      return;
    }

    try {
      setStatus('uploading');
      setProgress(0);
      setErrorMsg('');

      const result = await apiService.uploadPDF(file, userId, (percent) => {
        setProgress(percent);
      });

      if (result.status === 'success') {
        setStatus('success');
        onUploadSuccess({
          doc_id: result.doc_id,
          filename: result.filename || file.name,
          chunk_count: result.chunk_count,
        });
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.response?.data?.detail || err.message || 'An error occurred during file upload.');
    }
  };

  const resetUploader = () => {
    setStatus('idle');
    setProgress(0);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="glass-panel uploader-container">
      <h3 className="panel-title">
        <Upload size={18} className="text-primary-glow" style={{ color: 'hsl(var(--primary))' }} />
        Study Materials
      </h3>

      {status === 'idle' && (
        <div
          className={`dropzone ${isDragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="file-input-hidden"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div className="dropzone-content">
            <div className="upload-icon-wrapper">
              <Upload className="upload-icon" />
            </div>
            <p className="dropzone-text-primary">Drag & Drop textbook PDF</p>
            <p className="dropzone-text-secondary">or click to browse local files</p>
            <div className="file-info-badge">Max size 25MB</div>
          </div>
        </div>
      )}

      {status === 'uploading' && (
        <div className="uploading-state">
          <Loader2 className="spinner" />
          <p className="state-label">Parsing & Analyzing PDF...</p>
          <div className="progress-track">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="percentage-text">{progress}% Completed</span>
        </div>
      )}

      {status === 'success' && currentDoc && (
        <div className="success-state">
          <div className="success-icon-wrapper">
            <CheckCircle2 className="success-icon" />
          </div>
          <p className="state-label">Textbook Synced</p>
          
          <div className="doc-details-card">
            <FileText size={16} className="doc-icon" />
            <div className="doc-meta">
              <span className="doc-name">{currentDoc.filename}</span>
              <span className="doc-chunks">{currentDoc.chunk_count} conceptual chunks parsed</span>
            </div>
          </div>

          <button className="btn btn-secondary btn-full" onClick={resetUploader}>
            Upload Another Document
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="error-state">
          <div className="error-icon-wrapper">
            <AlertTriangle className="error-icon" />
          </div>
          <p className="state-label">Upload Failed</p>
          <p className="error-description">{errorMsg}</p>
          <button className="btn btn-danger btn-full" onClick={resetUploader}>
            Try Again
          </button>
        </div>
      )}

      <style>{`
        .uploader-container {
          display: flex;
          flex-direction: column;
        }
        .dropzone {
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          padding: 30px 20px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition-smooth);
          background: rgba(255, 255, 255, 0.01);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .dropzone:hover, .dropzone.drag-active {
          border-color: hsl(var(--primary));
          background: rgba(139, 92, 246, 0.03);
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.1) inset;
        }
        .upload-icon-wrapper {
          width: 50px;
          height: 50px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          border: 1px solid var(--border-glass);
          color: hsl(var(--text-secondary));
          transition: var(--transition-smooth);
        }
        .dropzone:hover .upload-icon-wrapper {
          color: hsl(var(--primary));
          background: rgba(139, 92, 246, 0.1);
          border-color: rgba(139, 92, 246, 0.2);
          transform: scale(1.05);
        }
        .upload-icon {
          width: 22px;
          height: 22px;
        }
        .dropzone-text-primary {
          font-size: 0.9rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
          margin-bottom: 4px;
        }
        .dropzone-text-secondary {
          font-size: 0.78rem;
          color: hsl(var(--text-secondary));
          margin-bottom: 12px;
        }
        .file-info-badge {
          font-size: 0.7rem;
          color: hsl(var(--text-muted));
          background: rgba(255, 255, 255, 0.04);
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid var(--border-glass);
        }
        .uploading-state, .success-state, .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 10px 0;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .spinner {
          width: 32px;
          height: 32px;
          color: hsl(var(--primary));
          animation: spin 1.5s linear infinite;
          margin-bottom: 16px;
        }
        .state-label {
          font-size: 0.95rem;
          font-weight: 600;
          color: hsl(var(--text-primary));
          margin-bottom: 12px;
        }
        .progress-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 100%);
          border-radius: 10px;
          transition: width 0.1s ease;
        }
        .percentage-text {
          font-size: 0.75rem;
          color: hsl(var(--text-secondary));
        }
        .success-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--success));
          margin-bottom: 12px;
        }
        .success-icon {
          width: 24px;
          height: 24px;
        }
        .doc-details-card {
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-glass);
          border-radius: var(--radius-md);
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .doc-icon {
          color: hsl(var(--primary));
          flex-shrink: 0;
        }
        .doc-meta {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          text-align: left;
        }
        .doc-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .doc-chunks {
          font-size: 0.72rem;
          color: hsl(var(--text-secondary));
        }
        .error-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: hsl(var(--danger));
          margin-bottom: 12px;
        }
        .error-icon {
          width: 24px;
          height: 24px;
        }
        .error-description {
          font-size: 0.78rem;
          color: hsl(var(--text-secondary));
          text-align: center;
          margin-bottom: 16px;
        }
        .btn-full {
          width: 100%;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
