import React, { useState, useMemo } from 'react';
import {
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Tag,
  ExternalLink,
  Save,
  Send,
  User,
  Building,
  DollarSign,
  Copy,
  Check
} from 'lucide-react';

export default function AdminInquiriesManager({
  inquiries = [],
  loading = false,
  refreshing = false,
  onRefresh,
  onUpdateStatus,
  onUpdateInquiry,
  onDeleteInquiry
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [activeNotesId, setActiveNotesId] = useState(null);
  const [noteDrafts, setNoteDrafts] = useState({});
  const [savingNoteId, setSavingNoteId] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // Filter inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      // Status filter
      if (statusFilter !== 'all') {
        const currentStatus = inq.status || 'unread';
        if (statusFilter === 'unread' && currentStatus !== 'unread') return false;
        if (statusFilter === 'in_review' && currentStatus !== 'in_review') return false;
        if (statusFilter === 'contacted' && currentStatus !== 'contacted') return false;
        if (statusFilter === 'closed' && !['closed', 'archived'].includes(currentStatus)) return false;
      }

      // Verification filter
      if (verificationFilter === 'phone') {
        if (!inq.isPhoneVerified && inq.verificationMethod !== 'phone' && inq.verificationMethod !== 'both') return false;
      } else if (verificationFilter === 'email') {
        if (!inq.isEmailVerified && inq.verificationMethod !== 'email' && inq.verificationMethod !== 'both') return false;
      } else if (verificationFilter === 'both') {
        if (inq.verificationMethod !== 'both' && !(inq.isPhoneVerified && inq.isEmailVerified)) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const name = (inq.name || '').toLowerCase();
        const email = (inq.email || '').toLowerCase();
        const phone = (inq.phone || '').toLowerCase();
        const company = (inq.company || '').toLowerCase();
        const projectType = (inq.projectType || '').toLowerCase();
        const promo = (inq.promoCode || inq.code || '').toLowerCase();
        const message = (inq.message || '').toLowerCase();
        const notes = (inq.notes || '').toLowerCase();

        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q) ||
          company.includes(q) ||
          projectType.includes(q) ||
          promo.includes(q) ||
          message.includes(q) ||
          notes.includes(q)
        );
      }

      return true;
    });
  }, [inquiries, statusFilter, verificationFilter, searchTerm]);

  // Status counts
  const counts = useMemo(() => {
    const unread = inquiries.filter((i) => !i.status || i.status === 'unread').length;
    const inReview = inquiries.filter((i) => i.status === 'in_review').length;
    const contacted = inquiries.filter((i) => i.status === 'contacted').length;
    const closed = inquiries.filter((i) => ['closed', 'archived'].includes(i.status)).length;
    return { all: inquiries.length, unread, inReview, contacted, closed };
  }, [inquiries]);

  // Copy to clipboard helper
  const copyToClipboard = (text, fieldKey) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Export CSV helper
  const exportToCSV = () => {
    if (!inquiries.length) return;
    const headers = [
      'ID',
      'Created At',
      'Name',
      'Email',
      'Phone',
      'Company',
      'Project Type',
      'Budget',
      'Timeline',
      'Status',
      'Promo Code',
      'Verification',
      'Message',
      'Notes'
    ];

    const rows = inquiries.map((i) => [
      `"${i.id || ''}"`,
      `"${i.createdAt ? new Date(i.createdAt).toISOString() : ''}"`,
      `"${(i.name || '').replace(/"/g, '""')}"`,
      `"${(i.email || '').replace(/"/g, '""')}"`,
      `"${(i.phone || '').replace(/"/g, '""')}"`,
      `"${(i.company || '').replace(/"/g, '""')}"`,
      `"${(i.projectType || '').replace(/"/g, '""')}"`,
      `"${(i.budget || '').replace(/"/g, '""')}"`,
      `"${(i.timeline || '').replace(/"/g, '""')}"`,
      `"${(i.status || 'unread').replace(/"/g, '""')}"`,
      `"${(i.promoCode || i.code || '').replace(/"/g, '""')}"`,
      `"${(i.verificationMethod || 'verified').replace(/"/g, '""')}"`,
      `"${(i.message || '').replace(/"/g, '""')}"`,
      `"${(i.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `syntax_studio_inquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON helper
  const exportToJSON = () => {
    if (!inquiries.length) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(inquiries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `syntax_studio_inquiries_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Save private note
  const handleSaveNote = async (id) => {
    const noteText = noteDrafts[id] !== undefined ? noteDrafts[id] : (inquiries.find((i) => i.id === id)?.notes || '');
    setSavingNoteId(id);
    try {
      if (onUpdateInquiry) {
        await onUpdateInquiry(id, { notes: noteText });
      }
      setActiveNotesId(null);
    } finally {
      setSavingNoteId(null);
    }
  };

  const getCleanPhone = (phoneStr) => {
    if (!phoneStr) return '';
    return phoneStr.replace(/[^0-9]/g, '');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="font-display text-2xl font-bold text-text flex items-center gap-2">
            <Mail className="text-amber" size={24} />
            Client Inquiries CRM
          </h2>
          <p className="text-xs font-mono text-muted mt-1">
            Real leads submitted via /contact • OTP Verified • Direct Client Reachout
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={inquiries.length === 0}
            className="px-3 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-mono text-cyan hover:border-cyan/60 disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-95"
            title="Download full inquiry history as CSV spreadsheet"
          >
            <Download size={13} />
            <span>export_csv()</span>
          </button>
          <button
            onClick={exportToJSON}
            disabled={inquiries.length === 0}
            className="px-3 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-mono text-muted hover:text-text disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-95"
            title="Download full inquiry history as JSON"
          >
            <Download size={13} />
            <span>export_json()</span>
          </button>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="px-3.5 py-1.5 rounded-lg bg-amber text-ink text-xs font-mono font-semibold hover:bg-amber/90 disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>sync_leads()</span>
          </button>
        </div>
      </div>

      {/* Status Tabs & Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All Inquiries', count: counts.all, color: 'text-text' },
            { id: 'unread', label: 'Unread / New', count: counts.unread, color: 'text-amber' },
            { id: 'in_review', label: 'In Review', count: counts.inReview, color: 'text-cyan' },
            { id: 'contacted', label: 'Contacted', count: counts.contacted, color: 'text-green' },
            { id: 'closed', label: 'Closed / Archived', count: counts.closed, color: 'text-muted' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 active:scale-95 ${
                statusFilter === tab.id
                  ? 'bg-amber text-ink font-bold shadow-md'
                  : 'bg-surface border border-border text-muted hover:text-text hover:bg-surface2'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === tab.id ? 'bg-ink/20 text-ink' : 'bg-surface2 text-muted border border-border'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Verification Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-3 text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name, email, phone, company, project type, promo code or notes..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-border text-xs text-text placeholder-muted/60 focus:border-amber transition-colors font-mono"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-muted hover:text-text"
              >
                clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter size={14} className="text-muted" />
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-surface border border-border text-xs text-text font-mono focus:border-amber transition-colors"
            >
              <option value="all">Verification: All</option>
              <option value="phone">Phone Verified</option>
              <option value="email">Email Verified</option>
              <option value="both">Both Verified</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiry List */}
      {loading ? (
        <div className="p-16 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted flex flex-col items-center justify-center gap-3">
          <RefreshCw size={24} className="animate-spin text-amber" />
          <span>fetching_inquiries_from_firestore()...</span>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="p-16 text-center border border-border rounded-xl bg-surface font-mono text-sm text-muted space-y-3">
          <Mail size={36} className="mx-auto text-muted/40" />
          <p className="text-text font-semibold">No inquiries match the current filter criteria</p>
          <p className="text-xs text-muted max-w-md mx-auto">
            {searchTerm || statusFilter !== 'all' || verificationFilter !== 'all'
              ? 'Try resetting the search terms or filters to view all records.'
              : 'Client inquiries submitted through the contact page will automatically show up here.'}
          </p>
          {(searchTerm || statusFilter !== 'all' || verificationFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setVerificationFilter('all');
              }}
              className="px-3 py-1.5 rounded-lg bg-surface2 border border-border text-xs text-cyan hover:border-cyan/50 active:scale-95"
            >
              reset_filters()
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-muted px-1">
            <span>Showing {filteredInquiries.length} of {inquiries.length} inquiries</span>
            <span>Sorted by most recent</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredInquiries.map((inq) => {
              const rawPhone = inq.phone || '';
              const cleanPhone = getCleanPhone(rawPhone);
              const waLink = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${inq.name || 'there'}, thank you for reaching out to Syntax Studio regarding your ${inq.projectType || 'project'}!`)}` : null;
              const mailtoLink = `mailto:${inq.email}?subject=${encodeURIComponent(`Regarding your ${inq.projectType || 'project'} inquiry - Syntax Studio`)}&body=${encodeURIComponent(`Hi ${inq.name || 'there'},\n\nThank you for reaching out to Syntax Studio regarding your project.\n\nWe have reviewed your scope: "${inq.message || ''}"\n\nWhen would be a convenient time for a quick 15-minute intro call to discuss timeline and architecture?\n\nBest regards,\nSyntax Studio Team`)}`;
              
              const isUnread = !inq.status || inq.status === 'unread';
              const isInReview = inq.status === 'in_review';
              const isContacted = inq.status === 'contacted';
              const isClosed = ['closed', 'archived'].includes(inq.status);

              return (
                <div
                  key={inq.id}
                  className={`p-6 rounded-2xl border bg-surface transition-all duration-200 shadow-sm ${
                    isUnread
                      ? 'border-amber/50 bg-gradient-to-br from-amber/[0.04] to-transparent ring-1 ring-amber/20'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  {/* Lead Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-border/60">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-display font-bold text-text text-lg flex items-center gap-2">
                          <User size={16} className="text-cyan" />
                          {inq.name}
                        </span>

                        {inq.company && (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-muted bg-surface2 px-2 py-0.5 rounded border border-border">
                            <Building size={12} className="text-muted" />
                            {inq.company}
                          </span>
                        )}

                        {/* Status Badge */}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-semibold border ${
                            isUnread
                              ? 'bg-amber text-ink border-amber shadow-sm'
                              : isInReview
                              ? 'bg-cyan/15 text-cyan border-cyan/40'
                              : isContacted
                              ? 'bg-green/15 text-green border-green/40'
                              : 'bg-surface2 text-muted border-border'
                          }`}
                        >
                          {inq.status || 'unread'}
                        </span>

                        {/* Verification Method */}
                        {inq.verificationMethod === 'both' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-green/15 text-green border border-green/30">
                            <CheckCircle size={10} />
                            Verified (Phone & Email)
                          </span>
                        ) : inq.verificationMethod === 'phone' || inq.isPhoneVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-green/15 text-green border border-green/30">
                            <CheckCircle size={10} />
                            Phone Verified
                          </span>
                        ) : inq.verificationMethod === 'email' || inq.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-green/15 text-green border border-green/30">
                            <CheckCircle size={10} />
                            Email Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan/15 text-cyan border border-cyan/30">
                            <CheckCircle size={10} />
                            Firebase Verified
                          </span>
                        )}

                        {/* Promo Code Badge */}
                        {(inq.code || inq.promoCode) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber/15 text-amber border border-amber/30">
                            <Tag size={10} />
                            {inq.discountApplied || '10% OFF'} ({inq.code || inq.promoCode})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-muted">
                        <Clock size={12} />
                        <span>{inq.createdAt ? new Date(inq.createdAt).toLocaleString() : 'Recent'}</span>
                        {inq.ip && <span className="text-[10px] opacity-60">• IP: {inq.ip}</span>}
                      </div>
                    </div>

                    {/* Quick Reachout Buttons */}
                    <div className="flex items-center gap-2">
                      <a
                        href={mailtoLink}
                        className="px-3 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-mono text-cyan hover:border-cyan hover:bg-cyan/10 transition-colors flex items-center gap-1.5 active:scale-95"
                        title="Send email reply"
                      >
                        <Mail size={13} />
                        <span>Email</span>
                      </a>

                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-green/10 border border-green/30 text-xs font-mono text-green hover:bg-green/20 transition-colors flex items-center gap-1.5 active:scale-95"
                          title="Open WhatsApp chat"
                        >
                          <MessageSquare size={13} />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs text-muted bg-surface2/40 p-3.5 rounded-xl border border-border/50 my-4">
                    <div className="flex flex-col">
                      <span className="text-cyan text-[11px] mb-0.5 flex items-center justify-between">
                        Email Address:
                        <button
                          onClick={() => copyToClipboard(inq.email, `email-${inq.id}`)}
                          className="text-muted hover:text-text transition-colors p-0.5"
                          title="Copy email"
                        >
                          {copiedField === `email-${inq.id}` ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                        </button>
                      </span>
                      <a href={`mailto:${inq.email}`} className="text-text hover:underline break-all">
                        {inq.email}
                      </a>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-cyan text-[11px] mb-0.5 flex items-center justify-between">
                        Contact Phone:
                        {inq.phone && (
                          <button
                            onClick={() => copyToClipboard(inq.phone, `phone-${inq.id}`)}
                            className="text-muted hover:text-text transition-colors p-0.5"
                            title="Copy phone"
                          >
                            {copiedField === `phone-${inq.id}` ? <Check size={11} className="text-green" /> : <Copy size={11} />}
                          </button>
                        )}
                      </span>
                      {inq.phone ? (
                        <a href={`tel:${inq.phone}`} className="text-text hover:underline">
                          {inq.phone}
                        </a>
                      ) : (
                        <span className="text-muted/60">Not provided</span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-cyan text-[11px] mb-0.5">Estimated Budget:</span>
                      <span className="text-amber font-semibold">{inq.budget || 'Not specified'}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-cyan text-[11px] mb-0.5">Target Timeline:</span>
                      <span className="text-text">{inq.timeline || 'Flexible'}</span>
                    </div>
                  </div>

                  {/* Message & Scope */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-cyan flex items-center gap-1.5">
                        <Tag size={12} /> Project Type: {inq.projectType || 'Custom Solution'}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-surface2/20 border border-border/40 text-sm text-text/90 leading-relaxed font-sans whitespace-pre-wrap">
                      "{inq.message || 'No project description provided.'}"
                    </div>
                  </div>

                  {/* Private Internal CRM Notes */}
                  <div className="mt-4 pt-3 border-t border-border/40">
                    {activeNotesId === inq.id ? (
                      <div className="space-y-2 p-3 rounded-xl bg-surface2 border border-border">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-mono text-amber font-semibold flex items-center gap-1">
                            <Save size={12} /> Internal Private Notes (Admin Only)
                          </label>
                          <button
                            onClick={() => setActiveNotesId(null)}
                            className="text-xs font-mono text-muted hover:text-text"
                          >
                            close
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={noteDrafts[inq.id] !== undefined ? noteDrafts[inq.id] : inq.notes || ''}
                          onChange={(e) => setNoteDrafts({ ...noteDrafts, [inq.id]: e.target.value })}
                          placeholder="Record client discussions, proposal values, follow-up dates, or requirements..."
                          className="w-full p-2.5 rounded-lg bg-surface border border-border text-xs text-text font-mono focus:border-amber transition-colors"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setActiveNotesId(null)}
                            className="px-3 py-1 rounded text-xs font-mono text-muted hover:text-text"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveNote(inq.id)}
                            disabled={savingNoteId === inq.id}
                            className="px-3 py-1 rounded bg-amber text-ink text-xs font-mono font-bold hover:bg-amber/90 transition-all flex items-center gap-1 disabled:opacity-50"
                          >
                            <Save size={12} />
                            <span>{savingNoteId === inq.id ? 'saving()...' : 'save_notes()'}</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2 text-muted">
                          <span className="text-cyan font-semibold">Notes:</span>
                          {inq.notes ? (
                            <span className="text-text/80 truncate max-w-md italic">"{inq.notes}"</span>
                          ) : (
                            <span className="text-muted/50 italic">No notes added yet</span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setActiveNotesId(inq.id);
                            if (noteDrafts[inq.id] === undefined) {
                              setNoteDrafts({ ...noteDrafts, [inq.id]: inq.notes || '' });
                            }
                          }}
                          className="text-amber hover:underline text-[11px] flex items-center gap-1"
                        >
                          <Save size={11} />
                          {inq.notes ? 'edit_notes()' : 'add_notes()'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono text-muted">Update status:</span>
                      
                      {inq.status !== 'unread' && (
                        <button
                          onClick={() => onUpdateStatus(inq.id, 'unread')}
                          className="px-2.5 py-1 rounded text-[11px] font-mono bg-surface2 border border-border text-muted hover:text-text hover:border-amber active:scale-95 transition-all"
                        >
                          mark_unread
                        </button>
                      )}

                      {inq.status !== 'in_review' && (
                        <button
                          onClick={() => onUpdateStatus(inq.id, 'in_review')}
                          className="px-2.5 py-1 rounded text-[11px] font-mono bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan/20 active:scale-95 transition-all"
                        >
                          in_review
                        </button>
                      )}

                      {inq.status !== 'contacted' && (
                        <button
                          onClick={() => onUpdateStatus(inq.id, 'contacted')}
                          className="px-2.5 py-1 rounded text-[11px] font-mono bg-green/10 border border-green/30 text-green hover:bg-green/20 active:scale-95 transition-all"
                        >
                          mark_contacted
                        </button>
                      )}

                      {!isClosed && (
                        <button
                          onClick={() => onUpdateStatus(inq.id, 'closed')}
                          className="px-2.5 py-1 rounded text-[11px] font-mono bg-surface2 border border-border text-muted hover:text-text active:scale-95 transition-all"
                        >
                          close_lead
                        </button>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteInquiry(inq.id)}
                      className="p-1.5 rounded-lg text-muted hover:text-red hover:bg-red/10 transition-colors active:scale-95"
                      title="Permanently delete inquiry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
