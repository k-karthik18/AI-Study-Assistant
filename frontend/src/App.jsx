import React, { useState, useEffect } from 'react';
import { GraduationCap, Wifi, WifiOff, BookOpen, History, Loader2, Sparkles } from 'lucide-react';
import axios from 'axios';
import { SignIn, UserButton, useUser } from '@clerk/clerk-react';
import PDFUpload from './components/PDFUpload';
import ChatInterface from './components/ChatInterface';
import EvalDashboard from './components/EvalDashboard';
import apiService from './services/api';

export default function App() {
  const [currentDoc, setCurrentDoc] = useState(null); // active document context
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Clerk authentication dynamic support
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isClerkEnabled = publishableKey && publishableKey !== "your_clerk_publishable_key_here";

  let user = null;
  let isLoaded = true;
  let userId = "user_mock123";
  let userFullName = "Guest Student";

  if (isClerkEnabled) {
    const clerkAuth = useUser();
    user = clerkAuth.user;
    isLoaded = clerkAuth.isLoaded;
    userId = user?.id || "user_mock123";
    userFullName = user?.fullName || user?.firstName || "Student";
  }

  // Check connection to the FastAPI backend server on mount
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const url = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
        const response = await axios.get(url.replace('/api', ''));
        if (response.data && response.data.status === 'online') {
          setBackendStatus('online');
        } else {
          setBackendStatus('offline');
        }
      } catch (err) {
        console.error("Backend status check failed:", err);
        setBackendStatus('offline');
      }
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fetch all user documents from Supabase
  const fetchUserDocuments = async () => {
    if (!userId || !isLoaded) return;
    setLoadingDocs(true);
    try {
      const docs = await apiService.getDocuments(userId);
      setUploadedDocs(docs);
    } catch (err) {
      console.error("Failed to fetch user documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchUserDocuments();
    }
  }, [userId, isLoaded]);

  const handleUploadSuccess = (docInfo) => {
    setCurrentDoc(docInfo);
    // Refresh the document library sidebar instantly
    fetchUserDocuments();
  };

  const handleSelectDoc = (doc) => {
    setCurrentDoc({
      doc_id: doc.id,
      filename: doc.filename,
      chunk_count: doc.chunk_count
    });
  };

  // 1. Loading authentication state
  if (isClerkEnabled && !isLoaded) {
    return (
      <div className="auth-loader-screen">
        <Loader2 className="spinner" size={40} />
        <p>Syncing security session...</p>
        <style>{`
          .auth-loader-screen {
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--bg-page, #F8F9FB);
            color: var(--text-primary, #1A1A2E);
            gap: 16px;
          }
          .spinner {
            animation: spin 1.5s linear infinite;
            color: var(--accent-dark, #1A1A2E);
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 2. Login required screen
  if (isClerkEnabled && !user) {
    return (
      <div className="auth-login-screen">
        <div className="auth-bg-shape shape-1"></div>
        <div className="auth-bg-shape shape-2"></div>
        <div className="auth-bg-shape shape-3"></div>

        <div className="auth-card-container">
          <div className="auth-presentation-card">
            <div className="brand-logo large-logo">
              <GraduationCap size={32} />
            </div>
            <h1 className="auth-title">AI Study Assistant</h1>
            <p className="auth-subtitle">RAG-Based PDF Textbook Chat System</p>

            <div className="feature-bullets">
              <div className="bullet">
                <Sparkles size={16} />
                <span>Upload long PDFs and query concepts in real time</span>
              </div>
              <div className="bullet">
                <History size={16} />
                <span>Persistent database stores your chat threads forever</span>
              </div>
              <div className="bullet">
                <BookOpen size={16} />
                <span>Deeply objective RAGAS Live Metrics Evaluation</span>
              </div>
            </div>
          </div>

          <div className="auth-clerk-widget">
            <SignIn routing="hash" />
          </div>
        </div>

        <style>{`
          .auth-login-screen {
            position: relative;
            height: 100vh;
            width: 100vw;
            background-color: #F8F9FB;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .auth-bg-shape {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.15;
            z-index: 1;
          }
          .shape-1 {
            width: 500px;
            height: 500px;
            background: linear-gradient(135deg, #6366F1, #8B5CF6);
            top: -150px;
            left: -100px;
          }
          .shape-2 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #F97316, #EC4899);
            bottom: -120px;
            right: -80px;
          }
          .shape-3 {
            width: 300px;
            height: 300px;
            background: linear-gradient(135deg, #1A1A2E, #2D2B55);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.05;
          }
          .auth-card-container {
            position: relative;
            z-index: 5;
            display: grid;
            grid-template-columns: 1fr 1fr;
            max-width: 900px;
            background: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
          }
          .auth-presentation-card {
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-right: 1px solid #E5E7EB;
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, #FFFFFF 100%);
          }
          .large-logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #1A1A2E 0%, #2D2B55 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 4px 16px rgba(26, 26, 46, 0.2);
            margin-bottom: 24px;
          }
          .auth-title {
            font-family: 'Outfit', sans-serif;
            font-size: 2.2rem;
            font-weight: 800;
            color: #1A1A2E;
            margin-bottom: 8px;
            letter-spacing: -0.03em;
          }
          .auth-subtitle {
            font-size: 0.9rem;
            color: #6366F1;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 32px;
          }
          .feature-bullets {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }
          .bullet {
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 0.9rem;
            color: #6B7280;
          }
          .bullet svg {
            color: #2D2B55;
            flex-shrink: 0;
          }
          .auth-clerk-widget {
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #FAFBFC;
          }
          @media (max-width: 800px) {
            .auth-card-container {
              grid-template-columns: 1fr;
              margin: 20px;
            }
            .auth-presentation-card {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }

  // 3. Authenticated Dashboard workspace
  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <GraduationCap size={20} />
          </div>
          <span className="brand-name">AI Study Assistant</span>
          <span className="brand-badge">RAG v1.0</span>
        </div>

        <div className="connection-status-section">
          <div className="user-profile-badge">
            <span className="user-welcome-text">Hi, {userFullName}</span>
            {isClerkEnabled ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="mock-avatar">S</div>
            )}
          </div>

          <span className="divider"></span>

          {backendStatus === 'checking' && (
            <div className="status-indicator checking">
              <span className="status-dot-pulse"></span>
              <span>Checking backend...</span>
            </div>
          )}
          {backendStatus === 'offline' && (
            <div className="status-indicator offline" title="Is FastAPI running at http://127.0.0.1:8000?">
              <WifiOff size={14} />
              <span>Backend Offline</span>
            </div>
          )}
        </div>
      </header>

      {/* Sidebar Panel containing Upload, Library, and Dashboard */}
      <aside className="app-sidebar">
        {/* Drag & Drop PDF Uploader */}
        <PDFUpload onUploadSuccess={handleUploadSuccess} currentDoc={currentDoc} userId={userId} />

        {/* Persistent Textbook Library List */}
        <div className="glass-panel library-panel">
          <h3 className="panel-title">
            <BookOpen size={16} style={{ color: '#2D2B55' }} />
            Textbook Library
          </h3>

          {loadingDocs && uploadedDocs.length === 0 ? (
            <div className="library-loader">
              <Loader2 className="spinner" size={16} />
              <span>Syncing database...</span>
            </div>
          ) : uploadedDocs.length === 0 ? (
            <div className="empty-library">
              <p>Your library is empty. Upload a textbook PDF above to get started!</p>
            </div>
          ) : (
            <div className="library-list">
              {uploadedDocs.map((doc) => {
                const isActive = currentDoc && currentDoc.doc_id === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`library-item-card ${isActive ? 'active-card' : ''}`}
                    onClick={() => handleSelectDoc(doc)}
                  >
                    <BookOpen size={14} className="lib-icon" />
                    <div className="lib-meta">
                      <span className="lib-name" title={doc.filename}>{doc.filename}</span>
                      <span className="lib-chunks">{doc.chunk_count} chunks</span>
                    </div>
                    {isActive && <div className="active-dot"></div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* live RAGAS dashboard */}
        <EvalDashboard currentDoc={currentDoc} userId={userId} />
      </aside>

      {/* Main Workspace containing the chat panel */}
      <main className="app-workspace">
        <ChatInterface currentDoc={currentDoc} userId={userId} />
      </main>

      <style>{`
        /* Header connection indicators styling */
        .connection-status-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-welcome-text {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .mock-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          color: white;
        }
        .divider {
          width: 1px;
          height: 20px;
          background: var(--border);
        }
        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.76rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 20px;
          border: 1px solid transparent;
          transition: var(--transition-smooth);
        }
        .status-indicator.online {
          background: var(--success-bg);
          color: var(--success);
          border-color: var(--success-border);
        }
        .status-indicator.offline {
          background: var(--danger-bg);
          color: var(--danger);
          border-color: var(--danger-border);
          cursor: help;
        }
        .status-indicator.checking {
          background: #F3F4F6;
          color: var(--text-secondary);
          border-color: var(--border);
        }
        .status-dot-pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-secondary);
          animation: pulse 1.5s infinite ease-in-out;
        }

        /* TEXTBOOK LIBRARY STYLES */
        .library-panel {
          max-height: 250px;
          display: flex;
          flex-direction: column;
        }
        .library-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.76rem;
          color: var(--text-secondary);
          padding: 10px 0;
        }
        .empty-library {
          padding: 8px 4px;
          text-align: center;
        }
        .empty-library p {
          font-size: 0.74rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .library-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding-right: 2px;
        }
        .library-item-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: var(--transition-smooth);
          position: relative;
          overflow: hidden;
        }
        .library-item-card:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-hover);
        }
        .library-item-card.active-card {
          background: rgba(99, 102, 241, 0.06);
          border-color: #6366F1;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
        }
        .lib-icon {
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: var(--transition-smooth);
        }
        .library-item-card.active-card .lib-icon {
          color: #6366F1;
        }
        .lib-meta {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          flex: 1;
        }
        .lib-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .lib-chunks {
          font-size: 0.65rem;
          color: var(--text-muted);
        }
        .active-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: #6366F1;
          box-shadow: 0 0 6px rgba(99, 102, 241, 0.5);
        }

        .spinner {
          animation: spin 1.5s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
