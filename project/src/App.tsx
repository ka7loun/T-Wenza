import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import About from './pages/About';
import Features from './pages/Features';
import Career from './pages/Career';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/Profile';
import Network from './pages/Network';
import Notifications from './pages/Notifications';
import CoursePage from './pages/learning/CoursePage';
import PersonalizedLearning from './pages/learning/PersonalizedLearning';
import Videos from './pages/learning/formats/Videos';
import Flashcards from './pages/learning/formats/Flashcards';
import Summaries from './pages/learning/formats/Summaries';
import PDFs from './pages/learning/formats/PDFs';
import Audio from './pages/learning/formats/Audio';
import Quizzes from './pages/learning/formats/Quizzes';
import Footer from './components/Footer';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  // Protected Route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
      );
    }
    
    if (!session) {
      return <Navigate to="/auth" replace />;
    }
    
    return <>{children}</>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/career" element={<Career />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/course/:id"
            element={
              <ProtectedRoute>
                <CoursePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning"
            element={
              <ProtectedRoute>
                <PersonalizedLearning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/videos"
            element={
              <ProtectedRoute>
                <Videos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/flashcards"
            element={
              <ProtectedRoute>
                <Flashcards />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/summaries"
            element={
              <ProtectedRoute>
                <Summaries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/pdfs"
            element={
              <ProtectedRoute>
                <PDFs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/audio"
            element={
              <ProtectedRoute>
                <Audio />
              </ProtectedRoute>
            }
          />
          <Route
            path="/learning/quizzes"
            element={
              <ProtectedRoute>
                <Quizzes />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
        
        {/* AI Assistant - Only show for authenticated users */}
        {session && <AIAssistant />}
      </div>
    </Router>
  );
}

export default App;