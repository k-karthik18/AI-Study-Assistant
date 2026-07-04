import React, { useState, useEffect } from 'react';
import { GraduationCap, LogOut, Loader2, Sparkles, BookOpen, Settings } from 'lucide-react';
import axios from 'axios';
import { SignIn, UserButton, useUser, SignOutButton } from '@clerk/clerk-react';

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
            background-color: #0F172A;
            color: #E2E8F0;
            gap: 16px;
            font-family: sans-serif;
          }
          .spinner {
            animation: spin 1.5s linear infinite;
            color: #6366F1;
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

        <div className="auth-card-container">
          <div className="auth-presentation-card">
            <div className="brand-logo large-logo">
              <GraduationCap size={32} />
            </div>
            <h1 className="auth-title">StudyFlow AI</h1>
            <p className="auth-subtitle">Active Research & Study Workspace</p>

            <div className="feature-bullets">
              <div className="bullet">
                <Sparkles size={16} />
                <span>Interact with multi-format textbook materials</span>
              </div>
              <div className="bullet">
                <BookOpen size={16} />
                <span>Automated practice quizzes & study flashcards</span>
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
            background-color: #0B0F19;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: sans-serif;
          }
          .auth-bg-shape {
            position: absolute;
            border-radius: 50%;
            filter: blur(120px);
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
            background: linear-gradient(135deg, #EC4899, #F43F5E);
            bottom: -120px;
            right: -80px;
          }
          .auth-card-container {
            position: relative;
            z-index: 5;
            display: grid;
            grid-template-columns: 1fr 1fr;
            max-width: 850px;
            background: rgba(17, 24, 39, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(16px);
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }
          .auth-presentation-card {
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            border-right: 1px solid rgba(255, 255, 255, 0.06);
          }
          .large-logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            margin-bottom: 24px;
          }
          .auth-title {
            font-size: 2.2rem;
            font-weight: 800;
            color: #FFFFFF;
            margin: 0 0 8px 0;
            letter-spacing: -0.03em;
          }
          .auth-subtitle {
            font-size: 0.9rem;
            color: #818CF8;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin: 0 0 32px 0;
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
            color: #9CA3AF;
          }
          .bullet svg {
            color: #818CF8;
            flex-shrink: 0;
          }
          .auth-clerk-widget {
            padding: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(10, 15, 30, 0.5);
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

  // 3. Authenticated Dashboard Placeholder
  return (
    <div className="app-container">
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">
            <GraduationCap size={20} />
          </div>
          <span className="brand-name">StudyFlow AI</span>
          <span className="brand-badge">SaaS Concept</span>
        </div>

        <div className="user-profile-badge">
          <span className="user-welcome-text">Hi, {userFullName}</span>
          {isClerkEnabled ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="mock-avatar">S</div>
          )}
        </div>
      </header>

      <main className="dashboard-placeholder">
        <div className="placeholder-card">
          <div className="icon-wrapper">
            <Sparkles size={36} />
          </div>
          <h2>Welcome to StudyFlow AI</h2>
          <p>
            Your account is authenticated successfully. The interactive workspace, document library, and advanced RAG features are currently undergoing pivot redesign and will be implemented in the next phases.
          </p>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>API Server: {backendStatus.toUpperCase()}</span>
          </div>

          {!isClerkEnabled && (
            <div className="mock-signout-btn">
              <button onClick={() => alert("Mock sign out successful")}>
                <LogOut size={16} />
                <span>Mock Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <style>{`
        .app-container {
          min-height: 100vh;
          background-color: #090D16;
          color: #F3F4F6;
          display: flex;
          flex-direction: column;
          font-family: sans-serif;
        }
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 32px;
          background: rgba(17, 24, 39, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
        }
        .brand-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-logo {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .brand-name {
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
        }
        .brand-badge {
          background: rgba(99, 102, 241, 0.15);
          color: #818CF8;
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
        }
        .user-profile-badge {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-welcome-text {
          font-size: 0.85rem;
          font-weight: 500;
          color: #9CA3AF;
        }
        .mock-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #4F46E5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .dashboard-placeholder {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }
        .placeholder-card {
          max-width: 500px;
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        .icon-wrapper {
          width: 72px;
          height: 72px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #818CF8;
          margin-bottom: 24px;
        }
        .placeholder-card h2 {
          font-size: 1.5rem;
          margin: 0 0 12px 0;
          font-weight: 700;
        }
        .placeholder-card p {
          font-size: 0.9rem;
          color: #9CA3AF;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #D1D5DB;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: ${backendStatus === 'online' ? '#10B981' : '#EF4444'};
          box-shadow: 0 0 8px ${backendStatus === 'online' ? '#10B981' : '#EF4444'};
        }
        .mock-signout-btn {
          margin-top: 24px;
        }
        .mock-signout-btn button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.4);
          color: #F87171;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          transition: background 0.2s;
        }
        .mock-signout-btn button:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
}
