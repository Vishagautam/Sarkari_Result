import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Info, Mail, Send, CheckCircle2, Award, AlertTriangle, Shield, UserCheck, BookOpen } from 'lucide-react';

interface ComplianceModalProps {
  initialTab: 'privacy' | 'terms' | 'about' | 'contact' | 'disclaimer';
  onClose: () => void;
}

export default function ComplianceModal({ initialTab, onClose }: ComplianceModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'about' | 'contact' | 'disclaimer'>(initialTab);
  
  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    
    setIsSubmitting(true);
    // Simulate API delivery
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col md:flex-row border border-slate-200 dark:border-slate-800">
        
        {/* Left Sidebar - Tabs */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
          <div>
            {/* Header branding */}
            <div className="flex items-center gap-2 mb-8">
              <span className="bg-[#1a237e] text-white font-black text-xs px-2.5 py-1 rounded-md">SR</span>
              <span className="text-slate-900 dark:text-white font-black text-sm tracking-tight">Sarkari Result™</span>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => { setActiveTab('privacy'); setFormSubmitted(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'privacy'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Privacy Policy</span>
              </button>

              <button
                onClick={() => { setActiveTab('terms'); setFormSubmitted(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'terms'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span>Terms & Conditions</span>
              </button>

              <button
                onClick={() => { setActiveTab('about'); setFormSubmitted(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'about'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Info className="h-4 w-4 shrink-0" />
                <span>About Us</span>
              </button>

              <button
                onClick={() => { setActiveTab('contact'); setFormSubmitted(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'contact'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span>Contact Us</span>
              </button>

              <button
                onClick={() => { setActiveTab('disclaimer'); setFormSubmitted(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'disclaimer'
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                }`}
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Disclaimer / Safe Harbor</span>
              </button>
            </nav>
          </div>

          <div className="hidden md:block pt-6 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block mb-1">TRADEMARK APP</span>
            <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
              No. 6921399 (Cl. 35) & 6921398 (Cl. 41). Registered Controller General of Patents, Govt of India.
            </p>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
          
          {/* Header Close button */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800/60 shrink-0">
            <h3 className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-wide flex items-center gap-2">
              {activeTab === 'privacy' && <><Shield className="h-4 w-4 text-indigo-600" /> Privacy Policy Document</>}
              {activeTab === 'terms' && <><FileText className="h-4 w-4 text-indigo-600" /> Terms and Conditions</>}
              {activeTab === 'about' && <><BookOpen className="h-4 w-4 text-indigo-600" /> About Sarkari Result™</>}
              {activeTab === 'contact' && <><Mail className="h-4 w-4 text-indigo-600" /> Secure Contact Office</>}
              {activeTab === 'disclaimer' && <><AlertTriangle className="h-4 w-4 text-amber-500" /> Disclaimer Notice</>}
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content panel */}
          <div className="flex-1 overflow-y-auto p-8 text-xs leading-relaxed text-slate-600 dark:text-slate-300 space-y-4">
            
            {/* PRIVACY POLICY TAB */}
            {activeTab === 'privacy' && (
              <div className="space-y-4 font-medium normal-case">
                <p className="text-sm text-slate-900 dark:text-white font-black">Information We Collect and AdSense Compliance</p>
                <p>
                  At Sarkari Result™ (accessible via sarkariresult.com.cm), the privacy of our visitors is of extreme importance to us. This privacy policy document outlines the types of personal information received and collected by our servers and how it is protected.
                </p>

                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/60 dark:border-indigo-900/40 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-wider flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 fill-indigo-100 dark:fill-indigo-950" /> Google AdSense & DoubleClick Cookie Disclosure
                  </span>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    Google, as a third-party vendor, uses cookies to serve advertisements on this website. Google&apos;s use of the DART cookie enables it to serve ads to our users based on their visit to our site and other sites on the Internet. Users may opt-out of the use of the DART cookie by visiting the Google Ad and Content Network privacy policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">https://policies.google.com/technologies/ads</a>.
                  </p>
                </div>

                <p className="font-bold text-slate-900 dark:text-white">Log Files and Analytics</p>
                <p>
                  Like many other Web sites, we make use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user&apos;s movement around the site, and gather demographic information. IP addresses and other such information are not linked to any information that is personally identifiable.
                </p>

                <p className="font-bold text-slate-900 dark:text-white">Educational Profiles & AI Matches</p>
                <p>
                  When you use our interactive AI Career Eligibility tool, your entered profile fields (e.g., age, category, qualification stream) are held purely in local volatile state to generate immediate matching results. We do not transmit or sell your individual career qualifications to third parties.
                </p>

                <p className="font-bold text-slate-900 dark:text-white">Consent</p>
                <p>
                  By using our website, you hereby consent to our privacy policy and agree to its terms.
                </p>
              </div>
            )}

            {/* TERMS & CONDITIONS TAB */}
            {activeTab === 'terms' && (
              <div className="space-y-4 font-medium normal-case">
                <p className="text-sm text-slate-900 dark:text-white font-black">Usage Terms for Sarkari Result™ Educational Reference</p>
                <p>
                  Welcome to Sarkari Result™ (sarkariresult.com.cm). By accessing and using this portal, you accept and agree to comply with the following terms, conditions, and trademark notices.
                </p>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-start gap-3">
                  <Award className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400 tracking-wider">Controller General of Patents, Designs & Trademarks</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Sarkari Result™ is a registered trademark since 2009. Trademark applications for “Sarkari Result” have been accepted and advertised by the Controller General of Patents, Designs and Trade Marks, Government of India, under official Application Nos. <strong className="text-slate-800 dark:text-slate-200">6921399 (Class 35)</strong> and <strong className="text-slate-800 dark:text-slate-200">6921398 (Class 41)</strong>.
                    </p>
                  </div>
                </div>

                <p className="font-bold text-slate-900 dark:text-white">General Informational Purpose Only</p>
                <p>
                  The content, online notifications, selection syllabus sheets, and exam key solutions provided on this website are compiled for general educational reference and convenience of candidates. The information displayed is sourced from official public notifications issued by central or state government recruitment agencies. While we make every attempt to preserve maximum accuracy, we cannot guarantee the exact authenticity or final legal validity of the uploaded sheets.
                </p>

                <p className="font-bold text-slate-900 dark:text-white">Verification Mandate</p>
                <p>
                  Users must double-check all timelines, qualifications, application links, and written notification documents against the primary official websites of the respective department or board (e.g. UPSC, SSC, RRB, NTA) before executing application fee payments or completing form registrations. Sarkari Result™ is not legally liable for errors, discrepancies, or subsequent registration updates.
                </p>
              </div>
            )}

            {/* ABOUT US TAB */}
            {activeTab === 'about' && (
              <div className="space-y-4 font-medium normal-case">
                <p className="text-sm text-slate-900 dark:text-white font-black">Official About Sarkari Result™ — Serving Aspirants Since 2009</p>
                <p>
                  Sarkari Result™ (sarkariresult.com.cm) is India&apos;s premier online educational reference portal, dedicated to providing up-to-date notifications on Central Government Jobs, State Public Service Commission vacancies, admit cards, answer keys, results, and admissions.
                </p>

                <p>
                  Established in 2009, Sarkari Result™ has emerged as a household brand name among millions of career seekers across Indian states. Our mission is to democratize government employment access by transforming complex, lengthy recruitment notifications into highly readable, structured, and structured summaries.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/40 dark:border-indigo-900/30 rounded-2xl">
                    <span className="font-bold text-slate-950 dark:text-white block mb-1">Sarkari Mitra AI Assistant</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Our latest natural-language chatbot answers career eligibility and registration questions instantly using advanced language matching technologies.
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/40 dark:border-emerald-900/30 rounded-2xl">
                    <span className="font-bold text-slate-950 dark:text-white block mb-1">Dynamic Eligibility Matching</span>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Candidates can enter their qualification level, age, and caste category to instantly see exactly which active UPSC, SSC, and Railway jobs they qualify for.
                    </p>
                  </div>
                </div>

                <p className="font-bold text-slate-900 dark:text-white">Our Values</p>
                <p>
                  We strive for clean design, responsive user experience, high transparency, and full safety of aspirant profiles. Sarkari Result™ remains independent, objective, and supportive of the Indian digital empowerment initiative.
                </p>
              </div>
            )}

            {/* CONTACT US TAB */}
            {activeTab === 'contact' && (
              <div className="space-y-4 normal-case">
                <p className="text-sm text-slate-900 dark:text-white font-black">Get in Touch with Sarkari Result™ Support</p>
                <p className="font-medium">
                  Have you detected a typo in our listings, or did a recruitment portal link change? Use this secure feedback form to submit updates or general queries directly to our technical desk.
                </p>

                {formSubmitted ? (
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl text-center space-y-3 animate-scaleIn">
                    <div className="bg-emerald-100 dark:bg-emerald-900/40 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-400">Feedback Transmitted Successfully!</h4>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold leading-relaxed max-w-md mx-auto">
                      Thank you for contacting Sarkari Result. Your report has been cataloged. Our editors will review the referenced department page and apply the correction within 24 to 48 business hours.
                    </p>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="mt-2 text-[10px] font-black text-indigo-600 hover:text-indigo-500 hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      Submit another query
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitContact} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Rajesh Kumar"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Your Email Address</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g., rajesh@gmail.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Subject / Correction Area</label>
                      <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g., Typo in SSC MTS 2026 Age Criteria"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Your Detailed Message</label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Please paste the official link and describe the issue..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-xs font-semibold"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[10px] text-slate-400 font-semibold italic">
                        Official desk: <span className="font-bold text-slate-500 dark:text-slate-300">support@sarkariresult.com.cm</span>
                      </p>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>Transmitting...</>
                        ) : (
                          <>
                            <span>Transmit Message</span>
                            <Send className="h-3.5 w-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* DISCLAIMER TAB */}
            {activeTab === 'disclaimer' && (
              <div className="space-y-4 font-medium normal-case">
                <p className="text-sm text-slate-900 dark:text-white font-black">Official Legal Disclaimer & Safe Harbor Statement</p>
                
                <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Non-Affiliation Notice</span>
                    <p className="text-[11px] leading-relaxed text-amber-850 dark:text-amber-300">
                      Sarkari Result™ (sarkariresult.com.cm) is NOT associated, affiliated, endorsed, or sponsored by any government department, public sector undertaking, or central/state recruitment boards. This is a private educational news and career guidance aggregator. All logos, trademark identifiers, and department acronyms are intellectual properties of their respective statutory bodies, used here purely for nomination context and public educational illustration.
                    </p>
                  </div>
                </div>

                <p className="font-bold text-slate-900 dark:text-white">Safe Harbor for Career Seekers</p>
                <p>
                  All content, text sheets, form deadlines, age relaxed lists, and answer key PDFs hosted on sarkariresult.com.cm are sourced directly from public announcements, newspapers, gazette alerts, and respective department websites. While our team performs strict audits of every post, the rapid nature of state timelines means rules can shift without prior alert.
                </p>

                <p className="font-bold text-slate-900 dark:text-white">Strict Legal Bar</p>
                <p>
                  No user of our website can rely upon our compiled content for any legally binding purposes. It is hereby advised and mandated to all visitors to verify and confirm any eligibility thresholds, reservation matrices, exam codes, and center listings directly from the official notification of the concerning recruitment department before final execution.
                </p>
              </div>
            )}

          </div>

          {/* Footer of modal */}
          <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Sarkari Result™ Compliance Centre
            </span>
            <span className="text-[9px] text-slate-400 font-extrabold bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
              v2.8 SECURE
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
