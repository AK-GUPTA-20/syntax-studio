import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Menu, X, ArrowUpRight, ShieldCheck, User } from 'lucide-react';
import { getSettings } from '../api/client';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState(null);
  const location = useLocation();

  useEffect(() => {
    getSettings().then(setSettings).catch(() => null);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Work', path: '/projects' },
    { name: 'Services', path: '/services' },
    { name: 'About', path: '/about' },
    { name: 'Team', path: '/team' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink/90 backdrop-blur-md border-b border-border shadow-2xl shadow-black/50 py-3.5'
          : 'bg-ink/60 backdrop-blur-sm border-b border-border/60 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 font-mono text-base tracking-tight hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-surface2 border border-border flex items-center justify-center text-amber shadow-sm">
            <Terminal size={17} />
          </div>
          <span className="font-display font-bold text-lg text-text">
            {settings?.companyName ? (
              settings.companyName
            ) : (
              <>syntax<span className="text-amber">.studio</span></>
            )}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-cyan bg-cyan/10 border border-cyan/30 rounded-full ml-1">
            {settings?.brandSubtitle || '2-person agency'}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`link-underline text-sm font-mono tracking-wide transition-colors ${
                  isActive ? 'text-amber font-semibold' : 'text-muted hover:text-text'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {/* Quick links to personal portfolios */}
          <div className="flex items-center gap-2 pl-2 border-l border-border text-xs font-mono">
            <Link
              to="/team/akshat-gupta"
              className="text-muted hover:text-cyan transition-colors px-2 py-1 rounded hover:bg-surface2"
              title="Akshat Gupta's Personal Portfolio"
            >
              ~akshat
            </Link>
            <span className="text-border">/</span>
            <Link
              to="/team/vasu-singhal"
              className="text-muted hover:text-cyan transition-colors px-2 py-1 rounded hover:bg-surface2"
              title="Vasu Singhal's Personal Portfolio"
            >
              ~vasu
            </Link>
          </div>
        </nav>

        {/* CTA & Admin Links */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/admin"
            className="p-2 rounded-lg border border-border bg-surface hover:border-amber/40 hover:text-amber text-muted transition-colors"
            title="Admin Portal"
            aria-label="Admin Portal"
          >
            <ShieldCheck size={16} />
          </Link>
          <Link
            to="/contact"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm active:scale-95"
          >
            Start a Project
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/admin"
            className="p-2 rounded-lg border border-border bg-surface text-muted"
            aria-label="Admin Portal"
          >
            <ShieldCheck size={16} />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg border border-border bg-surface text-text hover:bg-surface2"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-ink/95 backdrop-blur-xl px-6 py-5 space-y-4 animate-fadeIn">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center justify-between py-2.5 font-mono text-sm border-b border-border/40 text-muted hover:text-amber"
              >
                <span>{link.name}</span>
                <span className="text-xs text-border">→</span>
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-xs font-mono text-cyan mb-2">// Co-Founders Portfolios</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <Link
                to="/team/akshat-gupta"
                className="p-2.5 rounded-lg border border-border bg-surface flex items-center justify-between text-muted hover:text-text"
              >
                <span>Akshat Gupta</span>
                <span className="text-amber">↗</span>
              </Link>
              <Link
                to="/team/vasu-singhal"
                className="p-2.5 rounded-lg border border-border bg-surface flex items-center justify-between text-muted hover:text-text"
              >
                <span>Vasu Singhal</span>
                <span className="text-amber">↗</span>
              </Link>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/contact"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-mono font-semibold bg-amber text-ink"
            >
              Start a Project
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
