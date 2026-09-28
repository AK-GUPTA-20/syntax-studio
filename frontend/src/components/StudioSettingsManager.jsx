import React, { useState, useMemo } from 'react';
import {
  Save,
  Plus,
  Trash2,
  Sliders,
  Zap,
  GraduationCap,
  Home,
  Layout,
  ShieldCheck,
  Sparkles,
  Users,
  HelpCircle,
  FolderPlus,
  Search,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ChevronRight,
  Info,
  Layers,
  FileText,
  PlusCircle,
  ExternalLink,
  Tag,
  Percent
} from 'lucide-react';

export default function StudioSettingsManager({
  settings,
  setSettings,
  onSave,
  saving = false,
  showToast
}) {
  // Sub-setting navigation tabs
  const [activeSubTab, setActiveSubTab] = useState('identity');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals for Custom Sections and Custom Settings
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionDesc, setNewSectionDesc] = useState('');

  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState('');
  const [newFieldData, setNewFieldData] = useState({
    key: '',
    label: '',
    value: '',
    type: 'text'
  });

  // Track initial state to detect dirty changes
  const [isDirty, setIsDirty] = useState(false);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  // Sub-settings definition
  const subSections = useMemo(
    () => [
      {
        id: 'identity',
        label: 'Identity & Hero',
        desc: 'Brand name, hero headlines, contact info & CTA',
        icon: Sliders,
        badge: 'Core'
      },
      {
        id: 'capabilities',
        label: 'Capabilities',
        desc: 'Section headers & prioritized capability cards',
        icon: Zap,
        badge: `${settings?.capabilities?.length || 0} items`
      },
      {
        id: 'branding',
        label: 'Academic & Tech Stack',
        desc: 'Colleges, primary stack & navbar/footer pills',
        icon: GraduationCap,
        badge: 'Branding'
      },
      {
        id: 'homepage',
        label: 'Homepage Sections',
        desc: 'Featured projects, services preview & arsenal',
        icon: Home,
        badge: '5 Sections'
      },
      {
        id: 'subpages',
        label: 'Subpages Headers',
        desc: 'About, services, team & contact page banners',
        icon: Layout,
        badge: '4 Pages'
      },
      {
        id: 'commitments',
        label: 'Commitments',
        desc: 'Guarantees on contact page sidebar',
        icon: ShieldCheck,
        badge: `${settings?.commitments?.length || 0} items`
      },
      {
        id: 'principles',
        label: 'Core Principles',
        desc: 'Four engineering pillars on /about',
        icon: Sparkles,
        badge: `${settings?.values?.length || 0} items`
      },
      {
        id: 'advantages',
        label: 'Founder Advantages',
        desc: 'Why working with founders wins on /team',
        icon: Users,
        badge: `${settings?.advantages?.length || 0} items`
      },
      {
        id: 'faqs',
        label: 'FAQ Manager',
        desc: 'Frequently asked questions on /services',
        icon: HelpCircle,
        badge: `${settings?.faqs?.length || 0} items`
      },
      {
        id: 'discounts',
        label: 'Promo Codes & Offers',
        desc: 'Inquiry discount codes, percentage & promotional offers',
        icon: Tag,
        badge: `${settings?.discountPercentage ?? 10}% OFF`
      },
      {
        id: 'custom',
        label: 'Custom Sections & Settings',
        desc: 'Create new sections & custom key-value settings',
        icon: FolderPlus,
        badge: `${(settings?.customSections || []).length} Sections`
      }
    ],
    [settings]
  );

  // Filter sub-settings if user searches
  const filteredSubSections = useMemo(() => {
    if (!searchQuery.trim()) return subSections;
    const q = searchQuery.toLowerCase();
    return subSections.filter(
      (sec) =>
        sec.label.toLowerCase().includes(q) ||
        sec.desc.toLowerCase().includes(q) ||
        sec.id.toLowerCase().includes(q)
    );
  }, [subSections, searchQuery]);

  // Handler to add a brand-new Custom Section
  const handleAddCustomSection = (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;

    const newSec = {
      id: `sec_${Date.now()}`,
      name: newSectionName.trim(),
      description: newSectionDesc.trim(),
      fields: []
    };

    const updatedSections = [...(settings?.customSections || []), newSec];
    updateSetting('customSections', updatedSections);
    setNewSectionName('');
    setNewSectionDesc('');
    setShowAddSectionModal(false);
    if (showToast) showToast(`New settings section "${newSec.name}" created!`);
  };

  // Handler to delete a Custom Section
  const handleDeleteCustomSection = (secId) => {
    if (!window.confirm('Delete this custom settings section and all its fields?')) return;
    const updated = (settings?.customSections || []).filter((s) => s.id !== secId);
    updateSetting('customSections', updated);
    if (showToast) showToast('Custom section removed');
  };

  // Handler to add a custom field into a section
  const handleAddCustomField = (e) => {
    e.preventDefault();
    if (!newFieldData.key.trim() || !newFieldData.label.trim()) return;

    const sanitizedKey = newFieldData.key.trim().replace(/\s+/g, '_');
    const fieldItem = {
      id: `fld_${Date.now()}`,
      key: sanitizedKey,
      label: newFieldData.label.trim(),
      value: newFieldData.value,
      type: newFieldData.type || 'text'
    };

    const sections = [...(settings?.customSections || [])];
    const secIndex = sections.findIndex((s) => s.id === targetSectionId);

    if (secIndex >= 0) {
      sections[secIndex] = {
        ...sections[secIndex],
        fields: [...(sections[secIndex].fields || []), fieldItem]
      };
    } else {
      // Default fallback section
      sections.push({
        id: `sec_${Date.now()}`,
        name: 'General Additional Settings',
        description: 'User-defined custom parameters',
        fields: [fieldItem]
      });
    }

    updateSetting('customSections', sections);
    setNewFieldData({ key: '', label: '', value: '', type: 'text' });
    setShowAddFieldModal(false);
    if (showToast) showToast(`Setting "${fieldItem.label}" added!`);
  };

  // Handler to update a custom field's value
  const handleUpdateCustomFieldValue = (secId, fieldId, newValue) => {
    const sections = (settings?.customSections || []).map((sec) => {
      if (sec.id !== secId) return sec;
      return {
        ...sec,
        fields: (sec.fields || []).map((f) => (f.id === fieldId ? { ...f, value: newValue } : f))
      };
    });
    updateSetting('customSections', sections);
  };

  // Handler to delete a custom field
  const handleDeleteCustomField = (secId, fieldId) => {
    const sections = (settings?.customSections || []).map((sec) => {
      if (sec.id !== secId) return sec;
      return {
        ...sec,
        fields: (sec.fields || []).filter((f) => f.id !== fieldId)
      };
    });
    updateSetting('customSections', sections);
    if (showToast) showToast('Custom field deleted');
  };

  const activeSectionObj = subSections.find((s) => s.id === activeSubTab) || subSections[0];

  return (
    <div className="space-y-6">
      {/* Top Header & Save Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl border border-border bg-surface">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber/10 border border-amber/30 text-amber">
              <Sliders size={18} />
            </span>
            <h2 className="font-display text-xl font-bold text-text">
              Studio Configuration & Settings
            </h2>
            {isDirty && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber text-ink font-bold animate-pulse">
                Unsaved Changes
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-muted">
            Divided into 10 structured sub-settings. Modify branding, section titles, capabilities, or add new custom sections.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setTargetSectionId(settings?.customSections?.[0]?.id || 'default');
              setShowAddFieldModal(true);
            }}
            className="px-3.5 py-2 rounded-lg bg-surface2 border border-border text-xs font-mono text-cyan hover:border-cyan/50 hover:bg-cyan/5 transition-all flex items-center gap-1.5"
            title="Add a new custom setting field"
          >
            <Plus size={14} />
            <span>Add Custom Setting</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddSectionModal(true)}
            className="px-3.5 py-2 rounded-lg bg-surface2 border border-border text-xs font-mono text-text hover:border-amber/50 hover:bg-amber/5 transition-all flex items-center gap-1.5"
            title="Create a new settings section"
          >
            <FolderPlus size={14} className="text-amber" />
            <span>New Section</span>
          </button>

          <button
            type="button"
            onClick={async (e) => {
              await onSave(e);
              setIsDirty(false);
            }}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-amber text-ink text-xs font-mono font-bold hover:bg-amber/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md active:scale-95 shrink-0"
          >
            <Save size={15} />
            <span>{saving ? 'saving_all()...' : 'Save All Settings'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Layout: Sub-setting Navigation Tabs + Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-settings Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Sub-settings */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-muted" />
            <input
              type="text"
              placeholder="Search setting sections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border text-xs text-text font-mono focus:border-amber focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-2 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-muted font-bold flex justify-between items-center">
              <span>Sub-Settings Directory</span>
              <span>{subSections.length} Sections</span>
            </div>

            {filteredSubSections.map((sub) => {
              const Icon = sub.icon;
              const isActive = activeSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setActiveSubTab(sub.id)}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-center justify-between group ${
                    isActive
                      ? 'bg-amber/15 border border-amber/40 text-amber'
                      : 'hover:bg-surface2/60 border border-transparent text-muted hover:text-text'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={16} className={`shrink-0 ${isActive ? 'text-amber' : 'text-muted group-hover:text-cyan'}`} />
                    <div className="min-w-0">
                      <p className={`font-mono text-xs font-semibold truncate ${isActive ? 'text-amber' : 'text-text'}`}>
                        {sub.label}
                      </p>
                      <p className="text-[10px] text-muted truncate">{sub.desc}</p>
                    </div>
                  </div>
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-[10px] font-mono shrink-0 ${
                      isActive
                        ? 'bg-amber text-ink font-bold'
                        : 'bg-surface2 text-muted border border-border'
                    }`}
                  >
                    {sub.badge}
                  </span>
                </button>
              );
            })}

            {filteredSubSections.length === 0 && (
              <div className="p-4 text-center text-xs font-mono text-muted">
                No matching section found.
              </div>
            )}
          </div>
        </div>

        {/* Right Active Sub-Setting Content Form */}
        <div className="lg:col-span-8">
          <form
            onSubmit={async (e) => {
              await onSave(e);
              setIsDirty(false);
            }}
            className="p-7 rounded-2xl border border-border bg-surface space-y-6 text-xs font-mono shadow-lg"
          >
            {/* Section Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-4">
              <div className="flex items-center gap-2">
                {React.createElement(activeSectionObj.icon, {
                  size: 20,
                  className: 'text-amber shrink-0'
                })}
                <div>
                  <h3 className="font-display text-lg font-bold text-text">
                    {activeSectionObj.label}
                  </h3>
                  <p className="text-[11px] text-muted">{activeSectionObj.desc}</p>
                </div>
              </div>
              <span className="text-[11px] font-mono text-cyan bg-cyan/10 border border-cyan/30 px-2.5 py-1 rounded-full self-start sm:self-auto">
                // Section {subSections.findIndex((s) => s.id === activeSubTab) + 1} of {subSections.length}
              </span>
            </div>

            {/* 1. SUB-SETTING: IDENTITY & HERO */}
            {activeSubTab === 'identity' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan mb-1.5">COMPANY NAME</label>
                    <input
                      type="text"
                      value={settings.companyName || ''}
                      onChange={(e) => updateSetting('companyName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono focus:border-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">HERO ANNOUNCEMENT BADGE</label>
                    <input
                      type="text"
                      value={settings.heroAnnouncement || ''}
                      onChange={(e) => updateSetting('heroAnnouncement', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono focus:border-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-cyan mb-1.5">HERO HEADLINE (TAGLINE)</label>
                  <textarea
                    rows={2}
                    value={settings.tagline || ''}
                    onChange={(e) => updateSetting('tagline', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono resize-none focus:border-amber"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-cyan mb-1.5">HERO SUB-HEADLINE</label>
                  <textarea
                    rows={3}
                    value={settings.subtagline || ''}
                    onChange={(e) => updateSetting('subtagline', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono resize-none focus:border-amber"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-cyan mb-1.5">CONTACT EMAIL</label>
                    <input
                      type="email"
                      value={settings.contactEmail || ''}
                      onChange={(e) => updateSetting('contactEmail', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono focus:border-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">CONTACT PHONE</label>
                    <input
                      type="text"
                      value={settings.contactPhone || ''}
                      onChange={(e) => updateSetting('contactPhone', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono focus:border-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">STUDIO LOCATION</label>
                    <input
                      type="text"
                      value={settings.location || ''}
                      onChange={(e) => updateSetting('location', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono focus:border-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-cyan mb-1.5">ABOUT THE STUDIO STORY</label>
                  <textarea
                    rows={4}
                    value={settings.aboutStory || ''}
                    onChange={(e) => updateSetting('aboutStory', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono resize-none focus:border-amber"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-cyan mb-1.5">HOMEPAGE TRUST STATS (3 HIGHLIGHTS)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[0, 1, 2].map((idx) => {
                      const stat = settings.stats?.[idx] || { value: '', label: '' };
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-surface2/60 border border-border space-y-2">
                          <input
                            type="text"
                            placeholder="Value (e.g. 850+)"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...(settings.stats || [{}, {}, {}])];
                              newStats[idx] = { ...newStats[idx], value: e.target.value };
                              updateSetting('stats', newStats);
                            }}
                            className="w-full px-2 py-1 rounded bg-ink border border-border text-amber font-mono font-bold text-xs"
                          />
                          <input
                            type="text"
                            placeholder="Label (e.g. DSA Solved)"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...(settings.stats || [{}, {}, {}])];
                              newStats[idx] = { ...newStats[idx], label: e.target.value };
                              updateSetting('stats', newStats);
                            }}
                            className="w-full px-2 py-1 rounded bg-ink border border-border text-text font-mono text-[11px]"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan mb-1.5">BOTTOM CTA TITLE</label>
                    <input
                      type="text"
                      value={settings.ctaTitle || ''}
                      onChange={(e) => updateSetting('ctaTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono focus:border-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">BOTTOM CTA DESCRIPTION</label>
                    <input
                      type="text"
                      value={settings.ctaDescription || ''}
                      onChange={(e) => updateSetting('ctaDescription', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono focus:border-amber"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SUB-SETTING: CAPABILITIES */}
            {activeSubTab === 'capabilities' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-display font-bold text-text text-sm">
                      Capabilities Section Headers & Order
                    </h4>
                    <p className="text-[11px] text-muted">
                      Configure section headers and manage capability cards.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newCap = {
                        id: `cap_${Date.now()}`,
                        title: 'New Engineering Capability',
                        desc: 'Description of technical capability...',
                        priority: (settings.capabilities?.length || 0) + 1
                      };
                      updateSetting('capabilities', [...(settings.capabilities || []), newCap]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/40 text-cyan text-xs font-mono font-semibold hover:bg-cyan/20 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                  >
                    <Plus size={13} />
                    <span>add_capability()</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan mb-1.5">SECTION BADGE</label>
                    <input
                      type="text"
                      value={settings.capabilitiesBadge || '// Capabilities'}
                      onChange={(e) => updateSetting('capabilitiesBadge', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">SECTION TITLE</label>
                    <input
                      type="text"
                      value={settings.capabilitiesTitle || ''}
                      onChange={(e) => updateSetting('capabilitiesTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-cyan mb-1.5">SECTION SUBTITLE</label>
                  <textarea
                    rows={2}
                    value={settings.capabilitiesSubtitle || ''}
                    onChange={(e) => updateSetting('capabilitiesSubtitle', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono resize-none"
                  ></textarea>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-cyan">
                      CAPABILITY CARDS ({settings.capabilities?.length || 0} TOTAL)
                    </label>
                    <span className="text-[11px] text-muted">Lower priority number = appears earlier</span>
                  </div>

                  {(settings.capabilities || []).map((cap, idx) => (
                    <div key={cap.id || idx} className="p-4 rounded-xl border border-border bg-surface2/60 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-amber font-mono font-bold text-xs">Priority:</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={cap.priority ?? idx + 1}
                            onChange={(e) => {
                              const newCaps = [...(settings.capabilities || [])];
                              newCaps[idx] = { ...newCaps[idx], priority: parseInt(e.target.value, 10) || 1 };
                              updateSetting('capabilities', newCaps);
                            }}
                            className="w-16 px-2 py-1 rounded bg-ink border border-border text-amber font-mono font-bold text-xs text-center"
                          />
                        </div>
                        <input
                          type="text"
                          value={cap.title || ''}
                          onChange={(e) => {
                            const newCaps = [...(settings.capabilities || [])];
                            newCaps[idx] = { ...newCaps[idx], title: e.target.value };
                            updateSetting('capabilities', newCaps);
                          }}
                          className="flex-1 px-3 py-1.5 rounded bg-ink border border-border text-text font-mono font-semibold text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newCaps = (settings.capabilities || []).filter((_, i) => i !== idx);
                            updateSetting('capabilities', newCaps);
                          }}
                          className="p-1.5 rounded text-red hover:bg-red/10 transition-colors"
                          title="Delete capability"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={cap.desc || ''}
                        onChange={(e) => {
                          const newCaps = [...(settings.capabilities || [])];
                          newCaps[idx] = { ...newCaps[idx], desc: e.target.value };
                          updateSetting('capabilities', newCaps);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-muted font-mono text-xs resize-none"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. SUB-SETTING: BRANDING & ACADEMIC */}
            {activeSubTab === 'branding' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan mb-1.5">PRIMARY STACK (ABOUT BOX)</label>
                    <input
                      type="text"
                      value={settings.primaryStack || ''}
                      onChange={(e) => updateSetting('primaryStack', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">ACADEMIC CENTERS (ABOUT BOX)</label>
                    <input
                      type="text"
                      value={settings.academicCenters || ''}
                      onChange={(e) => updateSetting('academicCenters', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">BRAND SUBTITLE PILL (NAVBAR)</label>
                    <input
                      type="text"
                      value={settings.brandSubtitle || '2-person agency'}
                      onChange={(e) => updateSetting('brandSubtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-cyan mb-1.5">FOOTER TECH STACK TAGLINE</label>
                    <input
                      type="text"
                      value={settings.footerTechStack || ''}
                      onChange={(e) => updateSetting('footerTechStack', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. SUB-SETTING: HOMEPAGE SECTIONS */}
            {activeSubTab === 'homepage' && (
              <div className="space-y-4">
                {/* Featured Projects */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// FEATURED PROJECTS SECTION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">SECTION BADGE</label>
                      <input
                        type="text"
                        value={settings.featuredProjectsBadge || ''}
                        onChange={(e) => updateSetting('featuredProjectsBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">SECTION TITLE</label>
                      <input
                        type="text"
                        value={settings.featuredProjectsTitle || ''}
                        onChange={(e) => updateSetting('featuredProjectsTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Services Section */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// SERVICES PREVIEW SECTION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">SECTION BADGE</label>
                      <input
                        type="text"
                        value={settings.servicesSectionBadge || ''}
                        onChange={(e) => updateSetting('servicesSectionBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">SECTION TITLE</label>
                      <input
                        type="text"
                        value={settings.servicesSectionTitle || ''}
                        onChange={(e) => updateSetting('servicesSectionTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-cyan mb-1">SECTION SUBTITLE</label>
                    <textarea
                      rows={2}
                      value={settings.servicesSectionSubtitle || ''}
                      onChange={(e) => updateSetting('servicesSectionSubtitle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Team Section */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// TEAM PREVIEW SECTION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">SECTION BADGE</label>
                      <input
                        type="text"
                        value={settings.teamSectionBadge || ''}
                        onChange={(e) => updateSetting('teamSectionBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">SECTION TITLE</label>
                      <input
                        type="text"
                        value={settings.teamSectionTitle || ''}
                        onChange={(e) => updateSetting('teamSectionTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-cyan mb-1">SECTION SUBTITLE</label>
                    <textarea
                      rows={2}
                      value={settings.teamSectionSubtitle || ''}
                      onChange={(e) => updateSetting('teamSectionSubtitle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Technology Arsenal */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// TECHNOLOGY ARSENAL SECTION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">SECTION BADGE</label>
                      <input
                        type="text"
                        value={settings.techSectionBadge || ''}
                        onChange={(e) => updateSetting('techSectionBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">SECTION TITLE</label>
                      <input
                        type="text"
                        value={settings.techSectionTitle || ''}
                        onChange={(e) => updateSetting('techSectionTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-cyan mb-1">SECTION SUBTITLE</label>
                    <textarea
                      rows={2}
                      value={settings.techSectionSubtitle || ''}
                      onChange={(e) => updateSetting('techSectionSubtitle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Testimonials */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// TESTIMONIALS SECTION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">SECTION BADGE</label>
                      <input
                        type="text"
                        value={settings.testimonialsSectionBadge || ''}
                        onChange={(e) => updateSetting('testimonialsSectionBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">SECTION TITLE</label>
                      <input
                        type="text"
                        value={settings.testimonialsSectionTitle || ''}
                        onChange={(e) => updateSetting('testimonialsSectionTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-cyan mb-1">SECTION SUBTITLE</label>
                    <textarea
                      rows={2}
                      value={settings.testimonialsSectionSubtitle || ''}
                      onChange={(e) => updateSetting('testimonialsSectionSubtitle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* 5. SUB-SETTING: SUBPAGES HEADERS */}
            {activeSubTab === 'subpages' && (
              <div className="space-y-4">
                {/* About Page */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// ABOUT PAGE CUSTOMIZATION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">PAGE BADGE</label>
                      <input
                        type="text"
                        value={settings.aboutBadge || ''}
                        onChange={(e) => updateSetting('aboutBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">STORY TITLE</label>
                      <input
                        type="text"
                        value={settings.aboutStoryTitle || ''}
                        onChange={(e) => updateSetting('aboutStoryTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">PRINCIPLES BADGE</label>
                      <input
                        type="text"
                        value={settings.principlesBadge || ''}
                        onChange={(e) => updateSetting('principlesBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">PRINCIPLES TITLE</label>
                      <input
                        type="text"
                        value={settings.principlesTitle || ''}
                        onChange={(e) => updateSetting('principlesTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">MEET FOUNDERS TITLE</label>
                      <input
                        type="text"
                        value={settings.meetFoundersTitle || ''}
                        onChange={(e) => updateSetting('meetFoundersTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">MEET FOUNDERS SUBTITLE</label>
                      <input
                        type="text"
                        value={settings.meetFoundersSubtitle || ''}
                        onChange={(e) => updateSetting('meetFoundersSubtitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Services Page */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// SERVICES PAGE CUSTOMIZATION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">PAGE BADGE</label>
                      <input
                        type="text"
                        value={settings.servicesPageBadge || ''}
                        onChange={(e) => updateSetting('servicesPageBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">PAGE TITLE</label>
                      <input
                        type="text"
                        value={settings.servicesPageTitle || ''}
                        onChange={(e) => updateSetting('servicesPageTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-cyan mb-1">PAGE SUBTITLE</label>
                    <textarea
                      rows={2}
                      value={settings.servicesPageSubtitle || ''}
                      onChange={(e) => updateSetting('servicesPageSubtitle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Team Page */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// TEAM PAGE CUSTOMIZATION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">PAGE BADGE</label>
                      <input
                        type="text"
                        value={settings.teamPageBadge || ''}
                        onChange={(e) => updateSetting('teamPageBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">PAGE TITLE</label>
                      <input
                        type="text"
                        value={settings.teamPageTitle || ''}
                        onChange={(e) => updateSetting('teamPageTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">ADVANTAGE SECTION BADGE</label>
                      <input
                        type="text"
                        value={settings.advantageBadge || ''}
                        onChange={(e) => updateSetting('advantageBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">ADVANTAGE SECTION TITLE</label>
                      <input
                        type="text"
                        value={settings.advantageTitle || ''}
                        onChange={(e) => updateSetting('advantageTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Page */}
                <div className="p-4 rounded-xl border border-border bg-surface2/40 space-y-3">
                  <p className="text-amber font-bold">// CONTACT PAGE CUSTOMIZATION</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-cyan mb-1">PAGE BADGE</label>
                      <input
                        type="text"
                        value={settings.contactBadge || ''}
                        onChange={(e) => updateSetting('contactBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">PAGE TITLE</label>
                      <input
                        type="text"
                        value={settings.contactTitle || ''}
                        onChange={(e) => updateSetting('contactTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">FORM TITLE</label>
                      <input
                        type="text"
                        value={settings.contactFormTitle || ''}
                        onChange={(e) => updateSetting('contactFormTitle', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan mb-1">COMMITMENTS BOX BADGE</label>
                      <input
                        type="text"
                        value={settings.commitmentsBadge || ''}
                        onChange={(e) => updateSetting('commitmentsBadge', e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-cyan mb-1">PAGE SUBTITLE</label>
                    <textarea
                      rows={2}
                      value={settings.contactSubtitle || ''}
                      onChange={(e) => updateSetting('contactSubtitle', e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-ink border border-border text-text font-mono resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* 6. SUB-SETTING: COMMITMENTS */}
            {activeSubTab === 'commitments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-text text-sm">
                      Studio Commitments (Contact Page Sidebar)
                    </h4>
                    <p className="text-[11px] text-muted">
                      Guarantees displayed in the inquiry panel.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSetting('commitments', [
                        ...(settings.commitments || []),
                        'New client service guarantee'
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber/10 border border-amber/40 text-amber text-xs font-mono font-semibold hover:bg-amber/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>add_commitment()</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(settings.commitments || []).map((comm, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={typeof comm === 'string' ? comm : comm.text || ''}
                        onChange={(e) => {
                          const newComm = [...(settings.commitments || [])];
                          newComm[idx] = e.target.value;
                          updateSetting('commitments', newComm);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-surface2 border border-border text-text font-mono text-xs focus:border-amber"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newComm = (settings.commitments || []).filter((_, i) => i !== idx);
                          updateSetting('commitments', newComm);
                        }}
                        className="p-2 rounded-lg text-red hover:bg-red/10 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. SUB-SETTING: PRINCIPLES & VALUES */}
            {activeSubTab === 'principles' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-text text-sm">
                      Core Studio Values / Principles (About Page)
                    </h4>
                    <p className="text-[11px] text-muted">
                      Four pillars of engineering discipline displayed on /about.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSetting('values', [
                        ...(settings.values || []),
                        { title: 'New Core Principle', desc: 'Description of studio standard...' }
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/40 text-cyan text-xs font-mono font-semibold hover:bg-cyan/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>add_principle()</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(settings.values || []).map((val, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-surface2/50 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={val.title || ''}
                          onChange={(e) => {
                            const newVals = [...(settings.values || [])];
                            newVals[idx] = { ...newVals[idx], title: e.target.value };
                            updateSetting('values', newVals);
                          }}
                          className="flex-1 px-3 py-1.5 rounded bg-ink border border-border text-text font-mono font-bold text-xs focus:border-amber"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVals = (settings.values || []).filter((_, i) => i !== idx);
                            updateSetting('values', newVals);
                          }}
                          className="p-1.5 rounded text-red hover:bg-red/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={val.desc || ''}
                        onChange={(e) => {
                          const newVals = [...(settings.values || [])];
                          newVals[idx] = { ...newVals[idx], desc: e.target.value };
                          updateSetting('values', newVals);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-muted font-mono text-xs resize-none focus:border-amber"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. SUB-SETTING: ADVANTAGES */}
            {activeSubTab === 'advantages' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-text text-sm">
                      Founder Advantages (Team Page)
                    </h4>
                    <p className="text-[11px] text-muted">
                      "Why Working Directly With Founders Wins" cards on /team.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSetting('advantages', [
                        ...(settings.advantages || []),
                        { title: 'New Studio Advantage', desc: 'Why working with us is superior...' }
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber/10 border border-amber/40 text-amber text-xs font-mono font-semibold hover:bg-amber/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>add_advantage()</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(settings.advantages || []).map((adv, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-surface2/50 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={adv.title || ''}
                          onChange={(e) => {
                            const newAdvs = [...(settings.advantages || [])];
                            newAdvs[idx] = { ...newAdvs[idx], title: e.target.value };
                            updateSetting('advantages', newAdvs);
                          }}
                          className="flex-1 px-3 py-1.5 rounded bg-ink border border-border text-text font-mono font-bold text-xs focus:border-amber"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newAdvs = (settings.advantages || []).filter((_, i) => i !== idx);
                            updateSetting('advantages', newAdvs);
                          }}
                          className="p-1.5 rounded text-red hover:bg-red/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={adv.desc || ''}
                        onChange={(e) => {
                          const newAdvs = [...(settings.advantages || [])];
                          newAdvs[idx] = { ...newAdvs[idx], desc: e.target.value };
                          updateSetting('advantages', newAdvs);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-muted font-mono text-xs resize-none focus:border-amber"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. SUB-SETTING: FAQS */}
            {activeSubTab === 'faqs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-text text-sm">
                      Frequently Asked Questions (Services Page)
                    </h4>
                    <p className="text-[11px] text-muted">
                      Client Q&A displayed on /services.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSetting('faqs', [
                        ...(settings.faqs || []),
                        { q: 'New Frequently Asked Question?', a: 'Detailed answer from the engineering team.' }
                      ]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/40 text-cyan text-xs font-mono font-semibold hover:bg-cyan/20 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={13} />
                    <span>add_faq()</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(settings.faqs || []).map((faq, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-surface2/50 space-y-2.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={faq.q || ''}
                          onChange={(e) => {
                            const newFaqs = [...(settings.faqs || [])];
                            newFaqs[idx] = { ...newFaqs[idx], q: e.target.value };
                            updateSetting('faqs', newFaqs);
                          }}
                          className="flex-1 px-3 py-1.5 rounded bg-ink border border-border text-text font-mono font-bold text-xs focus:border-amber"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newFaqs = (settings.faqs || []).filter((_, i) => i !== idx);
                            updateSetting('faqs', newFaqs);
                          }}
                          className="p-1.5 rounded text-red hover:bg-red/10 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={faq.a || ''}
                        onChange={(e) => {
                          const newFaqs = [...(settings.faqs || [])];
                          newFaqs[idx] = { ...newFaqs[idx], a: e.target.value };
                          updateSetting('faqs', newFaqs);
                        }}
                        className="w-full px-3 py-1.5 rounded bg-ink border border-border text-muted font-mono text-xs resize-none focus:border-amber"
                      ></textarea>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. SUB-SETTING: PROMO CODES & DISCOUNT OFFERS */}
            {activeSubTab === 'discounts' && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-amber/10 border border-amber/30 space-y-1">
                  <div className="flex items-center gap-2 text-amber font-bold">
                    <Tag size={16} />
                    <span>Project Inquiry Promo & Discount Configuration</span>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">
                    Configure the active promo code accepted on the Project Inquiry Form. When clients enter this code, they receive the designated percentage discount on their inquiry.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Promo Code String */}
                  <div>
                    <label className="block text-muted text-[11px] uppercase tracking-wider mb-1">
                      Active Promo Code (Case-Insensitive) *
                    </label>
                    <input
                      type="text"
                      value={settings.promoCode ?? 'syntaxStudio'}
                      onChange={(e) => updateSetting('promoCode', e.target.value.trim())}
                      className="w-full px-3 py-2 rounded bg-surface2 border border-border text-amber font-mono font-bold text-sm focus:border-amber"
                    />
                    <p className="text-[10px] text-muted mt-1">Default code: syntaxStudio</p>
                  </div>

                  {/* Discount Percentage */}
                  <div>
                    <label className="block text-muted text-[11px] uppercase tracking-wider mb-1">
                      Discount Percentage (%) *
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={settings.discountPercentage ?? 10}
                        onChange={(e) => updateSetting('discountPercentage', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-3 py-2 rounded bg-surface2 border border-border text-cyan font-mono font-bold text-sm focus:border-amber"
                      />
                      <span className="text-cyan font-bold text-base">%</span>
                    </div>
                    <p className="text-[10px] text-muted mt-1">Default discount: 10%</p>
                  </div>
                </div>

                {/* Discount Offer Title / Description */}
                <div>
                  <label className="block text-muted text-[11px] uppercase tracking-wider mb-1">
                    Offer Badge / Discount Label
                  </label>
                  <input
                    type="text"
                    value={settings.discountLabel ?? '10% Special Studio Discount'}
                    onChange={(e) => updateSetting('discountLabel', e.target.value)}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono text-xs focus:border-amber"
                  />
                </div>

                {/* Offer Explanation / Terms */}
                <div>
                  <label className="block text-muted text-[11px] uppercase tracking-wider mb-1">
                    Promotional Terms / Description
                  </label>
                  <textarea
                    rows={2}
                    value={settings.promoDescription ?? 'Enter code syntaxStudio to apply a 10% courtesy discount across our engineering & architecture quote.'}
                    onChange={(e) => updateSetting('promoDescription', e.target.value)}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono text-xs resize-none focus:border-amber"
                  ></textarea>
                </div>

                {/* Active Status Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface2/40">
                  <div>
                    <p className="font-semibold text-text text-xs">Enable Promo Code on Inquiry Form</p>
                    <p className="text-[11px] text-muted">
                      When enabled, clients can enter this code in the Project Inquiry form to apply the discount.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.promoActive !== false}
                      onChange={(e) => updateSetting('promoActive', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-surface peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-ink after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-muted peer-checked:after:bg-ink after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber border border-border"></div>
                  </label>
                </div>
              </div>
            )}

            {/* 11. SUB-SETTING: CUSTOM SECTIONS & ADDITIONAL SETTINGS */}
            {activeSubTab === 'custom' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-cyan/10 border border-cyan/30">
                  <div>
                    <h4 className="font-display font-bold text-text text-sm">
                      Custom Settings Sections
                    </h4>
                    <p className="text-[11px] text-muted">
                      Add new custom sections (e.g. Social Handles, SEO Metadata, Compliance, API Keys) and dynamic settings fields.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSectionModal(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-amber text-ink text-xs font-mono font-bold hover:bg-amber/90 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>New Section</span>
                    </button>
                  </div>
                </div>

                {/* Render All Custom Sections */}
                {(settings.customSections || []).length > 0 ? (
                  <div className="space-y-6">
                    {(settings.customSections || []).map((sec) => (
                      <div key={sec.id} className="p-5 rounded-xl border border-border bg-surface2/40 space-y-4">
                        <div className="flex items-center justify-between border-b border-border/60 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded bg-amber/15 text-amber">
                                <FolderPlus size={14} />
                              </span>
                              <h5 className="font-display font-bold text-text text-sm">{sec.name}</h5>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-surface border border-border text-muted">
                                {(sec.fields || []).length} fields
                              </span>
                            </div>
                            {sec.description && (
                              <p className="text-[11px] text-muted mt-0.5">{sec.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setTargetSectionId(sec.id);
                                setShowAddFieldModal(true);
                              }}
                              className="px-2.5 py-1 rounded text-[11px] font-mono bg-cyan/10 border border-cyan/30 text-cyan hover:bg-cyan/20 transition-all flex items-center gap-1"
                            >
                              <Plus size={12} />
                              <span>Add Field</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomSection(sec.id)}
                              className="p-1.5 rounded text-red hover:bg-red/10 transition-colors"
                              title="Delete section"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Fields inside this section */}
                        <div className="space-y-3">
                          {(sec.fields || []).map((field) => (
                            <div key={field.id} className="p-3 rounded-lg bg-surface border border-border/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-cyan font-bold">{field.label}</span>
                                  <span className="text-[10px] font-mono text-muted bg-surface2 px-1.5 py-0.5 rounded">
                                    key: {field.key}
                                  </span>
                                  <span className="text-[10px] font-mono text-amber bg-amber/10 px-1.5 py-0.5 rounded">
                                    {field.type}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomField(sec.id, field.id)}
                                  className="text-red hover:text-red/80 p-1"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {field.type === 'textarea' ? (
                                <textarea
                                  rows={2}
                                  value={field.value || ''}
                                  onChange={(e) => handleUpdateCustomFieldValue(sec.id, field.id, e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-surface2 border border-border text-xs text-text font-mono resize-none focus:border-amber"
                                ></textarea>
                              ) : (
                                <input
                                  type={field.type === 'number' ? 'number' : 'text'}
                                  value={field.value || ''}
                                  onChange={(e) => handleUpdateCustomFieldValue(sec.id, field.id, e.target.value)}
                                  className="w-full px-3 py-1.5 rounded bg-surface2 border border-border text-xs text-text font-mono focus:border-amber"
                                />
                              )}
                            </div>
                          ))}

                          {(sec.fields || []).length === 0 && (
                            <div className="text-center py-4 text-xs font-mono text-muted border border-dashed border-border rounded-lg">
                              No fields in this section yet. Click "+ Add Field" above to add settings.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl font-mono text-xs text-muted space-y-3">
                    <FolderPlus size={32} className="mx-auto text-muted/40" />
                    <p className="text-text font-semibold">No custom settings sections added yet</p>
                    <p className="max-w-md mx-auto">
                      Need custom parameters for SEO, social links, tracking IDs, or new site features? Click the button below to create your first custom section.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddSectionModal(true)}
                      className="px-4 py-2 rounded-lg bg-amber text-ink font-bold hover:bg-amber/90 transition-all inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Create New Section</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Form Save Action */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted text-[11px]">
                <Info size={13} className="text-cyan" />
                <span>Changes will be saved to Cloud Firestore and published instantly.</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-amber text-ink font-bold hover:bg-amber/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-md active:scale-95"
              >
                <Save size={14} />
                <span>{saving ? 'saving_studio_settings()...' : 'save_studio_settings()'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* MODAL: Create New Custom Section */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-surface space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-display font-bold text-text text-base flex items-center gap-2">
                <FolderPlus size={16} className="text-amber" />
                <span>Create New Settings Section</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                className="text-muted hover:text-text"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomSection} className="space-y-4">
              <div>
                <label className="block text-cyan mb-1.5">SECTION NAME *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Social Profiles, SEO Metadata, Compliance"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono focus:border-amber"
                />
              </div>

              <div>
                <label className="block text-cyan mb-1.5">DESCRIPTION (OPTIONAL)</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of what this section manages..."
                  value={newSectionDesc}
                  onChange={(e) => setNewSectionDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono resize-none focus:border-amber"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-4 py-2 rounded bg-surface2 border border-border text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-amber text-ink font-bold hover:bg-amber/90"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Custom Setting Field */}
      {showAddFieldModal && (
        <div className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-surface space-y-4 font-mono text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h4 className="font-display font-bold text-text text-base flex items-center gap-2">
                <PlusCircle size={16} className="text-cyan" />
                <span>Add Custom Setting Field</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddFieldModal(false)}
                className="text-muted hover:text-text"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomField} className="space-y-4">
              <div>
                <label className="block text-cyan mb-1.5">ASSIGN TO SECTION *</label>
                <select
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono"
                >
                  {(settings.customSections || []).map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                  {(settings.customSections || []).length === 0 && (
                    <option value="default">General Additional Settings (Auto-created)</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-cyan mb-1.5">SETTING LABEL *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LinkedIn Company Page URL"
                  value={newFieldData.label}
                  onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono focus:border-amber"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-cyan mb-1.5">SETTING KEY (SLUG) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. linkedin_url"
                    value={newFieldData.key}
                    onChange={(e) => setNewFieldData({ ...newFieldData, key: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono focus:border-amber"
                  />
                </div>
                <div>
                  <label className="block text-cyan mb-1.5">FIELD TYPE</label>
                  <select
                    value={newFieldData.type}
                    onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono"
                  >
                    <option value="text">Single Line Text</option>
                    <option value="textarea">Multi-line Text</option>
                    <option value="url">URL Link</option>
                    <option value="number">Numeric</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-cyan mb-1.5">INITIAL VALUE</label>
                <input
                  type="text"
                  placeholder="e.g. https://linkedin.com/company/syntax-studio"
                  value={newFieldData.value}
                  onChange={(e) => setNewFieldData({ ...newFieldData, value: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-surface2 border border-border text-text font-mono focus:border-amber"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 rounded bg-surface2 border border-border text-muted hover:text-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-cyan/20 border border-cyan/40 text-cyan font-bold hover:bg-cyan/30"
                >
                  Add Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
