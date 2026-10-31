import React from 'react';
import { ExternalLink, ArrowRight, Compass } from 'lucide-react';
import { TabType } from '../Navigation';
import { sounds } from '../../services/soundEffects';

interface ChatMessageContentProps {
  text: string;
  isUser?: boolean;
  onNavigateTab?: (tab: TabType) => void;
  className?: string;
}

/**
 * Robust clipboard copy function supporting both modern navigator.clipboard
 * and legacy execCommand fallback (for iframes, older webviews, or non-secure contexts).
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, attempting execCommand fallback:', err);
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('All copy fallbacks failed:', err);
    return false;
  }
}

const TAB_NAMES: Record<string, string> = {
  obd: 'OBD დიაგნოსტიკა',
  fines: 'საპატრულო ჯარიმები',
  parking: 'მუნიციპალური პარკინგი',
  exam: 'მართვის მოწმობის ბილეთები (2026)',
  service: 'სერვისების დღიური',
  map: 'რადარების რუკა',
  home: 'მთავარი გვერდი',
  garage: 'ავტოფარეხი',
  ai: 'AI მექანიკოსი',
  settings: 'პარამეტრები'
};

interface InlineToken {
  type: 'text' | 'link' | 'tab' | 'bold' | 'code';
  value?: string;
  label?: string;
  url?: string;
  tab?: TabType;
}

function parseInlineTokens(content: string): InlineToken[] {
  // Matches:
  // 1. Markdown link: [label](url) -> group 1,2,3
  // 2. Raw URL: https?://... or www.... -> group 4
  // 3. App Tab Hash: #(obd|fines|parking|exam|service|map|home|garage|settings|ai) -> group 5,6
  // 4. Bold: **text** -> group 7,8
  // 5. Inline Code: `code` -> group 9,10
  const regex = /(\[([^\]]+)\]\(([^)]+)\))|(https?:\/\/[^\s<)\]]+|www\.[^\s<)\]]+)|(#(obd|fines|parking|exam|service|map|home|garage|settings|ai))\b|(\*\*([^*]+)\*\*)|(`([^`]+)`)/gi;

  const tokens: InlineToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: content.substring(lastIndex, match.index)
      });
    }

    if (match[1]) {
      // Markdown link [label](url)
      const label = match[2];
      const rawUrl = match[3].trim();
      const tabMatch = rawUrl.match(/^#(obd|fines|parking|exam|service|map|home|garage|settings|ai)$/i);
      if (tabMatch) {
        tokens.push({
          type: 'tab',
          label,
          tab: tabMatch[1].toLowerCase() as TabType
        });
      } else {
        tokens.push({
          type: 'link',
          label,
          url: rawUrl.startsWith('www.') ? `https://${rawUrl}` : rawUrl
        });
      }
    } else if (match[4]) {
      // Raw URL
      let rawUrl = match[4];
      let trailingPunctuation = '';
      while (/[.,!?:;)]$/.test(rawUrl)) {
        trailingPunctuation = rawUrl.slice(-1) + trailingPunctuation;
        rawUrl = rawUrl.slice(0, -1);
      }
      tokens.push({
        type: 'link',
        label: rawUrl,
        url: rawUrl.startsWith('www.') ? `https://${rawUrl}` : rawUrl
      });
      if (trailingPunctuation) {
        tokens.push({
          type: 'text',
          value: trailingPunctuation
        });
      }
    } else if (match[5]) {
      // App tab hash #exam, #obd, etc.
      const tabName = match[6].toLowerCase() as TabType;
      tokens.push({
        type: 'tab',
        label: TAB_NAMES[tabName] ? `#${tabName} (${TAB_NAMES[tabName]})` : `#${tabName}`,
        tab: tabName
      });
    } else if (match[7]) {
      // Bold text **...**
      tokens.push({
        type: 'bold',
        value: match[8]
      });
    } else if (match[9]) {
      // Code `...`
      tokens.push({
        type: 'code',
        value: match[10]
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    tokens.push({
      type: 'text',
      value: content.substring(lastIndex)
    });
  }

  return tokens;
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({
  text,
  isUser = false,
  onNavigateTab,
  className = ''
}) => {
  const handleTabClick = (tab: TabType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sounds.playClick();

    if (onNavigateTab) {
      onNavigateTab(tab);
    }

    try {
      window.location.hash = '#' + tab;
      localStorage.setItem('autohub_active_tab', tab);
    } catch {}

    // Smooth scroll down to main content if needed
    setTimeout(() => {
      const mainEl = document.getElementById('main-content');
      if (mainEl) {
        const topOffset = 80;
        const targetTop = window.scrollY + mainEl.getBoundingClientRect().top - topOffset;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth'
        });
      }
    }, 80);
  };

  const handleExternalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
  };

  // Split lines to preserve structured paragraphs & lists
  const lines = text.split('\n');

  return (
    <div className={`select-text cursor-text space-y-1.5 leading-relaxed break-words font-sans ${className}`}>
      {lines.map((line, lineIdx) => {
        // Empty line becomes a clean spacer
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        const tokens = parseInlineTokens(line);

        // Check if line is a bullet item
        const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');

        return (
          <div
            key={lineIdx}
            className={`${isBullet ? 'pl-2 sm:pl-3 relative' : ''} text-xs sm:text-sm select-text`}
          >
            {tokens.map((token, tokIdx) => {
              switch (token.type) {
                case 'link': {
                  const href = token.url || '#';
                  const isInternalAnchor = href.startsWith('#');
                  if (isInternalAnchor) {
                    const tabKey = href.slice(1).toLowerCase() as TabType;
                    return (
                      <button
                        key={tokIdx}
                        type="button"
                        onClick={(e) => handleTabClick(tabKey, e)}
                        className={`inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-md transition-all mx-0.5 underline cursor-pointer ${
                          isUser
                            ? 'bg-white/20 text-gold hover:bg-white/30 decoration-gold'
                            : 'bg-amber-500/15 text-amber-700 hover:text-amber-900 hover:bg-amber-500/25 border border-amber-400/40 decoration-amber-600'
                        }`}
                        title={`გადასვლა: ${token.label || tabKey}`}
                      >
                        <Compass size={12} className="shrink-0" />
                        <span>{token.label}</span>
                        <ArrowRight size={11} className="shrink-0" />
                      </button>
                    );
                  }

                  return (
                    <a
                      key={tokIdx}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleExternalClick}
                      className={`inline-flex items-center gap-1 font-bold underline transition-colors mx-0.5 cursor-pointer ${
                        isUser
                          ? 'text-gold hover:text-amber-200 decoration-gold/60'
                          : 'text-blue-600 hover:text-blue-800 decoration-blue-400 hover:decoration-blue-600'
                      }`}
                      title={`${token.label} - ბმულის გახსნა ახალ ფანჯარაში`}
                    >
                      <span className="break-all">{token.label}</span>
                      <ExternalLink size={12} className="shrink-0 inline-block opacity-80" />
                    </a>
                  );
                }

                case 'tab': {
                  const tabKey = token.tab || 'home';
                  return (
                    <button
                      key={tokIdx}
                      type="button"
                      onClick={(e) => handleTabClick(tabKey, e)}
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg transition-all mx-1 cursor-pointer text-[11px] shadow-2xs ${
                        isUser
                          ? 'bg-gold text-slate-950 hover:bg-amber-300 font-black'
                          : 'bg-navy text-gold hover:bg-slate-800 border border-gold/40 font-mono font-black'
                      }`}
                      title={`გადასვლა: ${TAB_NAMES[tabKey] || tabKey}`}
                    >
                      <Compass size={11} className="shrink-0" />
                      <span>{token.label}</span>
                      <ArrowRight size={11} className="shrink-0 ml-0.5" />
                    </button>
                  );
                }

                case 'bold':
                  return (
                    <strong key={tokIdx} className="font-black">
                      {token.value}
                    </strong>
                  );

                case 'code':
                  return (
                    <code
                      key={tokIdx}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold mx-0.5 select-text ${
                        isUser
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 text-rose-600 border border-slate-200'
                      }`}
                    >
                      {token.value}
                    </code>
                  );

                case 'text':
                default:
                  return <span key={tokIdx} className="select-text">{token.value}</span>;
              }
            })}
          </div>
        );
      })}
    </div>
  );
};
