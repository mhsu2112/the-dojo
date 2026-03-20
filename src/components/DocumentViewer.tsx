import React from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface DocumentViewerProps {
  tabs?: Tab[];
  content?: React.ReactNode;
  title?: string;
}

export default function DocumentViewer({ tabs, content, title }: DocumentViewerProps) {
  const [activeTab, setActiveTab] = React.useState(tabs?.[0]?.id || '');

  const activeContent = tabs?.find(t => t.id === activeTab)?.content || content;

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      {tabs && tabs.length > 1 && (
        <div className="flex border-b border-[#3a4258] bg-[#141820]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-mono border-r border-[#3a4258] transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#1a2030] text-[#c9a84c] border-b-2 border-b-[#c9a84c]'
                  : 'text-[#5a5f6e] hover:text-[#8a8f9e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Header bar */}
      {(title || (!tabs)) && (
        <div className="px-4 py-2 border-b border-[#3a4258] bg-[#141820]">
          <span className="text-xs font-mono text-[#5a5f6e] uppercase tracking-wider">
            {title || (tabs?.find(t => t.id === activeTab)?.label)}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 bg-[#0f1219]">
        <div className="document-body max-w-none">
          {activeContent}
        </div>
      </div>
    </div>
  );
}

// Helper components for document styling
export function DocTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="font-serif text-lg font-bold text-[#e8e6e1] mb-1">{children}</h1>;
}

export function DocMeta({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs text-[#5a5f6e] mb-4">{children}</p>;
}

export function DocSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="font-serif text-sm font-bold text-[#e8e6e1] mb-2 border-b border-[#252d3d] pb-1">
        <span className="font-mono text-[#c9a84c]">{num}. </span>{title}
      </h2>
      <div className="text-sm text-[#c8c5be] leading-relaxed font-serif">{children}</div>
    </div>
  );
}

export function DocPara({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-sm text-[#c8c5be] leading-relaxed font-serif">{children}</p>;
}

export function DocConfidential() {
  return (
    <div className="border border-[#c44536] px-3 py-1 mb-4 inline-block">
      <span className="font-mono text-xs text-[#c44536] uppercase tracking-widest">CONFIDENTIAL — EXAMINATION MATERIALS</span>
    </div>
  );
}
