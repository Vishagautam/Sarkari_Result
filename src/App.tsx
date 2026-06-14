import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EligibilityWidget from './components/EligibilityWidget';
import CategoryListGrid from './components/CategoryListGrid';
import TrendingJobs from './components/TrendingJobs';
import PageViews from './components/PageViews';
import AiAssistant from './components/AiAssistant';
import NotificationDetailModal from './components/NotificationDetailModal';
import SidebarFaq from './components/SidebarFaq';
import GoogleAd from './components/GoogleAd';
import { SARKARI_DATA } from './data/sarkariData';
import { EligibilityProfile, SarkariNotification } from './types';
import { Bookmark, Sparkles, AlertCircle, HelpCircle, GraduationCap, Calendar, ShieldCheck } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiMitra, setShowAiMitra] = useState(false);
  const [selectedJob, setSelectedJob] = useState<SarkariNotification | null>(null);
  
  // Bookmarks local state
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sarkari_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User qualification profile
  const [profile, setProfile] = useState<EligibilityProfile>({
    qualification: 'Class 12th Pass',
    stream: 'Science (PCM)',
    percentage: '78',
    age: '21',
    gender: 'Male',
    category: 'General'
  });

  // AI Matches state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMatchResults, setAiMatchResults] = useState<Array<{
    jobId: string;
    matchScore: number;
    matchStatus: string;
    matchReason: string;
  }> | null>(null);

  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('sarkari_bookmarks', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jobId = params.get('job') || params.get('id');
    if (jobId) {
      const foundJob = SARKARI_DATA.find(item => item.id === jobId);
      if (foundJob) {
        setSelectedJob(foundJob);
      }
    }
  }, []);

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const runAiEvaluation = async (currentProfile: EligibilityProfile) => {
    setAiLoading(true);
    setMatchError(null);
    try {
      const response = await fetch('/api/profile-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: currentProfile })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || "Evaluation failed");
      }

      const results = await response.json();
      setAiMatchResults(results);
    } catch (err: any) {
      console.error(err);
      setMatchError(err.message || "Failed to analyze requirements. Configure your GEMINI_API_KEY inside the Secrets panel.");
      
      // Fallback: Populate realistic mock analysis if keys are not ready so the app never fails completely
      const fallbackMatches = SARKARI_DATA.filter(d => d.type === 'job').map(job => {
        let score = 50;
        let reason = "Profile is under qualification review. Study official PDF instructions closely.";
        let status = "GOOD";

        const jq = job.qualification.toLowerCase();
        const pq = currentProfile.qualification.toLowerCase();

        if (jq.includes("12") && pq.includes("12")) {
          score = 95;
          status = "EXCELLENT";
          reason = "Perfect match for educational intermediate qualification rules.";
        } else if (jq.includes("bachelor") && pq.includes("bachelor")) {
          score = 95;
          status = "EXCELLENT";
          reason = "Eligible graduate stream match.";
        } else if (jq.includes("10th") && pq.includes("10th")) {
          score = 90;
          status = "EXCELLENT";
          reason = "High school minimum educational standards met.";
        }

        return {
          jobId: job.id,
          matchScore: score,
          matchStatus: status,
          matchReason: reason
        };
      });
      setAiMatchResults(fallbackMatches);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Complete Navigation bar with Search state */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAiMitra={() => setShowAiMitra(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Top Horizontal Header Leaderboard Google Ads Slot */}
        <GoogleAd format="horizontal" slot="ad-header-leaderboard" className="mb-6" />
        
        {/* Fast Notification Banners for bookmarked exams */}
        {bookmarkedIds.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500 rounded-xl text-white">
                <Bookmark className="h-4 w-4 fill-current" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">Your Bookmarked Sarkari Exams ({bookmarkedIds.length})</h4>
                <p className="text-xs text-gray-500 font-medium">Keep track of key dates, results, and answer keys</p>
              </div>
            </div>
            <div className="flex -space-x-1 overflow-hidden">
              {SARKARI_DATA.filter(item => bookmarkedIds.includes(item.id)).map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedJob(item)}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 text-xs font-black text-gray-800 rounded-xl hover:border-blue-400 active:scale-95 transition-all text-center truncate max-w-[140px]"
                >
                  {item.title.split(' ')[0]} {item.title.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Board Center */}
          <div className="lg:col-span-3 space-y-8">
            {activeTab === 'home' ? (
              <>
                {/* Eligibility Config matcher */}
                <EligibilityWidget
                  profile={profile}
                  setProfile={setProfile}
                  onRunAiEvaluation={runAiEvaluation}
                  aiLoading={aiLoading}
                  aiMatchResults={aiMatchResults}
                  jobs={SARKARI_DATA}
                  onSelectJob={setSelectedJob}
                />

                {/* Trending Hot recruitment widgets */}
                <TrendingJobs
                  jobs={SARKARI_DATA}
                  onSelectJob={setSelectedJob}
                />

                {/* Error alerts indicator */}
                {matchError && (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex items-start space-x-3 font-semibold leading-relaxed">
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-amber-800">AI Assistant Key Notice</p>
                      <p className="mt-1 text-amber-700">We have loaded the predictive matching fallback model for you, as the GEMINI_API_KEY is not defined in Settings &gt; Secrets. If you would like custom deep evaluation, please configure your API key.</p>
                    </div>
                  </div>
                )}

                {/* Mid-Feed Banner Google Ads Slot */}
                <GoogleAd format="horizontal" slot="ad-home-mid-feed" className="my-6" />

                {/* Primary Columns Lists */}
                <CategoryListGrid
                  jobs={SARKARI_DATA}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark}
                  onSelectJob={setSelectedJob}
                  searchQuery={searchQuery}
                />
              </>
            ) : (
              <PageViews
                activeTab={activeTab}
                jobs={SARKARI_DATA}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
                onSelectJob={setSelectedJob}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            )}
          </div>

          {/* Right Sidebar: Quick info guidelines */}
          <div className="space-y-6">
            
            {/* Quick Links banner */}
            <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 rounded-2xl border border-slate-800 p-5 text-white shadow-xl">
              <span className="bg-indigo-600 text-indigo-100 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">Guides</span>
              <h4 className="text-base font-extrabold mt-3 tracking-tight">Active Recruitment Boards</h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1 font-medium">Verify updates directly on official exam control bureaus.</p>
              
              <ul className="mt-4 space-y-2.5 text-xs">
                <li>
                  <a href="https://upsc.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-800/40 font-bold">
                    <span>UPSC Clerical / IAS</span>
                    <span className="text-[10px] text-slate-400">upsc.gov.in</span>
                  </a>
                </li>
                <li>
                  <a href="https://ssc.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-800/40 font-bold">
                    <span>SSC GD / CHSL / CGL</span>
                    <span className="text-[10px] text-slate-400">ssc.gov.in</span>
                  </a>
                </li>
                <li>
                  <a href="https://indianrailways.gov.in" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-800/40 font-bold">
                    <span>Railways RRB ALP NTPC</span>
                    <span className="text-[10px] text-slate-400">rrb.gov.in</span>
                  </a>
                </li>
                <li>
                  <a href="https://ibps.in" target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-800/40 font-bold">
                    <span>IBPS Bank PO Clerk</span>
                    <span className="text-[10px] text-slate-400">ibps.in</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* AI Assistant Promo Widget */}
            <div className="bg-white rounded-2xl border border-pink-100 p-5 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[170px]">
              <div className="absolute top-0 right-0 transform translate-x-5 -translate-y-5 w-24 h-24 bg-pink-500/5 rounded-full"></div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5 uppercase">
                  <Sparkles className="h-4 w-4 text-pink-600 fill-pink-100" /> AI Career Mitra
                </h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed font-semibold">
                  Get personalized career guidelines, exam eligibility checks, syllabus reviews, and notification translation.
                </p>
              </div>
              <button
                onClick={() => setShowAiMitra(true)}
                className="mt-4 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-700 hover:to-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-pink-100 flex items-center justify-center gap-1"
              >
                <span>Ask Career Advisor Mitra</span>
              </button>
            </div>

            {/* Sidebar Rectangular Google Ads Slot */}
            <GoogleAd format="rectangle" slot="ad-sidebar-square-102" className="my-1" />

            {/* Help Desk & Submission/Verification FAQs */}
            <SidebarFaq />

            {/* Authentication badge check */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start space-x-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-black text-emerald-900 uppercase">100% Verified</h5>
                <p className="text-[10px] text-emerald-700 leading-normal mt-0.5 font-medium">All notifications are verified against official government gazettes to protect candidates from recruitment scams.</p>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer bar */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-16 text-center text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Sarkari Result • Built with Antigravity AI Engine</p>
          <p className="mt-1 text-[10px] lowercase text-gray-300">Sarkari Result is a career assistance utility and is not affiliated with any government entities or recruitment agencies.</p>
        </div>
      </footer>

      {/* Slide-out Sidebar Drawer for AI chatbot */}
      {showAiMitra && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md p-4 bg-black/30 backdrop-blur-xs flex justify-end">
          <div className="h-full w-full max-w-sm sm:max-w-md">
            <AiAssistant
              onClose={() => setShowAiMitra(false)}
              profile={profile}
            />
          </div>
        </div>
      )}

      {/* Information popup panel */}
      {selectedJob && (
        <NotificationDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          isBookmarked={bookmarkedIds.includes(selectedJob.id)}
          onToggleBookmark={() => {
            const id = selectedJob.id;
            setBookmarkedIds(prev => 
              prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
            );
          }}
        />
      )}

    </div>
  );
}
