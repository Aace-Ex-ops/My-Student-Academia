import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MenuVertical } from './components/ui/menu-vertical';
import { Topbar } from './components/Topbar';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CatalogPage } from './pages/CatalogPage';
import { CourseRegistrationPage } from './pages/CourseRegistrationPage';
import { PerformancePage } from './pages/PerformancePage';
import { InstructorPage } from './pages/InstructorPage';
import { FacultyChatPage } from './pages/FacultyChatPage';
import { QuizzesPage } from './pages/QuizzesPage';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { PortalAuthPage } from './pages/PortalAuthPage';
import { AdminPage } from './pages/AdminPage';
import { User, OnboardingData } from './types';
import { apiFetch } from './lib/api';
import { bruteForcePurgeAllUserData } from './lib/accountPurge';

export function AppContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('msa_custom_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });
  const navigate = useNavigate();
  const location = useLocation();

  // ✦ INSTANT SCROLL-TO-TOP ON ROUTE CHANGE ✦
  // Prevents scroll offset disorientation when switching between Dashboard, Catalog, Chat, etc.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [location.pathname]);

  useEffect(() => {
    // ✦ MANUAL URL PURGE TRIGGER (ONLY FIRED IF EXPLICITLY REQUESTED VIA URL) ✦
    // Allows explicit wipe via: https://my-student-academia.pages.dev/?action=wipe-account
    const params = new URLSearchParams(window.location.search);
    if (
      params.get('action') === 'wipe-account' ||
      params.get('action') === 'purge' ||
      params.get('reset') === 'true' ||
      params.get('clear') === 'true'
    ) {
      bruteForcePurgeAllUserData(undefined, true).then(() => {
        setCurrentUser(null);
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/auth?purged=true', { replace: true });
      });
      return;
    }

    fetchUsers();
  }, [location.search, navigate]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json);
      }
    } catch (err) {
      console.warn('Users fetch notice:', err);
    }
  };

  const handleSwitchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('msa_custom_user_profile', JSON.stringify(found));
      if (found.role === 'INSTRUCTOR') {
        navigate('/instructor');
      } else if (found.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleCompleteOnboarding = (data: OnboardingData) => {
    const base = currentUser || { id: `user-${Date.now()}`, name: data.name || "Student", email: data.email || "" };
    const targetEmail = (data.email || base.email || "").trim().toLowerCase();
    const updatedUser: User = {
      ...base,
      ...data,
      name: data.name || base.name,
      email: targetEmail,
      username: data.username || base.username,
      phone: data.phone || base.phone,
      avatar: data.avatar,
      avatarIcon: data.avatarIcon,
      avatarUrl: data.avatarUrl || base.avatarUrl || base.googlePhotoUrl,
      googlePhotoUrl: data.avatarUrl || base.googlePhotoUrl,
      avatarBg: data.avatarBg,
      university: data.university,
      major: data.major,
      educationLevel: data.educationLevel,
      careerInterest: data.careerInterest,
      gradYear: data.gradYear,
      plan: data.plan,
      paymentStatus: data.paymentStatus,
      onboardingCompleted: true,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('msa_custom_user_profile', JSON.stringify(updatedUser));

    try {
      const rawReg = localStorage.getItem('msa_registered_accounts_registry');
      let reg = rawReg ? JSON.parse(rawReg) : {};
      
      // Fix: If legacy data was an array, reset it.
      if (Array.isArray(reg)) {
        reg = {};
      }
      
      if (targetEmail) {
        reg[targetEmail] = updatedUser;
        localStorage.setItem('msa_registered_accounts_registry', JSON.stringify(reg));
      }
    } catch (e) {}

    // Persist to backend database
    apiFetch('/api/auth/update-profile', {
      method: 'POST',
      body: JSON.stringify(updatedUser),
    }).catch((e) => console.warn('Backend update profile notice:', e));
  };

  const showLayoutHeaders =
    location.pathname !== '/' &&
    location.pathname !== '/auth' &&
    location.pathname !== '/onboarding' &&
    location.pathname !== '/portal-login';
  const isAIAssistant = location.pathname === '/ai-assistant';

  return (
    <div
      className={`bg-[#0B0A09] text-[#FAF3E1] flex font-sans select-none ${
        isAIAssistant ? "h-screen h-[100dvh] overflow-hidden" : "min-h-screen"
      }`}
    >
      {showLayoutHeaders && (
        <MenuVertical
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          users={users}
        />
      )}
      <main
        className={`flex-1 min-w-0 flex flex-col bg-[#0B0A09] ${
          isAIAssistant ? "h-full min-h-0 overflow-hidden" : "overflow-y-auto"
        }`}
      >
        {showLayoutHeaders && (
          <Topbar
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            users={users}
          />
        )}
        <div className={`flex-1 min-w-0 ${isAIAssistant ? "min-h-0 flex flex-col overflow-hidden" : ""}`}>
          <Routes>
            <Route path="/" element={<LandingPage onLoginClick={() => navigate('/auth')} />} />
            <Route path="/auth" element={<AuthPage currentUser={currentUser || undefined} onLoginUser={(user: User) => setCurrentUser(user)} users={users} />} />
            <Route path="/portal-login" element={<PortalAuthPage currentUser={currentUser} onLoginUser={(user: User) => setCurrentUser(user)} />} />
            <Route path="/onboarding" element={<OnboardingPage currentUser={currentUser || undefined} onCompleteOnboarding={handleCompleteOnboarding} />} />
            <Route path="/dashboard" element={<StudentDashboard currentUser={currentUser} />} />
            <Route path="/catalog" element={<CatalogPage currentUser={currentUser} />} />
            <Route path="/register-course" element={<CourseRegistrationPage currentUser={currentUser} />} />
            <Route path="/performance" element={<PerformancePage currentUser={currentUser} />} />
            <Route path="/instructor" element={<InstructorPage currentUser={currentUser} />} />
            <Route path="/messages" element={<FacultyChatPage currentUser={currentUser} />} />
            <Route path="/quizzes" element={<QuizzesPage currentUser={currentUser} />} />
            <Route path="/ai-assistant" element={<AIAssistantPage currentUser={currentUser} />} />
            <Route path="/admin" element={<AdminPage currentUser={currentUser} />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
