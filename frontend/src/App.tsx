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
import { AdminPage } from './pages/AdminPage';
import { User, OnboardingData } from './types';

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

  useEffect(() => {
    fetchUsers();
  }, []);

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
    const updatedUser: User = {
      ...base,
      ...data,
      name: data.name || base.name,
      email: data.email || base.email,
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
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('msa_custom_user_profile', JSON.stringify(updatedUser));

    try {
      const rawReg = localStorage.getItem('msa_registered_accounts_registry');
      const reg = rawReg ? JSON.parse(rawReg) : {};
      reg[updatedUser.email.toLowerCase()] = updatedUser;
      localStorage.setItem('msa_registered_accounts_registry', JSON.stringify(reg));
    } catch (e) {}
  };

  const showLayoutHeaders = location.pathname !== '/' && location.pathname !== '/auth' && location.pathname !== '/onboarding';

  return (
    <div className="min-h-screen bg-[#0B0A09] text-[#FAF3E1] flex font-sans select-none">
      {showLayoutHeaders && (
        <MenuVertical
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          users={users}
        />
      )}
      <main className="flex-1 min-w-0 overflow-y-auto flex flex-col bg-[#0B0A09]">
        {showLayoutHeaders && (
          <Topbar
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            users={users}
          />
        )}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage onLoginClick={() => navigate('/auth')} />} />
            <Route path="/auth" element={<AuthPage currentUser={currentUser || undefined} onLoginUser={(user: User) => setCurrentUser(user)} users={users} />} />
            <Route path="/onboarding" element={<OnboardingPage currentUser={currentUser || undefined} onCompleteOnboarding={handleCompleteOnboarding} />} />
            <Route path="/dashboard" element={<StudentDashboard currentUser={currentUser} />} />
            <Route path="/catalog" element={<CatalogPage currentUser={currentUser} />} />
            <Route path="/register-course" element={<CourseRegistrationPage currentUser={currentUser} />} />
            <Route path="/performance" element={<PerformancePage currentUser={currentUser} />} />
            <Route path="/instructor" element={<InstructorPage currentUser={currentUser} />} />
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
