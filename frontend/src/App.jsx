import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import TeamPage from './pages/TeamPage';
import MemberPortfolioPage from './pages/MemberPortfolioPage';
import ContactPage from './pages/ContactPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProjectNotAvailablePage from './pages/ProjectNotAvailablePage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// 404 NotFound Page
function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5 py-32 space-y-4">
      <span className="font-mono text-xs text-amber px-3 py-1 rounded-full bg-amber/10 border border-amber/30">
        // 404 — PAGE NOT FOUND
      </span>
      <h1 className="font-display text-4xl sm:text-6xl font-bold text-text">
        Resource Not Found
      </h1>
      <p className="text-sm text-muted max-w-md">
        The requested path does not exist on this agency server.
      </p>
      <Link
        to="/"
        className="px-5 py-2.5 rounded-lg bg-amber text-ink font-mono text-xs font-semibold hover:bg-amber/90 transition-all"
      >
        return_home()
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-ink text-text flex flex-col relative selection:bg-amber/30 selection:text-text overflow-x-clip max-w-full">
      {/* Background Dot-Grid Overlay */}
      <div className="dot-grid fixed inset-0 pointer-events-none opacity-20 z-0" />

      <ScrollToTop />
      <Navbar />

      <main className="flex-1 relative z-10 w-full min-w-0 max-w-full overflow-x-clip">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/team/:slug" element={<MemberPortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/not-available" element={<ProjectNotAvailablePage />} />
          <Route path="/404" element={<ProjectNotAvailablePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
