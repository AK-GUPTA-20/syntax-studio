import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare } from 'lucide-react';
import { FaqSkeleton } from './SkeletonLoader';
import { Link } from 'react-router-dom';

export default function FaqAccordion({ customFaqs, faqs: faqsProp, loading = false }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (loading) {
    return <FaqSkeleton />;
  }

  const faqs = (faqsProp && faqsProp.length > 0)
    ? faqsProp
    : (customFaqs && customFaqs.length > 0 ? customFaqs : []);

  if (!faqs || faqs.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-border bg-surface text-center space-y-3 font-mono text-xs">
        <HelpCircle size={24} className="text-muted mx-auto" />
        <p className="text-text font-medium">No published FAQs at this moment.</p>
        <p className="text-muted text-[11px] font-sans">
          Have specific technical questions about your project scope or sprint timelines?
        </p>
        <Link
          to="/contact"
          className="inline-flex items-center gap-1.5 text-amber hover:underline pt-1"
        >
          <span>Ask our engineers directly →</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const questionText = faq.q || faq.question || '';
        const answerText = faq.a || faq.answer || '';

        return (
          <div
            key={idx}
            className={`rounded-xl border transition-all ${
              isOpen
                ? 'bg-surface2/60 border-amber/50 shadow-md'
                : 'bg-surface border-border hover:border-border/80'
            }`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : idx)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-display font-semibold text-text text-base sm:text-lg"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className={isOpen ? 'text-amber' : 'text-cyan'} />
                <span>{questionText}</span>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted shrink-0 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-amber' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-muted font-sans leading-relaxed border-t border-border/40 animate-fade-in pl-11">
                {answerText}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
