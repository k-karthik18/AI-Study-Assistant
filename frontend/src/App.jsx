import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, ArrowRight, Sparkles, BookOpen, Clock, Activity, ShieldAlert, LogOut, CheckCircle2, Cpu, Database, Key, Play, Mail, Heart, ChevronDown, Menu, X, ArrowUpRight, HelpCircle } from 'lucide-react';
import axios from 'axios';
import { SignIn, UserButton, useUser } from '@clerk/clerk-react';

export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking'); // checking, online, offline
  const [sandboxTab, setSandboxTab] = useState('chat'); // chat, quiz, flashcards
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollArrow, setShowScrollArrow] = useState(true);

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

  // --- Scroll Arrow Visibility ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setShowScrollArrow(false);
      } else {
        setShowScrollArrow(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Sandbox Interactive Simulator Loop ---
  const [simInput, setSimInput] = useState("");
  const [simMessages, setSimMessages] = useState([
    { role: 'system', content: 'Welcome to Galvin Operating Systems chatbot! Ask me anything.' }
  ]);
  const [simIsTyping, setSimIsTyping] = useState(false);
  const simulationTimerRef = useRef(null);

  const startSimulation = () => {
    // Clear any active timers
    if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);

    const question = "What is the difference between kernel and user mode?";
    const answer = `The key difference is execution privileges at the CPU hardware level:
    
• Kernel Mode: Runs core operating system software with full, unrestricted access to physical memory and hardware instructions.
• User Mode: Runs standard student applications. Direct hardware access is prohibited to prevent malicious code or syntax crashes from freezing the computer.`;

    let charIndex = 0;
    setSimInput("");
    setSimMessages([
      { role: 'system', content: 'Galvin_Operating_Systems_Chapter1.pdf successfully loaded.' }
    ]);

    // Step 1: Type the user query letter by letter
    const typeLetter = () => {
      if (charIndex < question.length) {
        setSimInput(prev => prev + question.charAt(charIndex));
        charIndex++;
        simulationTimerRef.current = setTimeout(typeLetter, 60);
      } else {
        // Step 2: Query fully typed, append message to conversation list after 600ms
        simulationTimerRef.current = setTimeout(() => {
          setSimMessages(prev => [...prev, { role: 'user', content: question }]);
          setSimInput("");
          // Step 3: Trigger typing indicator
          setSimIsTyping(true);

          // Step 4: Display cited response
          simulationTimerRef.current = setTimeout(() => {
            setSimIsTyping(false);
            setSimMessages(prev => [...prev, {
              role: 'bot',
              citation: '📚 Cited: Page 14 (OS Architecture)',
              content: answer
            }]);

            // Step 5: Wait 8 seconds before restarting the loop
            simulationTimerRef.current = setTimeout(startSimulation, 8000);
          }, 1500);
        }, 600);
      }
    };

    simulationTimerRef.current = setTimeout(typeLetter, 1000);
  };

  useEffect(() => {
    if (sandboxTab === 'chat') {
      startSimulation();
    } else {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    }
    return () => {
      if (simulationTimerRef.current) clearTimeout(simulationTimerRef.current);
    };
  }, [sandboxTab]);

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

        {/* Fixed Header Navigation - Solid Solid Black */}
        <header className="landing-header">
          <div className="header-inner">
            <div className="landing-brand-logo">
              <GraduationCap size={20} className="logo-icon-svg" />
              <span className="logo-text">StudyFlow AI</span>
            </div>

            <nav className="nav-links">
              <a href="#hero">Home</a>
              <a href="#sandbox">Sandbox</a>
              <a href="#features">Features</a>
              <a href="#tech">Technology</a>
              <a href="#rules">Rules & FAQs</a>
            </nav>

            <div className="nav-actions">
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

              <button className="menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <div className="mobile-nav">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)}>Home</a>
              <a href="#sandbox" onClick={() => setMobileMenuOpen(false)}>Sandbox</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#tech" onClick={() => setMobileMenuOpen(false)}>Technology</a>
              <a href="#rules" onClick={() => setMobileMenuOpen(false)}>Rules</a>
            </div>
          )}
        </header>

        {/* Hero Section - Screen Sized & Spacious */}
        <section className="hero-section" id="hero">
          <div className="hero-grid">
            <div className="hero-text-side">
              <div className="announcement">
                <Sparkles size={12} className="sparkle" />
                <span>Grounded active recall learning engine</span>
              </div>

              <h1 className="hero-title">
                Turn your textbooks <br />
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
            </div>

            <div className="hero-visual-side">
              <div className="visual-container">
                {/* Book Source */}
                <div className="visual-book">
                  <div className="book-spine"></div>
                  <div className="book-cover">
                    <div className="book-pdf-icon">PDF</div>
                    <BookOpen size={36} className="book-center-icon" />
                    <span className="book-title">Course Textbook</span>
                    <div className="book-decoration-lines">
                      <span className="dec-line"></span>
                      <span className="dec-line short"></span>
                    </div>
                  </div>
                </div>

                {/* Flying / transforming flashcards stream */}
                <div className="visual-card visual-card-1">
                  <div className="visual-card-glow"></div>
                  <span className="card-lbl-sim question">Q</span>
                  <p className="card-txt-sim">What notifies CPU of device events?</p>
                  <span className="card-btn-sim">Reveal</span>
                </div>

                <div className="visual-card visual-card-2">
                  <div className="visual-card-glow"></div>
                  <span className="card-lbl-sim answer">A</span>
                  <p className="card-txt-sim">An Interrupt signal or software trap.</p>
                  <div className="card-check-sim"><CheckCircle2 size={12} /></div>
                </div>

                <div className="visual-card visual-card-3">
                  <div className="visual-card-glow"></div>
                  <span className="card-lbl-sim question">Q</span>
                  <p className="card-txt-sim">Define Virtual Memory...</p>
                </div>

                {/* Connection lines and flying flow dots */}
                <div className="flow-lines-wrapper">
                  <svg className="flow-path-svg" viewBox="0 0 200 100" fill="none">
                    <path d="M10,50 Q100,-10 190,40" stroke="rgba(99,102,241,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M10,60 Q100,110 190,60" stroke="rgba(217,70,239,0.2)" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>
                  <div className="flow-particle dot-1"></div>
                  <div className="flow-particle dot-2"></div>
                  <div className="flow-particle dot-3"></div>
                </div>
              </div>
            </div>
          </div>

          {showScrollArrow && (
            <a href="#sandbox" className="scroll-explorer animate-fade-in">
              <span>Scroll to explore</span>
              <ChevronDown size={18} className="scroll-arrow" />
            </a>
          )}
        </section>

        {/* HIGH CONTRAST SANDBOX PLAYGROUND PREVIEW (White Workspace inside macOS Window) */}
        <section className="sandbox-section" id="sandbox">
          <div className="section-header-compact">
            <h2>The Sandbox Workspace</h2>
            <p>Test drive our workspace features live. Click any tab below to switch views.</p>
          </div>

          {/* MAC OUTLAYER WRAPPER */}
          <div className="mac-window-wrapper">
            <div className="mac-title-bar">
              <div className="mac-dots">
                <span className="mac-dot-btn red"></span>
                <span className="mac-dot-btn yellow"></span>
                <span className="mac-dot-btn green"></span>
              </div>
              <div className="mac-title-text">Galvin_Operating_Systems_Chapter1.pdf — StudyFlow AI</div>
            </div>

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
                        {simMessages.map((msg, index) => (
                          <div key={index} className={`chat-message ${msg.role === 'user' ? 'user-bubble' : msg.role === 'system' ? 'system-bubble' : 'bot-bubble'}`}>
                            {msg.citation && (
                              <div className="source-citation">
                                <span>{msg.citation}</span>
                              </div>
                            )}
                            <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{msg.content}</p>
                          </div>
                        ))}
                        {simIsTyping && (
                          <div className="chat-message bot-bubble typing-dots">
                            <span className="dot"></span>
                            <span className="dot"></span>
                            <span className="dot"></span>
                          </div>
                        )}
                      </div>
                      <div className="chat-input-simulator">
                        <span className="simulated-input-text">{simInput || "Ask a question about this chapter..."}</span>
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
          </div>
        </section>

        {/* FEATURE GRID - Screen Sized and Dense */}
        <section className="features-section" id="features">
          <div className="section-header">
            <h2>Active study tools built for recall</h2>
            <p>We build structured learning assets directly from your sources, avoiding standard LLM hallucinations.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Sparkles size={24} />
              </div>
              <h3>Interactive AI Tutoring</h3>
              <p>Grounded RAG chat that answers questions using only the provided textbook, citing exact sources and page references.</p>
              <ul className="card-bullets">
                <li>Anti-hallucination guardrails</li>
                <li>Hyperlinked page annotations</li>
                <li>Chronological thread logs</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={24} />
              </div>
              <h3>Active Practice Quizzes</h3>
              <p>Automatically generated multiple-choice tests with detailed explanations and grading to verify your understanding.</p>
              <ul className="card-bullets">
                <li>Real-time score counters</li>
                <li>Step-by-step logic breakdown</li>
                <li>Dynamic MCQ formatting</li>
              </ul>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Clock size={24} />
              </div>
              <h3>Spaced Repetition Flashcards</h3>
              <p>Flip cards with memory retrieval scores ("Easy", "Medium", "Hard") that adapt study sessions to your pace.</p>
              <ul className="card-bullets">
                <li>3D flip active animations</li>
                <li>Spaced-repetition engine</li>
                <li>Workspace memory analytics</li>
              </ul>
            </div>
          </div>
        </section>

        {/* TECH OF THE WEB - Screen Sized and Dense */}
        <section className="tech-section" id="tech">
          <div className="section-header">
            <h2>The Tech Stack Behind StudyFlow AI</h2>
            <p>Engineered for high performance, accuracy, and absolute local data integrity.</p>
          </div>

          <div className="tech-grid">
            <div className="tech-card">
              <div className="tech-icon"><Cpu size={22} /></div>
              <h4>FastAPI Backend</h4>
              <p>Asynchronous Python service managing ingestion, prompt engineering, and API pipelines.</p>
              <div className="tech-specs-sub">Runs local operations under 20ms without event-loop blocks.</div>
            </div>
            <div className="tech-card">
              <div className="tech-icon"><Sparkles size={22} /></div>
              <h4>SentenceTransformers</h4>
              <p>Extracts 384-dimensional embeddings and executes vector similarity locally on disk.</p>
              <div className="tech-specs-sub">Powered by all-MiniLM-L6-v2 running offline in-process.</div>
            </div>
            <div className="tech-card">
              <div className="tech-icon"><Database size={22} /></div>
              <h4>Supabase Postgres</h4>
              <p>Relational Postgres store holding documents metadata and chronological chat history.</p>
              <div className="tech-specs-sub">Handles high-security structured transactional user logs.</div>
            </div>
            <div className="tech-card">
              <div className="tech-icon"><Key size={22} /></div>
              <h4>Gemini API & RAGAS</h4>
              <p>Grounded answer generation using Gemini, validated by real-time RAGAS evaluations.</p>
              <div className="tech-specs-sub">Automated metric evaluations track LLM output fidelity.</div>
            </div>
          </div>
        </section>

        {/* USAGE & QUOTAS SECTION - Clean comparative grid layout to fill whitespace */}
        <section className="usage-section" id="rules">
          <div className="section-header">
            <h2>Workspace Quotas & FAQs</h2>
            <p>Understand the local operational limits and system capacities built into StudyFlow.</p>
          </div>

          <div className="quota-faq-container">
            <div className="quota-table-box">
              <h3>System Capacity Matrix</h3>
              <div className="quota-row">
                <span className="quota-label">PDF Storage Capacity</span>
                <span className="quota-val">3 active textbooks</span>
              </div>
              <div className="quota-row">
                <span className="quota-label">Max File Size Limit</span>
                <span className="quota-val">10MB per document</span>
              </div>
              <div className="quota-row">
                <span className="quota-label">Vector Embedding Model</span>
                <span className="quota-val">all-MiniLM-L6-v2</span>
              </div>
              <div className="quota-row">
                <span className="quota-label">Query Generation Model</span>
                <span className="quota-val">Gemini 2.5 Flash</span>
              </div>
              <div className="quota-row">
                <span className="quota-label">Audit Engine</span>
                <span className="quota-val">RAGAS Framework</span>
              </div>
            </div>

            <div className="faq-accordions">
              <div className="faq-item">
                <h5>How does local vector storage work?</h5>
                <p>We generate 384-dimensional vector points from textbook pages locally on our Python server and append them directly to a local FAISS flat index, keeping your study vaults secure.</p>
              </div>
              <div className="faq-item">
                <h5>Why are uploads restricted to 10MB?</h5>
                <p>Capping files at 10MB ensures that semantic chunks can be parsed and embedded on standard computing devices without causing excessive memory (RAM) load.</p>
              </div>
              <div className="faq-item">
                <h5>What are the RAGAS audit scores?</h5>
                <p>RAGAS runs evaluations checking context relevance and faithfulness parameters. If a response does not map to the textbook, the score flags it to verify correct sourcing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Rich Multi-Column Footer */}
        <footer className="landing-footer">
          <div className="footer-grid-wrapper">
            <div className="footer-col brand-col">
              <div className="landing-brand-logo">
                <GraduationCap size={20} className="logo-icon-svg" />
                <span className="logo-text">StudyFlow AI</span>
              </div>
              <p className="brand-description">
                A high-fidelity grounded active recall learning engine designed to transform textbook ingestion into interactive study spaces.
              </p>
            </div>

            <div className="footer-col">
              <h4>Navigation</h4>
              <ul className="footer-col-links">
                <li><a href="#hero">Home</a></li>
                <li><a href="#sandbox">Sandbox Workspace</a></li>
                <li><a href="#features">Recall Features</a></li>
                <li><a href="#tech">Tech Architecture</a></li>
                <li><a href="#rules">Rules & FAQs</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Architecture Stack</h4>
              <ul className="footer-col-links">
                <li><span>FastAPI Backend</span></li>
                <li><span>FAISS Index Storage</span></li>
                <li><span>all-MiniLM Embeddings</span></li>
                <li><span>Gemini 2.5 Synthesizer</span></li>
                <li><span>RAGAS Evaluator</span></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Developer & Contact</h4>
              <div className="developer-badge">
                <span>Made with </span>
                <Heart size={14} className="heart-icon" />
                <span> by <strong>Karthik K</strong></span>
              </div>
              <div className="rich-social-links">
                <a href="mailto:kosurikarthik07@gmail.com" title="Gmail Connection">
                  <Mail size={16} />
                  <span>kosurikarthik07@gmail.com</span>
                </a>
                <a href="https://linkedin.com/in/karthik-kosuri" target="_blank" rel="noopener noreferrer" title="LinkedIn Profile">
                  <svg className="social-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  <span>LinkedIn Profile</span>
                </a>
                <a href="https://github.com/k-karthik18/AI-Study-Assistant" target="_blank" rel="noopener noreferrer" title="GitHub Codebase">
                  <svg className="social-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span>GitHub Repository</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <p>© 2026 StudyFlow AI. Grounded Active Recall Platform. All rights reserved.</p>
          </div>
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
            scroll-behavior: smooth;
          }

          /* GLOWS */
          .radial-spotlight {
            position: absolute;
            width: 600px;
            height: 600px;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.22;
            pointer-events: none;
            z-index: 1;
          }
          .spotlight-1 {
            background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%);
            top: -100px;
            left: -100px;
          }
          .spotlight-2 {
            background: radial-gradient(circle, rgba(217,70,239,0.1) 0%, rgba(217,70,239,0) 70%);
            bottom: 10%;
            right: -100px;
          }

          /* HEADER - SOLID BLACK NAVBAR WITH INLINE LOGO */
          .landing-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            background-color: #000000;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
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
          .landing-brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            color: #FFFFFF;
            flex-shrink: 0;
          }
          .logo-icon-svg {
            color: #FFFFFF;
            flex-shrink: 0;
          }
          .logo-text {
            white-space: nowrap;
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
          .btn-signin {
            background: none;
            border: 1px solid #374151;
            color: #F9FAFB;
            padding: 8px 18px;
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
          .menu-toggle {
            display: none;
            background: none;
            border: none;
            color: #F9FAFB;
            cursor: pointer;
          }
          .mobile-nav {
            display: none;
            flex-direction: column;
            background-color: #000000;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            padding: 16px 40px;
            gap: 12px;
          }
          .mobile-nav a {
            color: #9CA3AF;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            padding: 6px 0;
          }

          /* HERO SECTION - SCREEN SIZED */
          .hero-section {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 120px 24px 80px 24px;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
          }
          .hero-grid {
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 48px;
            align-items: center;
            max-width: 1200px;
            width: 92%;
            margin: 0 auto;
            text-align: left;
          }
          .hero-text-side {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
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
            margin-bottom: 28px;
          }
          .sparkle {
            color: #818CF8;
          }
          .hero-title {
            font-size: 3.8rem;
            font-weight: 800;
            line-height: 1.12;
            letter-spacing: -0.04em;
            margin: 0 0 24px 0;
            color: #FFFFFF;
            text-align: left;
          }
          .text-gradient {
            background: linear-gradient(135deg, #FFFFFF 30%, #C7D2FE 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .hero-subtitle {
            font-size: 1.15rem;
            color: #9CA3AF;
            line-height: 1.6;
            margin: 0 0 40px 0;
            max-width: 580px;
            text-align: left;
          }
          .btn-primary-hero {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: #FFFFFF;
            color: #030712;
            border: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 255, 255, 0.15);
            transition: opacity 0.2s, transform 0.2s;
          }
          .btn-primary-hero:hover {
            opacity: 0.9;
            transform: translateY(-1px);
          }

          /* HERO VISUAL SIDE */
          .hero-visual-side {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 450px;
            width: 100%;
          }
          .visual-container {
            position: relative;
            width: 100%;
            height: 100%;
            perspective: 1000px;
          }

          /* BOOK CSS */
          .visual-book {
            width: 180px;
            height: 250px;
            background: linear-gradient(135deg, #0F172A 0%, #020617 100%);
            border: 1px solid #1E293B;
            border-radius: 12px;
            position: absolute;
            left: 20px;
            top: calc(50% - 125px);
            transform: rotateY(25deg) rotateX(10deg);
            box-shadow: -15px 25px 45px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.1);
            display: flex;
            box-sizing: border-box;
            z-index: 10;
          }
          .book-spine {
            width: 16px;
            background: linear-gradient(to right, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%);
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            border-right: 1px solid rgba(255,255,255,0.05);
          }
          .book-cover {
            flex: 1;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            position: relative;
          }
          .book-pdf-icon {
            background-color: #EF4444;
            color: #FFFFFF;
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            position: absolute;
            top: 15px;
            right: 15px;
          }
          .book-center-icon {
            color: #6366F1;
            margin-top: 24px;
            filter: drop-shadow(0 0 10px rgba(99,102,241,0.5));
          }
          .book-title {
            font-size: 0.8rem;
            font-weight: 600;
            color: #E2E8F0;
            text-align: center;
            margin-top: 12px;
          }
          .book-decoration-lines {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
            align-items: center;
            margin-top: auto;
          }
          .dec-line {
            height: 3px;
            width: 80%;
            background-color: #334155;
            border-radius: 2px;
          }
          .dec-line.short {
            width: 50%;
          }

          /* FLASHCARDS CSS */
          .visual-card {
            background-color: #FFFFFF;
            color: #1F2937;
            border: 1px solid #E5E7EB;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            position: absolute;
            box-sizing: border-box;
            z-index: 12;
            transition: all 0.3s ease;
          }
          .visual-card-glow {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border-radius: 12px;
            border: 1px solid rgba(99, 102, 241, 0.4);
            box-shadow: 0 0 20px rgba(99, 102, 241, 0.15);
            pointer-events: none;
          }
          .card-lbl-sim {
            font-size: 0.65rem;
            font-weight: 700;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          .card-lbl-sim.question {
            background-color: #EEF2F6;
            color: #4B5563;
          }
          .card-lbl-sim.answer {
            background-color: #ECFDF5;
            color: #065F46;
          }
          .card-txt-sim {
            font-size: 0.8rem;
            line-height: 1.4;
            font-weight: 500;
            margin: 0;
            color: #111827;
          }
          .card-btn-sim {
            display: inline-block;
            font-size: 0.68rem;
            font-weight: 600;
            color: #6366F1;
            margin-top: 10px;
            border-top: 1px solid #F3F4F6;
            padding-top: 6px;
            width: 100%;
          }
          .card-check-sim {
            color: #10B981;
            position: absolute;
            bottom: 12px;
            right: 12px;
          }

          /* Placement of visual elements */
          .visual-card-1 {
            width: 175px;
            right: 40px;
            top: 50px;
            transform: rotate(8deg);
            animation: float-v1 4.5s infinite ease-in-out;
          }
          .visual-card-2 {
            width: 185px;
            right: 20px;
            bottom: 70px;
            transform: rotate(-6deg);
            animation: float-v2 4.2s infinite ease-in-out;
          }
          .visual-card-3 {
            width: 155px;
            right: 180px;
            top: 190px;
            transform: rotate(-12deg);
            opacity: 0.85;
            animation: float-v3 4.8s infinite ease-in-out;
          }

          /* FLOW DUST/PARTICLES */
          .flow-lines-wrapper {
            position: absolute;
            left: 170px;
            right: 170px;
            top: 100px;
            bottom: 100px;
            z-index: 5;
            pointer-events: none;
          }
          .flow-path-svg {
            width: 100%;
            height: 100%;
            opacity: 0.7;
          }
          .flow-particle {
            width: 6px;
            height: 6px;
            background: linear-gradient(135deg, #6366F1 0%, #D946EF 100%);
            border-radius: 50%;
            position: absolute;
            box-shadow: 0 0 10px #6366F1;
          }
          .flow-particle.dot-1 {
            animation: flow-particle-ani 2.8s infinite linear;
          }
          .flow-particle.dot-2 {
            animation: flow-particle-ani2 3.2s infinite linear;
            animation-delay: 0.9s;
          }
          .flow-particle.dot-3 {
            animation: flow-particle-ani 3s infinite linear;
            animation-delay: 1.8s;
          }

          /* Animations */
          @keyframes float-v1 {
            0%, 100% { transform: translateY(0) rotate(8deg); }
            50% { transform: translateY(-10px) rotate(9deg); }
          }
          @keyframes float-v2 {
            0%, 100% { transform: translateY(0) rotate(-6deg); }
            50% { transform: translateY(12px) rotate(-4deg); }
          }
          @keyframes float-v3 {
            0%, 100% { transform: translateY(0) rotate(-12deg); }
            50% { transform: translateY(-8px) rotate(-14deg); }
          }

          @keyframes flow-particle-ani {
            0% {
              left: 0%;
              top: 50%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: 90%;
              top: 30%;
              opacity: 0;
            }
          }

          @keyframes flow-particle-ani2 {
            0% {
              left: 0%;
              top: 60%;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: 90%;
              top: 70%;
              opacity: 0;
            }
          }

          .scroll-explorer {
            position: absolute;
            bottom: 32px;
            left: 50%;
            transform: translateX(-50%);
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: #6B7280;
            text-decoration: none;
            font-size: 0.76rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            transition: color 0.2s, opacity 0.3s;
            z-index: 20;
          }
          .scroll-explorer:hover {
            color: #FFFFFF;
          }
          .scroll-arrow {
            animation: bounce 1.5s infinite;
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(4px); }
          }
          .animate-fade-in {
            animation: fadeIn 0.4s ease forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          /* SANDBOX PLAYGROUND PREVIEW - SCREEN SIZED & CENTERED */
          .sandbox-section {
            min-height: 100vh;
            padding: 100px 24px;
            max-width: 1200px;
            margin: 0 auto;
            width: 92%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .section-header-compact {
            text-align: center;
            margin-bottom: 40px;
          }
          .section-header-compact h2 {
            font-size: 2.4rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            margin: 0 0 10px 0;
            color: #FFFFFF;
          }
          .section-header-compact p {
            font-size: 1.05rem;
            color: #9CA3AF;
            margin: 0;
          }
          
          /* MAC WINDOW WRAPPER */
          .mac-window-wrapper {
            background-color: #1F2937;
            border: 1px solid #374151;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 30px 80px -10px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
          }
          .mac-title-bar {
            background-color: #111827;
            border-bottom: 1px solid #1F2937;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            position: relative;
          }
          .mac-dots {
            display: flex;
            gap: 6px;
            z-index: 10;
          }
          .mac-dot-btn {
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }
          .mac-dot-btn.red { background-color: #EF4444; }
          .mac-dot-btn.yellow { background-color: #F59E0B; }
          .mac-dot-btn.green { background-color: #10B981; }
          .mac-title-text {
            position: absolute;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 0.72rem;
            color: #9CA3AF;
            font-weight: 500;
          }

          .sandbox-wrapper {
            background-color: #FFFFFF;
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
            min-height: 380px;
            background-color: #FFFFFF;
          }

          /* SANDBOX CHAT VIEW */
          .sandbox-chat-view {
            display: grid;
            grid-template-columns: 260px 1fr;
            min-height: 380px;
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
          .chat-message.system-bubble {
            background-color: #F9FAFB;
            border: 1px dashed #E5E7EB;
            color: #9CA3AF;
            align-self: center;
            font-size: 0.76rem;
            padding: 6px 12px;
            border-radius: 6px;
            max-width: 100%;
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
            color: #111827;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .simulated-input-text {
            border-right: 2px solid #111827;
            animation: caret-blink 0.8s steps(1) infinite;
            padding-right: 2px;
            font-weight: 500;
          }
          @keyframes caret-blink {
            50% { border-color: transparent; }
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
          
          /* Typing dots animation */
          .typing-dots {
            display: flex;
            gap: 4px;
            padding: 12px 18px;
            align-items: center;
            background-color: #FFFFFF;
            border: 1px solid #E5E7EB;
            align-self: flex-start;
          }
          .typing-dots .dot {
            width: 6px;
            height: 6px;
            background-color: #9CA3AF;
            border-radius: 50%;
            animation: typing-dot-bounce 1.4s infinite ease-in-out both;
          }
          .typing-dots .dot:nth-child(1) { animation-delay: -0.32s; }
          .typing-dots .dot:nth-child(2) { animation-delay: -0.16s; }
          @keyframes typing-dot-bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1.0); }
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

          /* FEATURES SECTION - SCREEN SIZED & SPACIOUS */
          .features-section {
            min-height: 100vh;
            padding: 100px 24px;
            max-width: 1200px;
            margin: 0 auto;
            width: 92%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .section-header {
            text-align: center;
            margin-bottom: 60px;
          }
          .section-header h2 {
            font-size: 2.6rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            margin: 0 0 12px 0;
            color: #FFFFFF;
          }
          .section-header p {
            font-size: 1.1rem;
            color: #9CA3AF;
            margin: 0 auto;
            max-width: 500px;
          }
          .features-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
          }
          .feature-card {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 16px;
            padding: 40px;
            transition: border-color 0.2s, transform 0.2s;
          }
          .feature-card:hover {
            border-color: #374151;
            transform: translateY(-2px);
          }
          .feature-icon {
            width: 48px;
            height: 48px;
            background-color: #111827;
            border: 1px solid #1F2937;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            margin-bottom: 24px;
          }
          .feature-card h3 {
            font-size: 1.3rem;
            font-weight: 700;
            margin: 0 0 12px 0;
            color: #FFFFFF;
          }
          .feature-card p {
            font-size: 0.95rem;
            color: #9CA3AF;
            line-height: 1.6;
            margin: 0 0 20px 0;
          }
          .card-bullets {
            margin: 0;
            padding-left: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .card-bullets li {
            font-size: 0.85rem;
            color: #6B7280;
            font-weight: 500;
          }

          /* TECH SECTION - SCREEN SIZED & SPACIOUS */
          .tech-section {
            min-height: 100vh;
            padding: 100px 24px;
            max-width: 1200px;
            margin: 0 auto;
            width: 92%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .tech-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
          .tech-card {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 16px;
            padding: 32px;
            transition: border-color 0.2s, transform 0.2s;
            display: flex;
            flex-direction: column;
            min-height: 250px;
          }
          .tech-card:hover {
            border-color: #374151;
            transform: translateY(-2px);
          }
          .tech-icon {
            width: 44px;
            height: 44px;
            background-color: #111827;
            border: 1px solid #1F2937;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #FFFFFF;
            margin-bottom: 20px;
          }
          .tech-card h4 {
            font-size: 1.15rem;
            font-weight: 700;
            margin: 0 0 10px 0;
            color: #FFFFFF;
          }
          .tech-card p {
            font-size: 0.9rem;
            color: #9CA3AF;
            line-height: 1.55;
            margin: 0 0 16px 0;
            flex: 1;
          }
          .tech-specs-sub {
            font-size: 0.8rem;
            color: #4B5563;
            font-weight: 500;
            border-top: 1px solid rgba(255, 255, 255, 0.04);
            padding-top: 12px;
            margin-top: auto;
          }

          /* USAGE MATRIX & FAQS SECTION - SCREEN SIZED & DENSE GRID */
          .usage-section {
            min-height: 100vh;
            padding: 100px 24px;
            max-width: 1200px;
            margin: 0 auto;
            width: 92%;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }
          .quota-faq-container {
            display: grid;
            grid-template-columns: 1.2fr 1.8fr;
            gap: 40px;
            align-items: start;
          }
          .quota-table-box {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 16px;
            padding: 30px;
          }
          .quota-table-box h3 {
            font-size: 1.1rem;
            font-weight: 700;
            margin: 0 0 20px 0;
            color: #FFFFFF;
          }
          .quota-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 0.82rem;
          }
          .quota-row:last-child {
            border-bottom: none;
          }
          .quota-label {
            color: #9CA3AF;
            font-weight: 500;
          }
          .quota-val {
            color: #F9FAFB;
            font-weight: 600;
          }
          
          .faq-accordions {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .faq-item {
            background-color: #0B0F19;
            border: 1px solid #1F2937;
            border-radius: 12px;
            padding: 20px 24px;
          }
          .faq-item h5 {
            font-size: 0.9rem;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: #FFFFFF;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .faq-item p {
            font-size: 0.8rem;
            color: #9CA3AF;
            line-height: 1.5;
            margin: 0;
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

          /* FOOTER STYLING */
          .landing-footer {
            border-top: 1px solid #111827;
            background-color: #000000;
            padding: 80px 40px 40px 40px;
            position: relative;
            z-index: 10;
          }
          .footer-grid-wrapper {
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1.2fr 1.8fr;
            gap: 40px;
            margin-bottom: 60px;
          }
          .footer-col {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .brand-col .landing-brand-logo {
            margin-bottom: 4px;
          }
          .brand-description {
            font-size: 0.85rem;
            color: #9CA3AF;
            line-height: 1.6;
            margin: 0;
          }
          .footer-col h4 {
            font-size: 0.9rem;
            font-weight: 700;
            color: #FFFFFF;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0;
          }
          .footer-col-links {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .footer-col-links a {
            color: #9CA3AF;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: color 0.2s;
          }
          .footer-col-links a:hover {
            color: #FFFFFF;
          }
          .footer-col-links span {
            color: #6B7280;
            font-size: 0.85rem;
            font-weight: 500;
          }
          .developer-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            color: #FFFFFF;
          }
          .heart-icon {
            color: #EF4444;
            fill: #EF4444;
            animation: pulse-heart 1.2s infinite alternate;
          }
          @keyframes pulse-heart {
            0% { transform: scale(1); }
            100% { transform: scale(1.15); }
          }
          .rich-social-links {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }
          .rich-social-links a {
            display: flex;
            align-items: center;
            gap: 10px;
            color: #9CA3AF;
            text-decoration: none;
            font-size: 0.85rem;
            font-weight: 500;
            transition: color 0.2s;
          }
          .rich-social-links a:hover {
            color: #FFFFFF;
          }
          .social-icon {
            flex-shrink: 0;
            transition: color 0.2s;
          }
          .footer-bottom-bar {
            border-top: 1px solid #111827;
            padding-top: 30px;
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            text-align: center;
          }
          .footer-bottom-bar p {
            font-size: 0.8rem;
            color: #4B5563;
            margin: 0;
          }

          /* RESPONSIVENESS AND MOBILE FIXES */
          @media (max-width: 900px) {
            .landing-header {
              padding: 10px 0;
            }
            .header-inner {
              padding: 12px 24px;
            }
            .nav-links {
              display: none; /* Hide desktop links */
            }
            .menu-toggle {
              display: block; /* Show hamburger button */
            }
            .mobile-nav {
              display: flex;
            }
            .hero-section {
              padding-top: 100px;
              min-height: auto;
            }
            .hero-grid {
              grid-template-columns: 1fr;
              text-align: center;
              gap: 40px;
            }
            .hero-text-side {
              align-items: center;
              text-align: center;
            }
            .hero-title {
              font-size: 2.4rem;
              line-height: 1.2;
              text-align: center;
            }
            .hero-subtitle {
              font-size: 0.95rem;
              text-align: center;
              margin: 0 0 24px 0;
            }
            .hero-visual-side {
              height: 380px;
            }
            .visual-book {
              left: 5%;
              width: 140px;
              height: 200px;
              top: calc(50% - 100px);
            }
            .visual-card-1 {
              right: 5%;
              width: 145px;
              top: 40px;
            }
            .visual-card-2 {
              right: 2%;
              width: 145px;
              bottom: 40px;
            }
            .visual-card-3 {
              right: 40%;
              width: 120px;
              top: 150px;
            }
            .flow-lines-wrapper {
              left: 120px;
              right: 120px;
            }
            .sandbox-section, .features-section, .tech-section, .usage-section {
              padding: 60px 24px;
              min-height: auto; /* Allow auto height on small devices */
              width: 100%;
            }
            .sandbox-chat-view {
              grid-template-columns: 1fr;
            }
            .sandbox-sidebar {
              display: none;
            }
            .sandbox-options-sim {
              grid-template-columns: 1fr;
            }
            .flash-card-sim {
              width: 100%;
              min-height: auto;
            }
            .features-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .tech-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .quota-faq-container {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .landing-footer {
              padding: 60px 24px 30px 24px;
            }
            .footer-grid-wrapper {
              grid-template-columns: 1fr;
              gap: 32px;
              margin-bottom: 40px;
            }
            .footer-col {
              gap: 12px;
            }
            .footer-content {
              flex-direction: column;
              text-align: center;
            }
          }
        `}</style>
      </div>
    );
  }

  // 3. Workspace Dashboard
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-brand-logo">
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
        .dashboard-brand-logo {
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
