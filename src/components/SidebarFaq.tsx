import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, FileText, CheckCircle2, AlertTriangle, CreditCard, ShieldAlert, Globe, Sparkles } from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'official' | 'submission' | 'verification';
  question: string;
  answer: string;
  icon: React.ReactNode;
}

export default function SidebarFaq() {
  const [expandedId, setExpandedId] = useState<string | null>('faq-what-is');

  const faqs: FaqItem[] = [
    {
      id: 'faq-what-is',
      category: 'official',
      question: 'What is Sarkari Result?',
      answer: 'Sarkari Result : Find Latest Sarkari Job Vacancies And Sarkari Exam Results At Sarkariresult.Com.Cm. Get All The Information You Need On Govt Jobs And Online Form, Exam, Results, Admit Card In One Place.',
      icon: <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
    },
    {
      id: 'faq-official-web',
      category: 'official',
      question: 'What is the official website of Sarkari Result?',
      answer: 'Sarkariresult.com.cm is the official website of Sarkari Result since 2009.',
      icon: <Globe className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
    },
    {
      id: 'faq-check-jobs',
      category: 'official',
      question: 'How can I check the latest government job vacancies?',
      answer: 'You can visit our official Sarkari Result website which is sarkariresult.com.cm and navigate to the “Latest Jobs” section to check the latest government job vacancies.',
      icon: <FileText className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
    },
    {
      id: 'faq-correction',
      category: 'submission',
      question: 'How to fix spelling or DOB errors in submitted forms?',
      answer: 'Most recruitment boards (SSC, UPSC, RRB) open a dedicated "Correction Window" 3–5 days after online registration closes. If mistakes persist, email the official support team with your registration ID immediately.',
      icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
    },
    {
      id: 'faq-payment',
      category: 'submission',
      question: 'Money debited but payment status is still pending?',
      answer: 'Do not make a secondary payment immediately! Server-side synchronization often takes 24 to 48 hours. Log out and log back in to review the status, or check the bank verification status using your bank transaction reference ID.',
      icon: <CreditCard className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
    }
  ];

  const toggleFaq = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div id="sidebar-faq-section" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
      <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-gray-100">
        <div className="p-1.5 bg-blue-50 rounded-lg">
          <HelpCircle className="h-4 w-4 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-gray-900 tracking-tight uppercase">Help Desk & FAQs</h4>
          <p className="text-[10px] text-gray-400 font-semibold uppercase mt-0.5">Submissions & Verifications</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {faqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div 
              key={faq.id} 
              id={`faq-card-${faq.id}`}
              className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                isExpanded 
                  ? 'border-blue-100 bg-blue-50/20' 
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full text-left p-3 flex items-start justify-between gap-2.5 cursor-pointer focus:outline-none"
                aria-expanded={isExpanded}
                id={`faq-btn-${faq.id}`}
              >
                <div className="flex gap-2.5 pr-2">
                  {faq.icon}
                  <span className="text-xs font-bold text-gray-700 leading-snug">
                    {faq.question}
                  </span>
                </div>
                <span className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>

              <div 
                id={`faq-content-${faq.id}`}
                className={`transition-all duration-200 ease-in-out ${
                  isExpanded ? 'max-h-64 opacity-100 border-t border-gray-100/50 p-3' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  {faq.answer}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                    faq.category === 'official'
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : faq.category === 'submission'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  }`}>
                    {faq.category}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold tracking-wider uppercase">
                    verified help tips
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
