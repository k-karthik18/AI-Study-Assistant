import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Clock, Activity, ShieldAlert, LogOut } from 'lucide-react';
import axios from 'axios';
import { SignIn, UserButton, useUser } from '@clerk/clerk-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline

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
    const interval = setInterval(checkBackendStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // 1. Loading authentication state
  if (isClerkEnabled && !isLoaded) {
    return (
      <div className="auth-loader-screen">
        <div className="spinner-dot"></div>
        <p>Initializing secure workspace...</p>
        <style>{`
          .auth-loader-screen {
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #090A0F;
            color: #8E93A6;
            gap: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .spinner-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #F8FAFC;
            animation: pulse 1.2s infinite ease-in-out;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // 2. Signed-Out View (Sleek Minimalist Landing Page)
  if (!isClerkEnabled || !user) {
    return (
      <div className="landing-container">
        {/* Navigation Header */}
        <header className="landing-header">
          <div className="brand-logo">
            <div className="logo-box">
              <GraduationCap size={18} />
            </div>
            <span>StudyFlow AI</span>
          </div>

          <div className="nav-actions">
            <span className="status-pill">
              <span className={`status-dot ${backendStatus === 'online' ? 'online' : 'offline'}`}></span>
              <span>API: {backendStatus.toUpperCase()}</span>
            </span>
            <button 
              className="btn-signin"
              onClick={() => {
                if (isClerkEnabled) {
                  // Direct to Clerk sign-in trigger (rendered below via widget or route redirection)
                  window.location.hash = "#/sign-in";
                } else {
                  alert("Clerk Publishable Key is not configured. Running in Mock Guest Mode.");
                }
              }}
            >
              Start Studying
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="announcement-badge">
              <Sparkles size={12} className="sparkle-icon" />
              <span>Grounded study assets generation engine</span>
            </div>
            <h1 className="hero-title">
              Turn your textbooks into your personal learning engine.
            </h1>
            <p className="hero-subtitle">
              Upload PDFs or paste lecture links to instantly generate interactive flashcards, practice quizzes, and an AI tutor grounded in your coursework.
            </p>

            <div className="hero-cta-wrapper">
              <button 
                className="btn-primary"
                onClick={() => {
                  if (isClerkEnabled) {
                    window.location.hash = "#/sign-in";
                  } else {
                    alert("Running in Mock Mode. Please set VITE_CLERK_PUBLISHABLE_KEY to enable Clerk Auth.");
                  }
                }}
              >
                <span>Get Started for Free</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        {/* Dynamic App Preview Container */}
        <section className="preview-section">
          <div className="preview-window">
            <div className="window-header">
              <div className="window-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
              <div className="window-title">StudyFlow Workspace Preview</div>
            </div>
            <div className="window-body">
              <div className="mock-sidebar">
                <div className="mock-nav-item active">Document Library</div>
                <div className="mock-nav-item">Interactive Quizzes</div>
                <div className="mock-nav-item">Flashcard Studio</div>
                <div className="mock-nav-item">RAGAS Quality Analytics</div>
              </div>
              <div className="mock-content">
                <div className="mock-chat-bubble user">What is the kernel?</div>
                <div className="mock-chat-bubble bot">
                  <strong>Source Chunk (Page 14):</strong> "The kernel is the core program of an operating system..."
                  <br />
                  <br />
                  Based on the context, the kernel is the core component that runs at all times in a privileged system mode, acting as a bridge between applications and hardware.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="features-section">
          <div className="section-header">
            <h2>Active study tools built for recall</h2>
            <p>We build structured learning assets directly from your sources, avoiding standard LLM hallucinations.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Sparkles size={20} />
              </div>
              <h3>Interactive AI Tutoring</h3>
              <p>Grounded RAG chat that answers questions using only the provided textbook, citing exact sources and page references.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={20} />
              </div>
              <h3>Active Practice Quizzes</h3>
              <p>Automatically generated multiple-choice tests with detailed explanations and grading to verify your understanding.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={20} />
              </div>
              <h3>Spaced Repetition Flashcards</h3>
              <p>Flip cards with memory retrieval scores ("Easy", "Medium", "Hard") that adapt study sessions to your pace.</p>
            </div>
          </div>
        </section>

        {/* Limits & Specifications Panel */}
        <section className="limits-section">
          <div className="limits-card">
            <div className="limits-grid">
              <div className="limit-item">
                <div className="limit-meta">
                  <Activity size={18} />
                  <h4>Free Workspace Limits</h4>
                </div>
                <p>Upload up to 3 textbooks or files per user space, with a maximum file size of 10MB per PDF.</p>
              </div>

              <div className="limit-item">
                <div className="limit-meta">
                  <ShieldAlert size={18} />
                  <h4>Low-Latency Local Processing</h4>
                </div>
                <p>Documents are vectorized and indexed on our local servers in milliseconds. No heavy database connection delays.</p>
              </div>

              <div className="limit-item">
                <div className="limit-meta">
                  <GraduationCap size={18} />
                  <h4>RAGAS Quality Audited</h4>
                </div>
                <p>Every response is continuously audited using Faithfulness and Relevance metrics to guarantee correct answers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2026 StudyFlow AI. Designed for students, researchers, and developers.</p>
        </footer>

        {/* Clerk In-line Modal overlay if triggered */}
        {isClerkEnabled && window.location.hash === "#/sign-in" && (
          <div className="clerk-overlay" onClick={() => window.location.hash = ""}>
            <div className="clerk-modal-wrapper" onClick={(e) => e.stopPropagation()}>
              <SignIn routing="hash" />
            </div>
          </div>
        )}

        <style>{`
          .landing-container {
            background-color: #090A0F;
            color: #F8FAFC;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
          }
          /* HEADER */
          .landing-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 24px 48px;
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          .logo-box {
            width: 32px;
            height: 32px;
            background-color: #1E202B;
            border: 1px solid #2A2C38;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #F8FAFC;
          }
          .nav-actions {
            display: flex;
            align-items: center;
            gap: 20px;
          }
          .status-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            background-color: #13151D;
            border: 1px solid #20222F;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;
            color: #94A3B8;
          }
          .status-dot {
            width: 6px;
            height: 6px;
            border-radius: 50%;
          }
          .status-dot.online {
            background-color: #10B981;
            box-shadow: 0 0 6px #10B981;
          }
          .status-dot.offline {
            background-color: #EF4444;
            box-shadow: 0 0 6px #EF4444;
          }
          .btn-signin {
            background-color: #F8FAFC;
            color: #090A0F;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .btn-signin:hover {
            opacity: 0.9;
          }

          /* HERO */
          .hero-section {
            padding: 80px 24px 40px 24px;
            text-align: center;
            max-width: 800px;
            margin: 0 auto;
          }
          .announcement-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background-color: #13151D;
            border: 1px solid #20222F;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 500;
            color: #94A3B8;
            margin-bottom: 28px;
          }
          .sparkle-icon {
            color: #F8FAFC;
          }
          .hero-title {
            font-size: 2.8rem;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.04em;
            margin: 0 0 20px 0;
            color: #FFFFFF;
          }
          .hero-subtitle {
            font-size: 1.05rem;
            color: #94A3B8;
            line-height: 1.6;
            margin: 0 auto 36px auto;
            max-width: 650px;
          }
          .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #F8FAFC;
            color: #090A0F;
            border: none;
            padding: 12px 24px;
            border-radius: 10px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          .btn-primary:hover {
            opacity: 0.9;
          }

          /* APP PREVIEW WINDOW */
          .preview-section {
            padding: 20px 24px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }
          .preview-window {
            background-color: #0F1016;
            border: 1px solid #21232E;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          }
          .window-header {
            background-color: #14151D;
            border-bottom: 1px solid #1E202B;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            position: relative;
          }
          .window-dots {
            display: flex;
            gap: 6px;
          }
          .window-dots .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #2D303F;
          }
          .window-title {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.72rem;
            color: #64748B;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .window-body {
            display: grid;
            grid-template-columns: 240px 1fr;
            height: 320px;
          }
          .mock-sidebar {
            background-color: #0C0D13;
            border-right: 1px solid #1A1B24;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .mock-nav-item {
            font-size: 0.8rem;
            color: #64748B;
            padding: 8px 12px;
            border-radius: 6px;
            font-weight: 500;
          }
          .mock-nav-item.active {
            background-color: #161722;
            color: #F8FAFC;
            border: 1px solid #232535;
          }
          .mock-content {
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            overflow-y: auto;
          }
          .mock-chat-bubble {
            max-width: 80%;
            padding: 14px 18px;
            border-radius: 12px;
            font-size: 0.85rem;
            line-height: 1.5;
          }
          .mock-chat-bubble.user {
            background-color: #1C1E2A;
            border: 1px solid #2D3043;
            color: #F8FAFC;
            align-self: flex-end;
          }
          .mock-chat-bubble.bot {
            background-color: #12131C;
            border: 1px solid #1E202C;
            color: #94A3B8;
            align-self: flex-start;
          }

          /* FEATURES SECTION */
          .features-section {
            padding: 100px 24px 50px 24px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }
          .section-header {
            text-align: center;
            margin-bottom: 60px;
          }
          .section-header h2 {
            font-size: 1.8rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            margin: 0 0 12px 0;
            color: #FFFFFF;
          }
          .section-header p {
            font-size: 0.95rem;
            color: #94A3B8;
            margin: 0 auto;
            max-width: 500px;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .feature-card {
            background-color: #0E0F15;
            border: 1px solid #1F212D;
            border-radius: 12px;
            padding: 30px;
            transition: border-color 0.2s;
          }
          .feature-card:hover {
            border-color: #2D3040;
          }
          .feature-icon {
            width: 40px;
            height: 40px;
            background-color: #181922;
            border: 1px solid #282A3A;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #F8FAFC;
            margin-bottom: 20px;
          }
          .feature-card h3 {
            font-size: 1.05rem;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #FFFFFF;
          }
          .feature-card p {
            font-size: 0.84rem;
            color: #94A3B8;
            line-height: 1.5;
            margin: 0;
          }

          /* LIMITS PANEL */
          .limits-section {
            padding: 40px 24px 80px 24px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
          }
          .limits-card {
            background-color: #0C0D12;
            border: 1px solid #1B1C25;
            border-radius: 16px;
            padding: 32px 40px;
          }
          .limits-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 40px;
          }
          .limit-item {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .limit-meta {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #F8FAFC;
          }
          .limit-meta h4 {
            font-size: 0.9rem;
            font-weight: 600;
            margin: 0;
          }
          .limit-item p {
            font-size: 0.78rem;
            color: #64748B;
            line-height: 1.55;
            margin: 0;
          }

          /* CLERK MODAL */
          .clerk-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(3, 4, 7, 0.85);
            backdrop-filter: blur(8px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .clerk-modal-wrapper {
            background-color: #0F1016;
            border: 1px solid #21232E;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
          }

          /* FOOTER */
          .landing-footer {
            margin-top: auto;
            border-top: 1px solid #13151E;
            padding: 30px 24px;
            text-align: center;
          }
          .landing-footer p {
            font-size: 0.75rem;
            color: #475569;
            margin: 0;
          }

          @media (max-width: 900px) {
            .features-grid {
              grid-template-columns: 1fr;
            }
            .limits-grid {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .window-body {
              grid-template-columns: 1fr;
              height: auto;
            }
            .mock-sidebar {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }

  // 3. Authenticated Workspace Dashboard Placeholder (will plan full UI later)
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="brand-logo">
          <div className="logo-box">
            <GraduationCap size={18} />
          </div>
          <span>StudyFlow AI</span>
        </div>

        <div className="user-profile">
          <span className="welcome-text">Student: {userFullName}</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="dashboard-body">
        <div className="welcome-card">
          <div className="card-icon">
            <Sparkles size={28} />
          </div>
          <h2>Welcome to StudyFlow</h2>
          <p>
            Your account is authenticated successfully. The interactive workspace, document library, and advanced RAG features are currently undergoing pivot redesign and will be implemented in the next phases.
          </p>

          <div className="meta-specs">
            <div className="spec-item">
              <span className="spec-label">User ID</span>
              <span className="spec-val">{userId}</span>
            </div>
            <div className="spec-item">
              <span className="spec-label">Workspace State</span>
              <span className="spec-val active">Ready</span>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .dashboard-container {
          background-color: #090A0F;
          color: #F8FAFC;
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          display: flex;
          flex-direction: column;
        }
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 40px;
          border-bottom: 1px solid #14161F;
          background-color: #0C0D14;
        }
        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .logo-box {
          width: 28px;
          height: 28px;
          background-color: #1E202B;
          border: 1px solid #2A2C38;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-profile {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .welcome-text {
          font-size: 0.8rem;
          color: #94A3B8;
          font-weight: 500;
        }
        .dashboard-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }
        .welcome-card {
          max-width: 480px;
          background-color: #0D0E14;
          border: 1px solid #1A1C25;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .card-icon {
          width: 56px;
          height: 56px;
          background-color: #151620;
          border: 1px solid #242636;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #F8FAFC;
          margin-bottom: 24px;
        }
        .welcome-card h2 {
          font-size: 1.4rem;
          margin: 0 0 12px 0;
          font-weight: 700;
        }
        .welcome-card p {
          font-size: 0.85rem;
          color: #94A3B8;
          line-height: 1.6;
          margin: 0 0 28px 0;
        }
        .meta-specs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: #08090E;
          border: 1px solid #13141C;
          border-radius: 10px;
          padding: 16px 20px;
          text-align: left;
        }
        .spec-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.76rem;
        }
        .spec-label {
          color: #475569;
          font-weight: 500;
        }
        .spec-val {
          color: #94A3B8;
          font-family: monospace;
        }
        .spec-val.active {
          color: #10B981;
          font-weight: 600;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
