import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Mail,
  CheckCircle,
  Clock,
  Layers,
  Users,
  FileCode,
  ExternalLink,
  Save,
  X,
  Settings,
  Star,
  Globe,
  Upload,
  RefreshCw,
  Phone,
  AlertCircle,
  Tag,
  Menu,
  LayoutDashboard,
  DollarSign,
  Check,
  XCircle,
  ChevronUp,
  ChevronDown,
  GripVertical
} from 'lucide-react';
import {
  loginAdmin,
  verifyAdminToken,
  getInquiries,
  updateInquiry,
  deleteInquiry,
  getProjects,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
  getServices,
  createServiceApi,
  updateServiceApi,
  deleteServiceApi,
  getTeam,
  createTeamMemberApi,
  updateTeamMemberApi,
  deleteTeamMemberApi,
  getTestimonials,
  createTestimonialApi,
  updateTestimonialApi,
  deleteTestimonialApi,
  getSettings,
  updateSettingsApi
} from '../api/client';
import ImageUploader from '../components/ImageUploader';
import StudioSettingsManager from '../components/StudioSettingsManager';
import { sanitizeUrl, SafeExternalLink, sanitizeInput } from '../utils/security';

export default function AdminDashboardPage() {
  const [token, setToken] = useState(() => localStorage.getItem('syntax_admin_token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Security: Brute-force protection lockout timer
  const [lockoutTimer, setLockoutTimer] = useState(() => {
    try {
      const lockoutUntil = sessionStorage.getItem('syntax_admin_lockout_until');
      if (lockoutUntil) {
        const remaining = Math.ceil((parseInt(lockoutUntil, 10) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    } catch (e) {}
    return 0;
  });

  // Layout states
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Custom Confirmation Dialog
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Data states
  const [inquiries, setInquiries] = useState([]);
  const [refreshingInquiries, setRefreshingInquiries] = useState(false);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [team, setTeam] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Modals & form state
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [techInput, setTechInput] = useState('');

  const [isEditingMember, setIsEditingMember] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);

  const [isEditingService, setIsEditingService] = useState(false);
  const [currentService, setCurrentService] = useState(null);

  const [isEditingTestimonial, setIsEditingTestimonial] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const confirmAction = (title, message, onConfirm) => {
    setConfirmDialog({ isOpen: true, title, message, onConfirm });
  };

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          try {
            sessionStorage.removeItem('syntax_admin_lockout_until');
          } catch (e) {}
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  // Handle global 401 / 403 auth expiration dispatched by api client
  useEffect(() => {
    const handleAuthExpired = () => {
      handleLogout('Session expired or unauthorized access detected. Please log in again.');
    };
    window.addEventListener('syntax-auth-expired', handleAuthExpired);
    return () => window.removeEventListener('syntax-auth-expired', handleAuthExpired);
  }, []);

  // 30-minute inactivity auto-logout for admin session security
  useEffect(() => {
    if (!isAuthenticated) return;
    const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
    let idleTimer = setTimeout(() => {
      handleLogout('Admin session timed out after 30 minutes of inactivity.');
    }, INACTIVITY_TIMEOUT_MS);

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        handleLogout('Admin session timed out after 30 minutes of inactivity.');
      }, INACTIVITY_TIMEOUT_MS);
    };

    const userEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    userEvents.forEach((ev) => window.addEventListener(ev, resetIdleTimer, { passive: true }));

    return () => {
      clearTimeout(idleTimer);
      userEvents.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
    };
  }, [isAuthenticated]);

  // Verify stored token on mount
  useEffect(() => {
    async function verify() {
      if (!token) return;
      try {
        await verifyAdminToken(token);
        setIsAuthenticated(true);
      } catch (err) {
        try {
          localStorage.removeItem('syntax_admin_token');
        } catch (e) {}
        setToken('');
        setIsAuthenticated(false);
      }
    }
    verify();
  }, [token]);

  // Load dashboard data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    loadAllData();
  }, [isAuthenticated]);

  async function loadAllData() {
    setLoadingData(true);
    try {
      const [inqData, projData, servData, teamData, testData, settData] = await Promise.all([
        getInquiries(token),
        getProjects(),
        getServices(),
        getTeam(),
        getTestimonials(),
        getSettings()
      ]);
      setInquiries(inqData || []);
      setProjects(projData || []);
      setServices(servData || []);
      setTeam(teamData || []);
      setTestimonials(testData || []);
      setSettings(settData || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      showToast('Error refreshing data');
    } finally {
      setLoadingData(false);
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await loginAdmin(password);
      const userToken = res.token || 'akshat0021';
      localStorage.setItem('syntax_admin_token', userToken);
      try {
        sessionStorage.removeItem('syntax_admin_failures');
        sessionStorage.removeItem('syntax_admin_lockout_until');
      } catch (e) {}
      setToken(userToken);
      setIsAuthenticated(true);
      setPassword('');
      showToast('Welcome back, Admin!');
    } catch (err) {
      let failures = 1;
      try {
        failures = (parseInt(sessionStorage.getItem('syntax_admin_failures') || '0', 10)) + 1;
        sessionStorage.setItem('syntax_admin_failures', failures.toString());
      } catch (e) {}

      if (failures >= 5) {
        const lockoutPeriod = 30; // 30 seconds cooldown
        const until = Date.now() + lockoutPeriod * 1000;
        try {
          sessionStorage.setItem('syntax_admin_lockout_until', until.toString());
        } catch (e) {}
        setLockoutTimer(lockoutPeriod);
        setAuthError(`Too many failed login attempts. Locked out for ${lockoutPeriod} seconds.`);
      } else {
        setAuthError(`${err.message || 'Incorrect admin password. Access denied.'} (${5 - failures} attempts remaining)`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = (reason = 'Logged out successfully') => {
    try {
      localStorage.removeItem('syntax_admin_token');
    } catch (e) {}
    setToken('');
    setIsAuthenticated(false);
    setInquiries([]);
    showToast(reason);
  };

  // Inquiry actions
  const handleRefreshInquiries = async () => {
    setRefreshingInquiries(true);
    try {
      const inqData = await getInquiries(token);
      setInquiries(inqData || []);
      showToast('Client inquiries refreshed from database');
    } catch (err) {
      showToast(err.message || 'Failed to refresh inquiries');
    } finally {
      setRefreshingInquiries(false);
    }
  };

  const handleInquiryStatus = async (id, status) => {
    try {
      await updateInquiry(id, { status }, token);
      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status } : inq))
      );
      showToast(`Inquiry marked as ${status}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status');
    }
  };

  const handleDeleteInquiry = (id) => {
    confirmAction('Delete Inquiry', 'Are you sure you want to delete this inquiry?', async () => {
      try {
        await deleteInquiry(id, token);
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        showToast('Inquiry removed');
      } catch (err) {
        showToast(err.message || 'Failed to delete inquiry');
      }
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
    });
  };

  // Project save & delete
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (currentProject.id) {
        await updateProjectApi(currentProject.id, currentProject, token);
        showToast('Project updated successfully');
      } else {
        await createProjectApi(currentProject, token);
        showToast('New project created successfully');
      }
      setIsEditingProject(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to save project');
    }
  };

  const handleDeleteProject = (id) => {
    confirmAction('Delete Project', 'Are you sure you want to delete this project?', async () => {
      try {
        await deleteProjectApi(id, token);
        setProjects((prev) => prev.filter((p) => p.id !== id));
        showToast('Project deleted');
      } catch (err) {
        showToast(err.message || 'Failed to delete project');
      }
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
    });
  };

  // Team Member save
  const handleSaveMember = async (e) => {
    e.preventDefault();
    try {
      if (currentMember.id) {
        await updateTeamMemberApi(currentMember.id, currentMember, token);
        showToast(`${currentMember.name} updated successfully`);
      } else {
        await createTeamMemberApi(currentMember, token);
        showToast('New team member added');
      }
      setIsEditingMember(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to update team profile');
    }
  };

  // Service save & delete
  const handleSaveService = async (e) => {
    e.preventDefault();
    try {
      if (currentService.id) {
        await updateServiceApi(currentService.id, currentService, token);
        showToast('Service updated successfully');
      } else {
        await createServiceApi(currentService, token);
        showToast('Service created successfully');
      }
      setIsEditingService(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to save service');
    }
  };

  const handleDeleteService = (id) => {
    confirmAction('Delete Service', 'Are you sure you want to delete this service?', async () => {
      try {
        await deleteServiceApi(id, token);
        setServices((prev) => prev.filter((s) => s.id !== id));
        showToast('Service deleted');
      } catch (err) {
        showToast(err.message || 'Failed to delete service');
      }
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
    });
  };

  // Testimonial save & delete
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      if (currentTestimonial.id) {
        await updateTestimonialApi(currentTestimonial.id, currentTestimonial, token);
        showToast('Testimonial updated');
      } else {
        await createTestimonialApi(currentTestimonial, token);
        showToast('Testimonial added');
      }
      setIsEditingTestimonial(false);
      loadAllData();
    } catch (err) {
      showToast(err.message || 'Failed to save testimonial');
    }
  };

  const handleDeleteTestimonial = (id) => {
    confirmAction('Delete Testimonial', 'Are you sure you want to delete this testimonial?', async () => {
      try {
        await deleteTestimonialApi(id, token);
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        showToast('Testimonial deleted');
      } catch (err) {
        showToast(err.message || 'Failed to delete testimonial');
      }
      setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null });
    });
  };

  // Settings save
  const handleSaveSettings = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSavingSettings(true);
    try {
      await updateSettingsApi(settings, token);
      showToast('Studio settings saved & published to database');
    } catch (err) {
      showToast(err.message || 'Failed to save studio settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const sidebarNav = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'services', label: 'Pricing & Services', icon: DollarSign, count: services.length },
    { id: 'projects', label: 'Projects', icon: Layers, count: projects.length },
    { id: 'team', label: 'Team Members', icon: Users, count: team.length },
    { id: 'testimonials', label: 'Testimonials', icon: Star, count: testimonials.length },
    { id: 'inquiries', label: 'Inquiries', icon: Mail, count: inquiries.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Login view if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="relative pt-40 pb-28 max-w-md mx-auto px-4 sm:px-0 overflow-x-clip min-h-screen">
        <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber/10 border border-amber/30 flex items-center justify-center text-amber mb-3">
              <ShieldCheck size={26} />
            </div>
            <h1 className="font-display text-2xl font-bold text-text">
              Admin Authentication
            </h1>
            <p className="text-xs font-mono text-muted mt-1">
              Protected Studio Console • /admin
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-cyan mb-1.5">
                ENTER ADMIN PASSWORD
              </label>
              <input
                type="password"
                required
                disabled={lockoutTimer > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={lockoutTimer > 0 ? `Locked out (${lockoutTimer}s)` : '••••••••'}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface2 border border-border text-sm text-text focus:border-amber transition-colors font-mono disabled:opacity-50"
              />
            </div>

            {lockoutTimer > 0 && (
              <div className="p-2.5 rounded-lg bg-red/10 border border-red/30 text-red text-xs font-mono flex items-center gap-2">
                <AlertCircle size={14} />
                <span>Security lockout active: Retry in {lockoutTimer}s</span>
              </div>
            )}

            {authError && (
              <p className="text-xs font-mono text-red">{authError}</p>
            )}

            <button
              type="submit"
              disabled={authLoading || lockoutTimer > 0}
              className="w-full py-2.5 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Lock size={14} />
              <span>
                {authLoading
                  ? 'verifying()...'
                  : lockoutTimer > 0
                  ? `locked_out(${lockoutTimer}s)`
                  : 'login_admin()'}
              </span>
            </button>
          </form>
          <div className="mt-4 pt-4 border-t border-border/60 text-center">
            <p className="text-[11px] font-mono text-muted flex items-center justify-center gap-1">
              <ShieldCheck size={12} className="text-cyan" /> Secure studio console • End-to-end token authenticated
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-24 pb-24 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 overflow-x-clip min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[110] px-4 py-2.5 rounded-lg bg-surface border border-amber text-amber text-xs font-mono shadow-2xl animate-fadeSlideDown">
          {toastMessage}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="bg-surface border border-border p-6 rounded-2xl max-w-sm w-full shadow-2xl">
            <h3 className="font-display font-bold text-lg text-text mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-muted mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, title: '', message: '', onConfirm: null })}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-surface2 text-muted hover:text-text transition-colors active:scale-95"
              >
                cancel()
              </button>
              <button 
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-red text-ink font-bold hover:bg-red/90 transition-colors active:scale-95"
              >
                confirm()
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-border">
        <div className="flex items-start gap-4 w-full sm:w-auto">
          <button 
            className="md:hidden mt-1 p-2 rounded-lg bg-surface border border-border text-text active:scale-95 transition-transform"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={20} />
          </button>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-green/30 bg-green/10 text-green font-mono text-xs mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span>
              Authenticated as Studio Admin
            </div>
            <h1 className="font-display text-3xl font-bold text-text">
              Studio Management Console
            </h1>
            <p className="text-xs font-mono text-muted mt-1">
              ImageKit CDN Connected • Local & Cloud Firestore Persistent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={loadAllData}
            className="px-3.5 py-2 rounded-lg bg-surface border border-border text-xs font-mono text-muted hover:text-text transition-colors active:scale-95"
          >
            refresh_data()
          </button>
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-red/10 border border-red/30 text-red text-xs font-mono hover:bg-red/20 transition-colors active:scale-95"
          >
            <LogOut size={13} />
            <span>logout()</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start relative">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0 space-y-1 bg-surface border border-border rounded-xl p-3`}>
          {sidebarNav.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-mono active:scale-[0.98] ${
                activeTab === item.id 
                  ? 'bg-amber text-ink font-bold shadow-sm' 
                  : 'text-muted hover:bg-surface2 hover:text-text'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeTab === item.id ? 'bg-ink/20 text-ink' : 'bg-surface2 text-muted border border-border'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0">
          
          {/* 0. OVERVIEW TAB (DEFAULT) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="font-display text-2xl font-bold text-text mb-1">Overview Dashboard</h2>
                <p className="text-sm font-mono text-muted">Quick statistics and system status</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-xl border border-border bg-surface flex flex-col items-center text-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cyan/10 text-cyan flex items-center justify-center mb-2"><Layers size={24} /></div>
                  <span className="text-3xl font-display font-bold text-text">{projects.length}</span>
                  <span className="text-xs font-mono text-muted">Total Projects</span>
                </div>
                <div className="p-6 rounded-xl border border-border bg-surface flex flex-col items-center text-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-amber/10 text-amber flex items-center justify-center mb-2"><DollarSign size={24} /></div>
                  <span className="text-3xl font-display font-bold text-text">{services.length}</span>
                  <span className="text-xs font-mono text-muted">Active Services</span>
                </div>
                <div className="p-6 rounded-xl border border-border bg-surface flex flex-col items-center text-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-green/10 text-green flex items-center justify-center mb-2"><Mail size={24} /></div>
                  <span className="text-3xl font-display font-bold text-text">{inquiries.length}</span>
                  <span className="text-xs font-mono text-muted">Client Inquiries</span>
                </div>
                <div className="p-6 rounded-xl border border-border bg-surface flex flex-col items-center text-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-red/10 text-red flex items-center justify-center mb-2"><Star size={24} /></div>
                  <span className="text-3xl font-display font-bold text-text">{testimonials.length}</span>
                  <span className="text-xs font-mono text-muted">Testimonials</span>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-border bg-surface">
                <h3 className="font-display text-lg font-bold text-text mb-4">Recent Inquiries</h3>
                {inquiries.slice(0, 3).length > 0 ? (
                  <div className="space-y-3">
                    {inquiries.slice(0, 3).map(inq => (
                      <div key={inq.id} className="flex items-center justify-between p-3 rounded-lg bg-surface2 border border-border/50">
                        <div>
                          <p className="text-sm font-bold text-text">{inq.name} <span className="text-xs font-normal text-muted ml-2">{inq.projectType}</span></p>
                          <p className="text-xs font-mono text-muted mt-1">{new Date(inq.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-mono uppercase ${inq.status === 'unread' ? 'bg-amber text-ink font-bold' : 'bg-surface border border-border text-muted'}`}>
                          {inq.status || 'new'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-mono text-muted">No recent inquiries found.</p>
                )}
              </div>
            </div>
          )}

          {/* 1. INQUIRIES TAB */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-text">Client Inquiries</h2>
                  <p className="text-xs font-mono text-muted mt-0.5">
                    Real inquiries submitted via /contact and verified through Resend & Phone OTP
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-muted">
                    {inquiries.filter((i) => i.status === 'unread').length} unread / {inquiries.length} total
                  </span>
                  <button
                    onClick={handleRefreshInquiries}
                    disabled={refreshingInquiries}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-surface2 border border-border text-cyan hover:border-cyan/50 disabled:opacity-50 transition-all active:scale-95 flex items-center gap-1.5"
                    title="Refresh inquiries"
                  >
                    <RefreshCw size={13} className={refreshingInquiries ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {loadingData ? (
                <div className="p-12 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted flex items-center justify-center gap-2">
                  <RefreshCw size={16} className="animate-spin text-amber" />
                  <span>loading_inquiries_from_firestore()...</span>
                </div>
              ) : inquiries.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className={`p-6 rounded-xl border bg-surface space-y-4 transition-colors ${
                        inq.status === 'unread' ? 'border-amber/60 bg-amber/5' : 'border-border'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-display font-bold text-text text-base">{inq.name}</span>
                          {inq.company && <span className="text-xs font-mono text-muted">@ {inq.company}</span>}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              inq.status === 'unread' ? 'bg-amber text-ink font-bold' : 'bg-surface2 text-muted border border-border'
                            }`}
                          >
                            {inq.status || 'new'}
                          </span>

                          {/* Verification Status Badge */}
                          {inq.verificationMethod === 'both' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-green/15 text-green border border-green/30">
                              <CheckCircle size={10} />
                              Verified (Email & Phone)
                            </span>
                          ) : inq.verificationMethod === 'phone' || inq.isPhoneVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-green/15 text-green border border-green/30">
                              <CheckCircle size={10} />
                              Phone Verified (+91)
                            </span>
                          ) : inq.verificationMethod === 'email' || inq.isEmailVerified ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-green/15 text-green border border-green/30">
                              <CheckCircle size={10} />
                              Email Verified (Resend)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan/15 text-cyan border border-cyan/30">
                              <CheckCircle size={10} />
                              Firebase Verified
                            </span>
                          )}
                          {(inq.code || inq.promoCode) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber/15 text-amber border border-amber/30">
                              <Tag size={10} />
                              {inq.discountApplied || '10% OFF'} ({inq.code || inq.promoCode})
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-muted">{new Date(inq.createdAt).toLocaleString()}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs text-muted bg-surface2/40 p-3 rounded-lg border border-border/40">
                        <div>
                          <span className="text-cyan">Email:</span>{' '}
                          <a href={`mailto:${inq.email}`} className="text-text hover:underline break-all">{inq.email}</a>
                        </div>
                        <div>
                          <span className="text-cyan">Phone:</span>{' '}
                          {inq.phone ? (
                            <a href={`tel:${inq.phone}`} className="text-text hover:underline">{inq.phone}</a>
                          ) : (
                            <span className="text-muted/60">Not provided</span>
                          )}
                        </div>
                        <div>
                          <span className="text-cyan">Budget:</span>{' '}
                          <span className="text-amber font-semibold">{inq.budget || 'Not specified'}</span>
                        </div>
                        <div>
                          <span className="text-cyan">Timeline:</span>{' '}
                          <span className="text-text">{inq.timeline || 'Flexible'}</span>
                        </div>
                        {(inq.code || inq.promoCode) && (
                          <div className="col-span-full flex items-center gap-2 pt-2 border-t border-border/40 text-[11px]">
                            <span className="text-amber font-semibold flex items-center gap-1">
                              <Tag size={12} />
                              Promo Code Redeemed:
                            </span>{' '}
                            <span className="text-text font-bold font-mono">{inq.code || inq.promoCode}</span>
                            <span className="px-2 py-0.5 rounded-full bg-green/15 text-green border border-green/30 text-[10px] font-semibold">
                              {inq.discountApplied || '10% OFF'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <span className="text-xs font-mono text-cyan block mb-1">
                          Project: {inq.projectType || 'E-Commerce'}
                        </span>
                        <p className="text-sm text-text/90 leading-relaxed font-sans bg-surface2/20 p-3 rounded-lg border border-border/30">
                          "{inq.message}"
                        </p>
                      </div>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {inq.status === 'unread' ? (
                            <button
                              onClick={() => handleInquiryStatus(inq.id, 'read')}
                              className="px-3 py-1 rounded text-xs font-mono bg-surface2 border border-border text-muted hover:text-text active:scale-95"
                            >
                              mark_as_read()
                            </button>
                          ) : (
                            <button
                              onClick={() => handleInquiryStatus(inq.id, 'unread')}
                              className="px-3 py-1 rounded text-xs font-mono bg-surface2 border border-border text-amber hover:bg-surface2/80 active:scale-95"
                            >
                              mark_unread()
                            </button>
                          )}
                          <button
                            onClick={() => handleInquiryStatus(inq.id, 'replied')}
                            className="px-3 py-1 rounded text-xs font-mono bg-green/10 border border-green/30 text-green hover:bg-green/20 active:scale-95"
                          >
                            mark_replied()
                          </button>
                        </div>

                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="p-1.5 rounded text-red hover:bg-red/10 transition-colors active:scale-95"
                          title="Delete inquiry"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted space-y-2">
                  <Mail size={32} className="mx-auto text-muted/40 mb-2" />
                  <p className="text-text font-semibold">No inquiries yet</p>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    Real client inquiries submitted through the Project Inquiry Form on /contact will automatically appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 2. PROJECTS TAB */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-text">Project Case Studies</h2>
                  <p className="text-xs font-mono text-muted mt-0.5">Manage portfolio projects</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentProject({
                      title: '',
                      slug: `project-${Date.now().toString().slice(-4)}`,
                      category: 'Web Application',
                      priority: projects.length + 1,
                      shortDescription: '',
                      overview: '',
                      keyFeatures: ['Feature 1', 'Feature 2'],
                      author: 'Akshat Gupta',
                      authorSlug: 'akshat-gupta',
                      year: new Date().getFullYear().toString(),
                      accentColor: '#5FC8C8',
                      coverImage: '',
                      technologies: ['React', 'Node.js'],
                      liveUrl: '',
                      githubUrl: '',
                      featured: true,
                      customerName: '',
                      customerRating: 5,
                      customerFeedback: '',
                      customerDesignation: '',
                      customerCompany: ''
                    });
                    setIsEditingProject(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm active:scale-95"
                >
                  <Plus size={15} />
                  <span>add_new_project()</span>
                </button>
              </div>

              {projects.length === 0 ? (
                <div className="p-12 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted">
                  No projects found. Add one to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((proj) => (
                    <div key={proj.id} className="rounded-xl border border-border bg-surface overflow-hidden flex flex-col justify-between">
                      {/* Cover image preview */}
                      <div className="h-32 w-full bg-surface2 relative overflow-hidden border-b border-border">
                        <img
                          src={proj.coverImage && !proj.coverImage.startsWith('/images/') ? proj.coverImage : 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'}
                          alt={proj.title}
                          className="w-full h-full object-cover"
                        />
                        {proj.liveUrl && (
                          <SafeExternalLink
                            href={proj.liveUrl}
                            className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-ink/90 border border-amber/60 text-amber flex items-center gap-1"
                          >
                            <Globe size={11} /> live ↗
                          </SafeExternalLink>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-1 text-xs font-mono text-muted">
                            <span className="text-cyan">{proj.category}</span>
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                (Number(proj.priority) || 99) <= 4
                                  ? 'bg-amber/20 border border-amber/50 text-amber'
                                  : 'bg-surface2 text-muted border border-border'
                              }`}>
                                P{proj.priority || '—'}{(Number(proj.priority) || 99) <= 4 ? ' ★ Home' : ''}
                              </span>
                              <span>{proj.year}</span>
                            </div>
                          </div>
                          <h3 className="font-display text-base font-bold text-text mb-1">{proj.title}</h3>
                          <p className="text-xs text-muted line-clamp-2 mb-3">{proj.shortDescription}</p>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                          <span className="text-muted text-[11px] truncate w-3/5">/{proj.slug}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => {
                                setCurrentProject(proj);
                                setIsEditingProject(true);
                              }}
                              className="p-1 rounded text-cyan hover:bg-cyan/10 active:scale-95"
                              title="Edit project"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-1 rounded text-red hover:bg-red/10 active:scale-95"
                              title="Delete project"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. TEAM TAB */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-text">Team Members & Portfolios</h2>
                  <p className="text-xs font-mono text-muted mt-0.5">Manage founders and team</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentMember({
                      name: '',
                      slug: `member-${Date.now().toString().slice(-4)}`,
                      role: 'Full-Stack Developer',
                      specialty: 'Web Development & UI',
                      profileImage: '',
                      bio: '',
                      shortBio: '',
                      quote: '',
                      stats: [
                        { label: 'DSA Solved', value: 300, suffix: '+' },
                        { label: 'Projects Built', value: 5, suffix: '+' }
                      ],
                      education: { degree: 'B.Tech', institution: 'University', duration: '2023-2027', score: '8.5 CGPA' },
                      skills: [
                        { category: 'Frontend', items: ['React', 'Tailwind'] },
                        { category: 'Backend', items: ['Node.js', 'Express'] }
                      ],
                      rolesTypewriter: ['Full-Stack Developer', 'Software Engineer'],
                      contact: { email: '', phone: '', location: '', github: '', linkedin: '', resumeUrl: '' }
                    });
                    setIsEditingMember(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm active:scale-95"
                >
                  <Plus size={15} />
                  <span>add_team_member()</span>
                </button>
              </div>

              {team.length === 0 ? (
                <div className="p-12 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted">
                  No team members found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {team.map((mbr) => (
                    <div key={mbr.id} className="p-6 rounded-xl border border-border bg-surface space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl bg-surface2 border border-border overflow-hidden">
                            <img src={mbr.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'} alt={mbr.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-text">{mbr.name}</h3>
                            <p className="text-xs font-mono text-amber">{mbr.role}</p>
                            <p className="text-xs text-muted">{mbr.specialty}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCurrentMember(mbr);
                              setIsEditingMember(true);
                            }}
                            className="p-1.5 rounded bg-surface2 border border-border text-cyan hover:border-cyan text-xs font-mono flex items-center gap-1 active:scale-95"
                          >
                            <Edit size={13} /> Edit
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-muted leading-relaxed line-clamp-2">
                        {mbr.shortBio || mbr.bio}
                      </p>

                      <div className="pt-2 border-t border-border flex justify-between items-center text-xs font-mono">
                        <span className="text-muted truncate w-3/5">/team/{mbr.slug}</span>
                        <SafeExternalLink
                          href={`/team/${mbr.slug}`}
                          className="text-amber hover:underline flex items-center gap-1 shrink-0"
                        >
                          <span>portfolio()</span>
                          <ExternalLink size={12} />
                        </SafeExternalLink>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. SERVICES TAB */}
          {activeTab === 'services' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-text">Pricing & Services</h2>
                  <p className="text-xs font-mono text-muted mt-0.5">Manage agency offerings and pricing</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentService({
                      code: `0${services.length + 1}`,
                      title: '',
                      shortDescription: '',
                      overview: '',
                      typicalTimeline: '2–3 Weeks',
                      problemsSolved: [],
                      technologies: ['React', 'Node.js'],
                      price: 0,
                      priceLabel: '',
                      enabled: true,
                      deliverables: [
                        { id: Date.now(), text: 'New deliverable', order: 1 }
                      ]
                    });
                    setIsEditingService(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm active:scale-95"
                >
                  <Plus size={15} />
                  <span>add_service()</span>
                </button>
              </div>

              {services.length === 0 ? (
                <div className="p-12 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted">
                  No services found. Add one to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {services.map((serv) => (
                    <div key={serv.id} className="p-5 rounded-xl border border-border bg-surface flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-xs text-amber font-bold">// {serv.code}</span>
                          <h3 className="font-display font-bold text-text text-base">{serv.title}</h3>
                          {serv.enabled === false ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red/10 border border-red/30 text-red flex items-center gap-1">
                              <XCircle size={10} /> Disabled
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-green/10 border border-green/30 text-green flex items-center gap-1">
                              <CheckCircle size={10} /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted line-clamp-1 mb-2">{serv.shortDescription}</p>
                        <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted">
                          <span className="flex items-center gap-1"><Clock size={12} /> {serv.typicalTimeline}</span>
                          {serv.price > 0 && (
                            <span className="text-amber font-bold text-xs bg-amber/10 px-2 py-0.5 rounded border border-amber/20">
                              ₹{Number(serv.price).toLocaleString()}
                            </span>
                          )}
                          {serv.priceLabel && <span className="text-cyan">{serv.priceLabel}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 sm:pt-0 w-full sm:w-auto justify-end border-t border-border sm:border-0 mt-2 sm:mt-0">
                        <button
                          onClick={() => {
                            // Ensure backward compatibility if deliverables were simple strings
                            let mappedDeliverables = serv.deliverables || [];
                            if (mappedDeliverables.length > 0 && typeof mappedDeliverables[0] === 'string') {
                              mappedDeliverables = mappedDeliverables.map((d, i) => ({ id: Date.now() + i, text: d, order: i + 1 }));
                            }
                            setCurrentService({ ...serv, deliverables: mappedDeliverables });
                            setIsEditingService(true);
                          }}
                          className="px-3 py-1.5 rounded bg-surface2 border border-border text-cyan hover:border-cyan text-xs font-mono flex items-center gap-1 active:scale-95"
                        >
                          <Edit size={13} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteService(serv.id)}
                          className="px-3 py-1.5 rounded bg-red/10 border border-red/30 text-red hover:bg-red/20 text-xs font-mono flex items-center gap-1 active:scale-95"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 5. TESTIMONIALS TAB */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-text">Client Testimonials</h2>
                  <p className="text-xs font-mono text-muted mt-0.5">Manage reviews and ratings</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentTestimonial({
                      clientName: '',
                      role: '',
                      company: '',
                      content: '',
                      rating: 5,
                      projectRef: '',
                      verified: true,
                      isSample: false
                    });
                    setIsEditingTestimonial(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-amber text-ink hover:bg-amber/90 transition-all shadow-sm active:scale-95"
                >
                  <Plus size={15} />
                  <span>add_testimonial()</span>
                </button>
              </div>

              {testimonials.length === 0 ? (
                <div className="p-12 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted">
                  No testimonials found.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((test) => (
                    <div key={test.id} className="p-6 rounded-xl border border-border bg-surface flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex gap-1 text-amber">
                            {[...Array(test.rating || 5)].map((_, i) => (
                              <Star key={i} size={13} fill="#E8A33D" stroke="#E8A33D" />
                            ))}
                          </div>
                          {test.verified !== false ? (
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-green/10 border border-green/30 text-green">
                              Verified
                            </span>
                          ) : (
                            <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-surface2 border border-border text-muted">
                              Unverified
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text/90 italic mb-4">"{test.content}"</p>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono">
                        <div>
                          <h4 className="font-bold text-text text-xs">{test.clientName}</h4>
                          <p className="text-[10px] text-muted">{test.role}, {test.company}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCurrentTestimonial(test);
                              setIsEditingTestimonial(true);
                            }}
                            className="p-1 rounded text-cyan hover:bg-cyan/10 active:scale-95"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(test.id)}
                            className="p-1 rounded text-red hover:bg-red/10 active:scale-95"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 6. SETTINGS TAB */}
          {activeTab === 'settings' && settings && (
            <div className="animate-fadeIn">
              <div className="mb-6">
                <h2 className="font-display text-xl font-bold text-text">Studio Settings</h2>
                <p className="text-xs font-mono text-muted mt-0.5">Manage global agency configurations</p>
              </div>
              <StudioSettingsManager
                settings={settings}
                setSettings={setSettings}
                onSave={handleSaveSettings}
                saving={savingSettings}
                showToast={showToast}
              />
            </div>
          )}
        </main>
      </div>

      {/* --- MODALS --- */}

      {/* Project Edit Modal */}
      {isEditingProject && currentProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeSlideDown">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
              <h3 className="font-display text-xl font-bold text-text">
                {currentProject.id ? 'Edit Project Case Study' : 'Create New Project'}
              </h3>
              <button onClick={() => setIsEditingProject(false)} className="p-1 rounded text-muted hover:text-text active:scale-95">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-5 text-xs font-mono">
              {/* Cover Upload */}
              <div className="p-4 rounded-xl border border-border bg-surface2">
                <ImageUploader
                  label="PROJECT COVER IMAGE (IMAGEKIT UPLOAD)"
                  currentImageUrl={currentProject.coverImage}
                  folder="/syntax-studio/projects"
                  token={token}
                  onUploadComplete={(url) => {
                    setCurrentProject({ ...currentProject, coverImage: url });
                    showToast('Project image uploaded to ImageKit!');
                  }}
                />
                <input
                  type="text"
                  placeholder="Or paste direct image URL"
                  value={currentProject.coverImage || ''}
                  onChange={(e) => setCurrentProject({ ...currentProject, coverImage: e.target.value })}
                  className="w-full mt-2 px-3 py-1.5 rounded bg-surface border border-border text-text text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1">PROJECT TITLE *</label>
                  <input
                    type="text"
                    required
                    value={currentProject.title}
                    onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">SLUG (URL KEY) *</label>
                  <input
                    type="text"
                    required
                    value={currentProject.slug}
                    onChange={(e) => setCurrentProject({ ...currentProject, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-cyan mb-1">PRIORITY *</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={currentProject.priority ?? 99}
                    onChange={(e) =>
                      setCurrentProject({ ...currentProject, priority: parseInt(e.target.value, 10) || 99 })
                    }
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-amber font-bold"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">CATEGORY</label>
                  <select
                    value={currentProject.category}
                    onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  >
                    <option value="E-commerce">E-commerce</option>
                    <option value="Web Application">Web Application</option>
                    <option value="Systems & APIs">Systems & APIs</option>
                    <option value="Business Website">Business Website</option>
                    <option value="AI & Machine Learning">AI & Machine Learning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-cyan mb-1">AUTHOR</label>
                  <select
                    value={currentProject.author}
                    onChange={(e) => {
                      const author = e.target.value;
                      const authorSlug = author.includes('Akshat') ? 'akshat-gupta' : 'vasu-singhal';
                      setCurrentProject({ ...currentProject, author, authorSlug });
                    }}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  >
                    <option value="Akshat Gupta">Akshat Gupta</option>
                    <option value="Vasu Singhal">Vasu Singhal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-cyan mb-1">YEAR</label>
                  <input
                    type="text"
                    value={currentProject.year}
                    onChange={(e) => setCurrentProject({ ...currentProject, year: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan mb-1">SHORT DESCRIPTION *</label>
                <textarea
                  rows={2}
                  required
                  value={currentProject.shortDescription}
                  onChange={(e) => setCurrentProject({ ...currentProject, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-cyan mb-1">OVERVIEW</label>
                <textarea
                  rows={3}
                  value={currentProject.overview}
                  onChange={(e) => setCurrentProject({ ...currentProject, overview: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text resize-none"
                ></textarea>
              </div>

              {/* Added Customer Details Section */}
              <div className="p-4 rounded-xl border border-border bg-surface2/50 space-y-4">
                <h4 className="font-display font-bold text-text text-sm flex items-center gap-2">
                  <Star size={14} className="text-amber" /> Customer Feedback & Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan mb-1">CUSTOMER NAME</label>
                    <input
                      type="text"
                      value={currentProject.customerName || ''}
                      onChange={(e) => setCurrentProject({ ...currentProject, customerName: e.target.value })}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3 py-2 rounded bg-surface border border-border text-text"
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-cyan mb-1">DESIGNATION</label>
                      <input
                        type="text"
                        value={currentProject.customerDesignation || ''}
                        onChange={(e) => setCurrentProject({ ...currentProject, customerDesignation: e.target.value })}
                        placeholder="e.g. CEO"
                        className="w-full px-3 py-2 rounded bg-surface border border-border text-text"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-cyan mb-1">RATING (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={currentProject.customerRating || 5}
                        onChange={(e) => setCurrentProject({ ...currentProject, customerRating: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded bg-surface border border-border text-amber font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-cyan mb-1">COMPANY</label>
                  <input
                    type="text"
                    value={currentProject.customerCompany || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, customerCompany: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 rounded bg-surface border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">CUSTOMER FEEDBACK / TESTIMONIAL</label>
                  <textarea
                    rows={3}
                    value={currentProject.customerFeedback || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, customerFeedback: e.target.value })}
                    placeholder="What did the customer say about this project?"
                    className="w-full px-3 py-2 rounded bg-surface border border-border text-text resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1">LIVE DEMO URL</label>
                  <input
                    type="text"
                    value={currentProject.liveUrl || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">GITHUB REPO URL</label>
                  <input
                    type="text"
                    value={currentProject.githubUrl || ''}
                    onChange={(e) => setCurrentProject({ ...currentProject, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan mb-1">TECHNOLOGIES</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="e.g. Next.js"
                    className="flex-1 px-3 py-1.5 rounded bg-surface2 border border-border text-text"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!techInput.trim()) return;
                      setCurrentProject({
                        ...currentProject,
                        technologies: [...(currentProject.technologies || []), techInput.trim()]
                      });
                      setTechInput('');
                    }}
                    className="px-3 py-1.5 rounded bg-amber text-ink font-semibold active:scale-95 transition-transform"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 p-2 rounded border border-border bg-surface2 min-h-[40px]">
                  {(currentProject.technologies || []).map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-surface border border-border text-text flex items-center gap-1">
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentProject({
                            ...currentProject,
                            technologies: currentProject.technologies.filter((_, idx) => idx !== i)
                          })
                        }
                        className="text-red font-bold hover:text-red/80"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingProject(false)}
                  className="px-4 py-2 rounded bg-surface2 text-muted hover:text-text active:scale-95 transition-colors"
                >
                  cancel()
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-amber text-ink font-bold hover:bg-amber/90 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save size={14} />
                  <span>save_project()</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Member Edit Modal */}
      {isEditingMember && currentMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeSlideDown">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
              <h3 className="font-display text-xl font-bold text-text">
                Edit Founder Profile ({currentMember.name})
              </h3>
              <button onClick={() => setIsEditingMember(false)} className="p-1 rounded text-muted hover:text-text active:scale-95">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl border border-border bg-surface2">
                <ImageUploader
                  label="FOUNDER PROFILE AVATAR (IMAGEKIT UPLOAD)"
                  currentImageUrl={currentMember.profileImage}
                  folder="/syntax-studio/team"
                  token={token}
                  onUploadComplete={(url) => {
                    setCurrentMember({ ...currentMember, profileImage: url });
                    showToast('Profile photo uploaded to ImageKit!');
                  }}
                />
                <input
                  type="text"
                  placeholder="Or paste direct image URL"
                  value={currentMember.profileImage || ''}
                  onChange={(e) => setCurrentMember({ ...currentMember, profileImage: e.target.value })}
                  className="w-full mt-2 px-3 py-1.5 rounded bg-surface border border-border text-text text-[11px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1">NAME</label>
                  <input
                    type="text"
                    required
                    value={currentMember.name}
                    onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">ROLE</label>
                  <input
                    type="text"
                    required
                    value={currentMember.role}
                    onChange={(e) => setCurrentMember({ ...currentMember, role: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan mb-1">SPECIALTY SUBTITLE</label>
                <input
                  type="text"
                  value={currentMember.specialty || ''}
                  onChange={(e) => setCurrentMember({ ...currentMember, specialty: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                />
              </div>

              <div>
                <label className="block text-cyan mb-1">FULL BIOGRAPHY</label>
                <textarea
                  rows={3}
                  value={currentMember.bio}
                  onChange={(e) => setCurrentMember({ ...currentMember, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text resize-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-cyan mb-1">EMAIL</label>
                  <input
                    type="email"
                    value={currentMember.contact?.email || ''}
                    onChange={(e) =>
                      setCurrentMember({
                        ...currentMember,
                        contact: { ...currentMember.contact, email: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">PHONE</label>
                  <input
                    type="text"
                    value={currentMember.contact?.phone || ''}
                    onChange={(e) =>
                      setCurrentMember({
                        ...currentMember,
                        contact: { ...currentMember.contact, phone: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">GITHUB</label>
                  <input
                    type="text"
                    value={currentMember.contact?.github || ''}
                    onChange={(e) =>
                      setCurrentMember({
                        ...currentMember,
                        contact: { ...currentMember.contact, github: e.target.value }
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingMember(false)}
                  className="px-4 py-2 rounded bg-surface2 text-muted hover:text-text active:scale-95 transition-colors"
                >
                  cancel()
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-amber text-ink font-bold hover:bg-amber/90 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save size={14} />
                  <span>save_founder_profile()</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Edit Modal */}
      {isEditingService && currentService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeSlideDown">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
              <h3 className="font-display text-xl font-bold text-text">
                {currentService.id ? 'Edit Service & Pricing' : 'Add New Service'}
              </h3>
              <button onClick={() => setIsEditingService(false)} className="p-1 rounded text-muted hover:text-text active:scale-95">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-5 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface2 border border-border">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${currentService.enabled !== false ? 'bg-green' : 'bg-red'}`}></div>
                  <span className="font-bold text-text text-sm">Service Status</span>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only"
                      checked={currentService.enabled !== false}
                      onChange={(e) => setCurrentService({ ...currentService, enabled: e.target.checked })}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${currentService.enabled !== false ? 'bg-green/30' : 'bg-surface border border-border'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-text w-4 h-4 rounded-full transition-transform ${currentService.enabled !== false ? 'transform translate-x-4 bg-green' : 'bg-muted'}`}></div>
                  </div>
                  <span className="ml-3 text-muted">
                    {currentService.enabled !== false ? 'Active (Visible)' : 'Disabled (Hidden)'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1">SERVICE TITLE *</label>
                  <input
                    type="text"
                    required
                    value={currentService.title}
                    onChange={(e) => setCurrentService({ ...currentService, title: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">CODE NUMBER (e.g. 01)</label>
                  <input
                    type="text"
                    value={currentService.code}
                    onChange={(e) => setCurrentService({ ...currentService, code: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber mb-1 font-bold flex items-center gap-1">
                    <DollarSign size={14}/> BASE PRICE (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={currentService.price || 0}
                      onChange={(e) => setCurrentService({ ...currentService, price: Number(e.target.value) })}
                      className="w-full pl-8 pr-3 py-2 rounded bg-surface2 border border-amber/30 text-amber font-bold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-cyan mb-1">PRICE LABEL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Starting from ₹25,000"
                    value={currentService.priceLabel || ''}
                    onChange={(e) => setCurrentService({ ...currentService, priceLabel: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan mb-1">SHORT DESCRIPTION *</label>
                <textarea
                  rows={2}
                  required
                  value={currentService.shortDescription}
                  onChange={(e) => setCurrentService({ ...currentService, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-cyan mb-1">TYPICAL TIMELINE</label>
                <input
                  type="text"
                  value={currentService.typicalTimeline || ''}
                  onChange={(e) => setCurrentService({ ...currentService, typicalTimeline: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                />
              </div>

              {/* Managed Deliverables List */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-cyan mb-1">DELIVERABLES INCLUDED</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newId = Date.now();
                      const currentDels = currentService.deliverables || [];
                      setCurrentService({
                        ...currentService,
                        deliverables: [...currentDels, { id: newId, text: '', order: currentDels.length + 1 }]
                      });
                    }}
                    className="px-2 py-1 rounded bg-surface2 border border-border text-cyan text-[10px] hover:border-cyan transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {(!currentService.deliverables || currentService.deliverables.length === 0) ? (
                    <div className="p-4 text-center text-muted bg-surface2 rounded border border-dashed border-border/50">
                      No deliverables added yet.
                    </div>
                  ) : (
                    currentService.deliverables.sort((a,b) => (a.order || 0) - (b.order || 0)).map((del, index) => (
                      <div key={del.id || index} className="flex items-center gap-2 bg-surface2 p-2 rounded border border-border">
                        <div className="flex flex-col gap-1 text-muted shrink-0 px-1">
                          <button type="button" onClick={() => {
                            if (index > 0) {
                              const newDels = [...currentService.deliverables];
                              [newDels[index - 1], newDels[index]] = [newDels[index], newDels[index - 1]];
                              newDels.forEach((d, i) => d.order = i + 1);
                              setCurrentService({ ...currentService, deliverables: newDels });
                            }
                          }} className="hover:text-amber disabled:opacity-30" disabled={index === 0}>
                            <ChevronUp size={14} />
                          </button>
                          <button type="button" onClick={() => {
                            if (index < currentService.deliverables.length - 1) {
                              const newDels = [...currentService.deliverables];
                              [newDels[index + 1], newDels[index]] = [newDels[index], newDels[index + 1]];
                              newDels.forEach((d, i) => d.order = i + 1);
                              setCurrentService({ ...currentService, deliverables: newDels });
                            }
                          }} className="hover:text-amber disabled:opacity-30" disabled={index === currentService.deliverables.length - 1}>
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={del.text || ''}
                          placeholder="e.g. Custom UI Design"
                          onChange={(e) => {
                            const newDels = [...currentService.deliverables];
                            newDels[index].text = e.target.value;
                            setCurrentService({ ...currentService, deliverables: newDels });
                          }}
                          className="flex-1 px-3 py-1.5 rounded bg-surface border border-border text-text text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newDels = currentService.deliverables.filter((_, i) => i !== index);
                            newDels.forEach((d, i) => d.order = i + 1);
                            setCurrentService({ ...currentService, deliverables: newDels });
                          }}
                          className="p-1.5 rounded text-red hover:bg-red/10 shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditingService(false)}
                  className="px-4 py-2 rounded bg-surface2 text-muted hover:text-text active:scale-95 transition-colors"
                >
                  cancel()
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-amber text-ink font-bold hover:bg-amber/90 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save size={14} />
                  <span>save_service()</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Testimonial Edit Modal */}
      {isEditingTestimonial && currentTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeSlideDown">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-border">
              <h3 className="font-display text-xl font-bold text-text">
                {currentTestimonial.id ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <button onClick={() => setIsEditingTestimonial(false)} className="p-1 rounded text-muted hover:text-text active:scale-95">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1">CLIENT NAME *</label>
                  <input
                    type="text"
                    required
                    value={currentTestimonial.clientName}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, clientName: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">ROLE / TITLE</label>
                  <input
                    type="text"
                    value={currentTestimonial.role}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, role: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-cyan mb-1">COMPANY</label>
                  <input
                    type="text"
                    value={currentTestimonial.company}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, company: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1">PROJECT REFERENCE</label>
                  <input
                    type="text"
                    value={currentTestimonial.projectRef}
                    onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, projectRef: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-cyan mb-1">FEEDBACK / REVIEW CONTENT *</label>
                <textarea
                  rows={4}
                  required
                  value={currentTestimonial.content}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, content: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditingTestimonial(false)}
                  className="px-4 py-2 rounded bg-surface2 text-muted hover:text-text active:scale-95 transition-colors"
                >
                  cancel()
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-amber text-ink font-bold hover:bg-amber/90 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <Save size={14} />
                  <span>save_testimonial()</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
