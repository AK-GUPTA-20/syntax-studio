import React, { useState } from 'react';
import { Terminal as TerminalIcon, Copy, Check } from 'lucide-react';

export default function TerminalBox({ settings }) {
  const [activeTab, setActiveTab] = useState('studio');
  const [copied, setCopied] = useState(false);

  const agencyName = settings?.companyName || "Syntax Studio";
  const founders = settings?.founders || ["Akshat Gupta", "Vasu Singhal"];
  const location = settings?.location || "Remote / Uttar Pradesh, India";
  const status = settings?.heroAnnouncement || "Accepting new client contracts";
  const dsaCount = settings?.stats?.[0]?.value ? `${settings.stats[0].value} problems` : "850+ problems";
  const stack = settings?.technologies && settings.technologies.length > 0
    ? settings.technologies.slice(0, 5).map(t => t.name)
    : ["React", "Node.js", "Express", "Firebase", "PostgreSQL"];

  const teamList = settings?.terminalTeamOutput || (
    settings?.founders && settings.founders.length > 0
      ? settings.founders.map(f => `drwxr-xr-x  ${f.toLowerCase().replace(/\s+/g, '-')}  Co-Founder & Core Software Engineer (${settings?.academicCenters || 'CSE & IT'})`).join('\n')
      : `drwxr-xr-x  akshat-gupta  Lead Backend Architect (Galgotias CSE, 8.9 CGPA, 400+ DSA)\ndrwxr-xr-x  vasu-singhal  Lead Full-Stack / UI-UX (ABES IT, 8.1 CGPA, 1650+ LeetCode)`
  );

  const outputs = {
    studio: `~ cat studio.json
{
  "agency": "${agencyName}",
  "founders": ${JSON.stringify(founders)},
  "focus": "${settings?.tagline || 'Full-Stack Development & Distributed Systems'}",
  "headquarters": "${location}",
  "status": "${status}",
  "dsa_solved_aggregate": "${dsaCount}",
  "architecture_stack": ${JSON.stringify(stack)}
}`,
    status: `~ git status
On branch production
Your branch is up to date with 'origin/main'.

Changes to be committed:
  modified:   services/high-concurrency-api.js
  modified:   frontend/framer-motion-ui.tsx
  added:      deployments/cloud-firestore-rules

Recent commits:
  * 4a9f1b2 (HEAD -> main) feat: zero-latency caching via Redis pipeline
  * 8c2d9e0 feat: atomic double-entry ledger verification engine`,
    team: `~ ls -la founders/
${teamList}`
  };

  const copyText = () => {
    navigator.clipboard.writeText(outputs[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-2xl shadow-black/60 overflow-hidden font-mono text-xs">
      {/* Top Bar with Terminal Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface2/70">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF5F56]/80"></span>
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E]/80"></span>
          <span className="w-3 h-3 rounded-full bg-[#27C93F]/80"></span>
          <span className="text-muted ml-2 text-[11px]">syntax@agency: ~/studio</span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1">
          {['studio', 'status', 'team'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                activeTab === tab
                  ? 'bg-amber/15 text-amber border border-amber/30'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab}.sh
            </button>
          ))}
          <button
            onClick={copyText}
            className="p-1 rounded text-muted hover:text-text ml-2"
            title="Copy command output"
          >
            {copied ? <Check size={13} className="text-green" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Terminal Content Screen */}
      <div className="p-5 sm:p-6 bg-ink/90 min-h-[190px] overflow-x-auto text-[12px] sm:text-[13px] leading-relaxed">
        <pre className="text-text/90 whitespace-pre-wrap font-mono">
          {outputs[activeTab].split('\n').map((line, idx) => {
            if (line.startsWith('~')) {
              return (
                <div key={idx} className="text-amber font-semibold pb-1">
                  <span className="text-cyan">➜ </span>
                  {line}
                </div>
              );
            }
            if (line.includes('"agency"') || line.includes('"status"')) {
              return <div key={idx} className="text-green">{line}</div>;
            }
            if (line.includes('"founders"') || line.includes('"architecture_stack"')) {
              return <div key={idx} className="text-cyan">{line}</div>;
            }
            return <div key={idx} className="text-text/80">{line}</div>;
          })}
        </pre>
        <div className="mt-2 flex items-center gap-1.5 text-muted">
          <span className="text-amber">➜</span>
          <span>~</span>
          <span className="w-2 h-4 bg-amber cursor-blink"></span>
        </div>
      </div>
    </div>
  );
}
