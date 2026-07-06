import React, { useState, useEffect } from 'react';
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Clock, Activity, ShieldAlert, LogOut, CheckCircle2, Cpu, Database, Key, Play } from 'lucide-react';
import axios from 'axios';
import { SignIn, UserButton, useUser } from '@clerk/clerk-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline
  const [sandboxTab, setSandboxTab] = useState('chat'); // chat, quiz, flashcards

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
        <p>Syncing security credentials...</p>
        <style>{`
          .auth-loader-screen {
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #030712;
            color: #9CA3AF;
            gap: 16px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          .spinner-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: #6366F1;
            box-shadow: 0 0 12px #6366F1;
            animation: pulse 1.2s infinite ease-in-out;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.4); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // 2. Signed-Out View (High-Fidelity landing page)
  if (!isClerkEnabled || !user) {
    return (
      <div className="landing-container">
        {/* Soft Background Grid Glows */}
        <div className="radial-spotlight spotlight-1"></div>
        <div className="radial-spotlight spotlight-2"></div>

        {/* Fixed Header Navigation */}
        <header className="landing-header">
          <div className="header-inner">
            <div className="brand-logo">
              <div className="logo-box">
                <GraduationCap size={16} />
              </div>
              <span>StudyFlow AI</span>
            </div>

            <nav className="nav-links">
              <a href="#features">Features</a>
              <a href="#sandbox">Sandbox Workspace</a>
              <a href="#tech">Technology</a>
              <a href="#rules">Limits & Rules</a>
            </nav>

            <div className="nav-actions">
              <span className="api-badge">
                <span className={`status-dot ${backendStatus === 'online' ? 'online' : 'offline'}`}></span>
                <span>API: {backendStatus.toUpperCase()}</span>
              </span>
              <button 
                className="btn-signin"
                onClick={() => {
                  if (isClerkEnabled) {
                    window.location.hash = "#/sign-in";
                  } else {
                    alert("Running in Mock Guest Mode. Set VITE_CLERK_PUBLISHABLE_KEY to enable Clerk.");
                  }
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="hero-section" id="hero">
          <div className="announcement">
            <span className="badge-glow"></span>
            <Sparkles size={12} className="sparkle" />
            <span>Grounded active recall learning engine</span>
          </div>

          <h1 className="hero-title">
            Turn your textbooks <br className="hero-br" />
            into <span className="text-gradient">interactive study spaces</span>
          </h1>

          <p className="hero-subtitle">
            Upload PDFs or lecture transcripts to instantly generate active-recall flashcards, practice quizzes, and an AI tutor grounded strictly in your coursework.
          </p>

          <div className="cta-wrapper">
            <button 
              className="btn-primary-hero"
              onClick={() => {
                if (isClerkEnabled) {
                  window.location.hash = "#/sign-in";
                } else {
                  alert("Running in Mock Mode. Set your Clerk publishable key to sign in.");
                }
              }}
            >
              <span>Get Started for Free</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* HIGH CONTRAST SANDBOX PLAYGROUND PREVIEW (White Workspace) */}
        <section className="sandbox-section" id="sandbox">
          <div className="sandbox-wrapper">
            <div className="sandbox-tabs">
              <button 
                className={`sandbox-tab-btn ${sandboxTab === 'chat' ? 'active' : ''}`}
                onClick={() => setSandboxTab('chat')}
              >
                <Sparkles size={14} />
                <span>AI Chat Playground</span>
              </button>
              <button 
                className={`sandbox-tab-btn ${sandboxTab === 'quiz' ? 'active' : ''}`}
                onClick={() => setSandboxTab('quiz')}
              >
                <BookOpen size={14} />
                <span>Practice Quiz</span>
              </button>
              <button 
                className={`sandbox-tab-btn ${sandboxTab === 'flashcards' ? 'active' : ''}`}
                onClick={() => setSandboxTab('flashcards')}
              >
                <Clock size={14} />
                <span>3D Flashcards</span>
              </button>
            </div>

            <div className="sandbox-workspace">
              {sandboxTab === 'chat' && (
                <div className="sandbox-chat-view">
                  <div className="sandbox-sidebar">
                    <div className="sidebar-section-title">Active Source</div>
                    <div className="mock-doc-card">
                      <BookOpen size={12} />
                      <span>Galvin_Operating_Systems.pdf</span>
                    </div>
                    <div className="sidebar-section-title mt-4">Document Chapters</div>
                    <div className="chapter-list">
                      <div className="chapter-item active">1. Introduction to OS</div>
                      <div className="chapter-item">2. Process Management</div>
                      <div className="chapter-item">3. Memory Layout</div>
                    </div>
                  </div>
                  <div className="sandbox-chat-area">
                    <div className="chat-window-inner">
                      <div className="chat-message user-bubble">What is the difference between kernel and user mode?</div>
                      <div className="chat-message bot-bubble">
                        <div className="source-citation">
                          <span>📚 Cited: Page 14 (OS Architecture)</span>
                        </div>
                        <p>
                          The key difference is <strong>privilege levels</strong>:
                        </p>
                        <ul>
                          <li><strong>Kernel Mode:</strong> Runs core OS operations with direct, unrestricted hardware access.</li>
                          <li><strong>User Mode:</strong> Restricts user programs from accessing hardware directly to protect system stability.</li>
                        </ul>
                      </div>
                    </div>
                    <div className="chat-input-simulator">
                      <span>Ask a question about this chapter...</span>
                      <div className="send-btn-sim"><Play size={12} /></div>
                    </div>
                  </div>
                </div>
              )}

              {sandboxTab === 'quiz' && (
                <div className="sandbox-quiz-view">
                  <div className="quiz-header-sim">
                    <span>Practice Quiz: Operating Systems Chapter 1</span>
                    <span className="quiz-score">Question 1 of 5</span>
                  </div>
                  <div className="quiz-card-sim">
                    <p className="quiz-question">Which mode of CPU execution restricts direct access to hardware instructions?</p>
                    <div className="quiz-options-sim">
                      <div className="quiz-option-sim">A) Kernel Mode</div>
                      <div className="quiz-option-sim correct">B) User Mode (Correct answer)</div>
                      <div className="quiz-option-sim">C) System Mode</div>
                      <div className="quiz-option-sim">D) Privileged Mode</div>
                    </div>
                    <div className="quiz-explanation-sim">
                      <strong>Explanation:</strong> User mode runs applications with restricted privileges to prevent them from crashing or compromising hardware subsystems.
                    </div>
                  </div>
                </div>
              )}

              {sandboxTab === 'flashcards' && (
                <div className="sandbox-flash-view">
                  <div className="flash-card-sim">
                    <div className="flash-card-side front">
                      <span className="card-label">Question</span>
                      <p>What mechanism notifies the CPU that an event has occurred requiring attention?</p>
                      <span className="card-action-hint">Click Card to Flip</span>
                    </div>
                    <div className="flash-card-side back-sim">
                      <span className="card-label">Answer</span>
                      <p>An Interrupt (Hardware signal or Software trap)</p>
                      <div className="flash-grading">
                        <span>Rate difficulty:</span>
                        <div className="grades">
                          <button className="btn-grade">Hard</button>
                          <button className="btn-grade">Medium</button>
                          <button className="btn-grade active">Easy</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEATURE GRID */}
        <section className="features-section" id="features">
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

        {/* TECH OF THE WEB */}
        <section className="tech-section" id="tech">
          <div className="section-header">
            <h2>The Tech Stack Behind StudyFlow AI</h2>
            <p>Engineered for high performance, accuracy, and absolute local data integrity.</p>
          </div>

          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon"><Cpu size={18} /></div>
              <h4>FastAPI Backend</h4>
              <p>Asynchronous Python service managing ingestion, prompt engineering, and API pipelines.</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon"><Sparkles size={18} /></div>
              <h4>SentenceTransformers & FAISS</h4>
              <p>Extracts 384-dimensional embeddings and executes vector similarity locally on disk.</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon"><Database size={18} /></div>
              <h4>Supabase PGVector</h4>
              <p>Relational Postgres store holding documents metadata and chronological chat history.</p>
            </div>
            <div className="tech-card">
              <div className="tech-icon"><Key size={18} /></div>
              <h4>Gemini API & RAGAS</h4>
              <p>Grounded answer generation using Gemini, validated by real-time RAGAS evaluations.</p>
            </div>
          </div>
        </section>

        {/* USAGE RULES */}
        <section className="usage-section" id="rules">
          <div className="usage-card">
            <h3>Workspace Rules & Limits</h3>
            <div className="usage-rules-list">
              <div className="rule-item">
                <CheckCircle2 size={16} className="rule-icon" />
                <span><strong>File Capacity:</strong> Free tier supports up to 3 active PDF documents in your library.</span>
              </div>
              <div className="rule-item">
                <CheckCircle2 size={16} className="rule-icon" />
                <span><strong>File Size:</strong> PDF uploads are limited to a maximum of 10MB per file.</span>
              </div>
              <div className="rule-item">
                <CheckCircle2 size={16} className="rule-icon" />
                <span><strong>Rate Quotas:</strong> Standard rate limits allow up to 15 questions or evaluations per minute.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          <p>© 2026 StudyFlow AI. Designed for modern active-recall learning. All rights reserved.</p>
        </footer>

        {/* Clerk Sign-in Overlay */}
        {isClerkEnabled && window.location.hash === "#/sign-in" && (
          <div className="clerk-overlay" onClick={() => window.location.hash = ""}>
            <div className="clerk-modal" onClick={(e) => e.stopPropagation()}>
              <SignIn routing="hash" />
            </div>
          </div>
        )}

        <style>{`
          .landing-container {
            background-color: #030712;
            color: #F9FAFB;
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow-y: auto;
            width: 100vw;
          }

          /* GLOWS */
          .radial-spotlight {
            position: absolute;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.08;
            pointer-events: none;
            z-index: 1;
          }
          .spotlight-1 {
            background-color: #6366F1;
            top: -100px;
            left: -100px;
          }
          .spotlight-2 {
            background-color: #EC4899;
            bottom: 10%;
            right: -100px;
          }

          /* HEADER - FIXED NAVIGATION BAR */
          .landing-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background-color: rgba(3, 7, 18, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(12px);
          }
          .header-inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 40px;
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            box-sizing: border-box;
          }
          .brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.05rem;
            font-weight: 700;
            letter-spacing: -0.02em;
          }
          .logo-box {
            width: 30px;
            height: 30px;
            background-color: #111827;
            border: 1px solid #1F2937;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
          }
          .nav-links {
            display: flex;
            align-items: center;
            gap: 32px;
          }
          .nav-links a {
            color: #9CA3AF;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: color 0.2s;
          }
          .nav-links a:hover {
            color: #FFFFFF;
          }
          .nav-actions {
            display: flex;
            align-items: center;
            gap: 16px;
          }
          .api-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #111827;
            border: 1px solid #1F2937;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.74rem;
            font-weight: 500;
            color: #9CA3AF;
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
            background: none;
            border: 1px solid #374151;
            color: #F9FAFB;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s, border-color 0.2s;
          }
          .btn-signin:hover {
            background-color: #111827;
            border-color: #4B5563;
          }

          /* HERO */
          .hero-section {
            padding: 150px 24px 40px 24px;
            text-align: center;
            max-width: 850px;
            margin: 0 auto;
            position: relative;
            z-index: 10;
          }
          .announcement {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background-color: #111827;
            border: 1px solid #1F2937;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.78rem;
            font-weight: 500;
            color: #9CA3AF;
            margin-bottom: 24px;
          }
          .sparkle {
            color: #818CF8;
          }
          .hero-title {
            font-size: 3.2rem;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.04em;
            margin: 0 0 20px 0;
            color: #FFFFFF;
          }
          .text-gradient {
            background: linear-gradient(135deg, #F9FAFB 30%, #9CA3AF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .hero-subtitle {
            font-size: 1.05rem;
            color: #9CA3AF;
            line-height: 1.6;
            margin: 0 auto 36px auto;
            max-width: 600px;
          }
          .btn-primary-hero {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #FFFFFF;
            color: #030712;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
            transition: opacity 0.2s;
          }
          .btn-primary-hero:hover {
            opacity: 0.9;
          }

          /* SANDBOX PLAYGROUND PREVIEW (White Workspace) */
          .sandbox-section {
            padding: 20px 24px 60px 24px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
          }
          .sandbox-wrapper {
            background-color: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            color: #1F2937;
          }
          .sandbox-tabs {
            background-color: #F9FAFB;
            border-bottom: 1px solid #E5E7EB;
            display: flex;
            padding: 8px 16px;
            gap: 8px;
          }
          .sandbox-tab-btn {
            background: none;
            border: 1px solid transparent;
            color: #4B5563;
            padding: 8px 14px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
          }
          .sandbox-tab-btn:hover {
            color: #111827;
            background-color: #F3F4F6;
          }
          .sandbox-tab-btn.active {
            background-color: #FFFFFF;
            color: #111827;
            border-color: #E5E7EB;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          }
          .sandbox-workspace {
            min-height: 360px;
            background-color: #FFFFFF;
          }

          /* SANDBOX CHAT VIEW */
          .sandbox-chat-view {
            display: grid;
            grid-template-columns: 260px 1fr;
            min-height: 360px;
          }
          .sandbox-sidebar {
            background-color: #F9FAFB;
            border-right: 1px solid #E5E7EB;
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .sidebar-section-title {
            font-size: 0.68rem;
            font-weight: 700;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          .sidebar-section-title.mt-4 {
            margin-top: 16px;
          }
          .mock-doc-card {
            background-color: #FFFFFF;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 10px 12px;
            font-size: 0.78rem;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #111827;
            font-weight: 500;
          }
          .chapter-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .chapter-item {
            font-size: 0.78rem;
            padding: 8px 12px;
            border-radius: 6px;
            color: #4B5563;
            font-weight: 500;
          }
          .chapter-item.active {
            background-color: #F3F4F6;
            color: #111827;
          }
          .sandbox-chat-area {
            display: flex;
            flex-direction: column;
            padding: 24px;
            gap: 20px;
            background-color: #FFFFFF;
          }
          .chat-window-inner {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .chat-message {
            max-width: 85%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.84rem;
            line-height: 1.5;
          }
          .chat-message.user-bubble {
            background-color: #F3F4F6;
            color: #111827;
            align-self: flex-end;
          }
          .chat-message.bot-bubble {
            background-color: #FFFFFF;
            border: 1px solid #E5E7EB;
            color: #374151;
            align-self: flex-start;
          }
          .chat-message.bot-bubble p {
            margin: 0 0 10px 0;
          }
          .chat-message.bot-bubble ul {
            margin: 0;
            padding-left: 20px;
          }
          .source-citation {
            font-size: 0.72rem;
            color: #6B7280;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .chat-input-simulator {
            background-color: #F9FAFB;
            border: 1px solid #E5E7EB;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.8rem;
            color: #9CA3AF;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .send-btn-sim {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #111827;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          /* SANDBOX QUIZ VIEW */
          .sandbox-quiz-view {
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .quiz-header-sim {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.85rem;
            font-weight: 600;
            border-bottom: 1px solid #E5E7EB;
            padding-bottom: 14px;
          }
          .quiz-score {
            color: #6B7280;
            font-size: 0.78rem;
          }
          .quiz-card-sim {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .quiz-question {
            font-size: 0.95rem;
            font-weight: 600;
            color: #111827;
            margin: 0;
          }
          .quiz-options-sim {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .quiz-option-sim {
            border: 1px solid #E5E7EB;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 500;
            color: #4B5563;
          }
          .quiz-option-sim.correct {
            border-color: #10B981;
            background-color: #ECFDF5;
            color: #065F46;
          }
          .quiz-explanation-sim {
            background-color: #F9FAFB;
            border-left: 3px solid #111827;
            padding: 12px 16px;
            font-size: 0.78rem;
            color: #4B5563;
            line-height: 1.5;
          }

          /* SANDBOX FLASHVIEW */
          .sandbox-flash-view {
            padding: 40px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .flash-card-sim {
            width: 380px;
            min-height: 220px;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            background-color: #FFFFFF;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            position: relative;
          }
          .flash-card-side {
            display: flex;
            flex-direction: column;
            height: 100%;
          }
          .flash-card-side.back-sim {
            gap: 12px;
          }
          .card-label {
            font-size: 0.65rem;
            font-weight: 700;
            color: #9CA3AF;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 12px;
          }
          .flash-card-side p {
            font-size: 0.95rem;
            font-weight: 500;
            color: #111827;
            margin: 0;
            line-height: 1.5;
            flex: 1;
          }
          .card-action-hint {
            font-size: 0.7rem;
            color: #9CA3AF;
            text-align: center;
            margin-top: 16px;
          }
          .flash-grading {
            border-top: 1px solid #F3F4F6;
            padding-top: 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .flash-grading span {
            font-size: 0.7rem;
            color: #6B7280;
            font-weight: 600;
          }
          .grades {
            display: flex;
            gap: 8px;
          }
          .btn-grade {
            background-color: #F3F4F6;
            color: #4B5563;
            border: none;
            padding: 6px 14px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-grade.active {
            background-color: #111827;
            color: #FFFFFF;
          }

          /* FEATURES SECTION */
          .features-section {
            padding: 80px 24px 40px 24px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
          }
          .feature-card {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 12px;
            padding: 30px;
            transition: border-color 0.2s;
          }
          .feature-card:hover {
            border-color: #374151;
          }
          .feature-icon {
            width: 40px;
            height: 40px;
            background-color: #111827;
            border: 1px solid #1F2937;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
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
            color: #9CA3AF;
            line-height: 1.5;
            margin: 0;
          }

          /* TECH SECTION */
          .tech-section {
            padding: 80px 24px 40px 24px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
          }
          .section-header {
            text-align: center;
            margin-bottom: 50px;
          }
          .section-header h2 {
            font-size: 2rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            margin: 0 0 12px 0;
            color: #FFFFFF;
          }
          .section-header p {
            font-size: 1rem;
            color: #9CA3AF;
            margin: 0;
          }
          .tech-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          .tech-card {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 12px;
            padding: 24px;
            transition: border-color 0.2s;
          }
          .tech-card:hover {
            border-color: #374151;
          }
          .tech-icon {
            width: 36px;
            height: 36px;
            background-color: #111827;
            border: 1px solid #1F2937;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            margin-bottom: 16px;
          }
          .tech-card h4 {
            font-size: 0.95rem;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #FFFFFF;
          }
          .tech-card p {
            font-size: 0.8rem;
            color: #9CA3AF;
            line-height: 1.5;
            margin: 0;
          }

          /* USAGE LIMITS SECTION */
          .usage-section {
            padding: 40px 24px 80px 24px;
            max-width: 1000px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
          }
          .usage-card {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 16px;
            padding: 40px;
          }
          .usage-card h3 {
            font-size: 1.25rem;
            font-weight: 700;
            margin: 0 0 24px 0;
            color: #FFFFFF;
          }
          .usage-rules-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 30px;
          }
          .rule-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          .rule-icon {
            color: #10B981;
            margin-top: 2px;
            flex-shrink: 0;
          }
          .rule-item span {
            font-size: 0.82rem;
            color: #9CA3AF;
            line-height: 1.5;
          }

          /* CLERK OVERLAY */
          .clerk-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(3, 7, 18, 0.8);
            backdrop-filter: blur(8px);
            z-index: 100;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .clerk-modal {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 12px;
            overflow: hidden;
          }

          /* FOOTER */
          .landing-footer {
            margin-top: auto;
            border-top: 1px solid #111827;
            padding: 30px 24px;
            text-align: center;
            position: relative;
            z-index: 10;
          }
          .landing-footer p {
            font-size: 0.74rem;
            color: #4B5563;
            margin: 0;
          }

          @media (max-width: 900px) {
            .hero-title {
              font-size: 2.2rem;
            }
            .hero-br {
              display: none;
            }
            .nav-links {
              display: none;
            }
            .tech-grid {
              grid-template-columns: 1fr 1fr;
            }
            .usage-rules-list {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .sandbox-chat-view {
              grid-template-columns: 1fr;
            }
            .sandbox-sidebar {
              display: none;
            }
            .sandbox-tabs {
              flex-wrap: wrap;
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
            <GraduationCap size={16} />
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
            <Sparkles size={24} />
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
          background-color: #030712;
          color: #F9FAFB;
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
          border-bottom: 1px solid #1F2937;
          background-color: #0B0F19;
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
          background-color: #111827;
          border: 1px solid #1F2937;
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
          color: #9CA3AF;
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
          background-color: #0B0F19;
          border: 1px solid #1F2937;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .card-icon {
          width: 50px;
          height: 50px;
          background-color: #111827;
          border: 1px solid #1F2937;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          margin-bottom: 24px;
        }
        .welcome-card h2 {
          font-size: 1.4rem;
          margin: 0 0 12px 0;
          font-weight: 700;
        }
        .welcome-card p {
          font-size: 0.85rem;
          color: #9CA3AF;
          line-height: 1.6;
          margin: 0 0 28px 0;
        }
        .meta-specs {
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: #030712;
          border: 1px solid #1F2937;
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
          color: #6B7280;
          font-weight: 500;
        }
        .spec-val {
          color: #9CA3AF;
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
