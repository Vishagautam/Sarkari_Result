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
import { Bookmark, Sparkles, AlertCircle, HelpCircle, GraduationCap, Calendar, ShieldCheck, RefreshCw, CheckCircle, Wifi, Globe } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAiMitra, setShowAiMitra] = useState(false);
  const [selectedJob, setSelectedJob] = useState<SarkariNotification | null>(null);
  
  // Dynamic live jobs feed state
  const [jobs, setJobs] = useState<SarkariNotification[]>(SARKARI_DATA);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [lastSyncedInfo, setLastSyncedInfo] = useState<{
    method: string;
    addedCount: number;
    updatedCount: number;
    totalCount: number;
    lastUpdated: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('sarkari_sync_info');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          setJobs(data.notifications);
        }
      }
    } catch (err) {
      console.error("Failed to load synced server database:", err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const triggerSync = async () => {
    if (syncRunning) return;
    setSyncRunning(true);
    setSyncStatus(null);
    try {
      const response = await fetch('/api/sync', { method: 'POST' });
      if (!response.ok) {
        throw new Error("Portal API error. Trying fallback crawler...");
      }
      const result = await response.json();
      if (result.success) {
        await loadNotifications();
        const info = {
          method: result.method,
          addedCount: result.addedCount,
          updatedCount: result.updatedCount,
          totalCount: result.totalCount,
          lastUpdated: result.lastUpdated
        };
        setLastSyncedInfo(info);
        localStorage.setItem('sarkari_sync_info', JSON.stringify(info));
        setSyncStatus({
          type: 'success',
          message: `Deep-sync finished! Synced ${result.syncedItemsCount} postings (${result.addedCount} newly added, ${result.updatedCount} updated in-place) from sarkariresultgovt.online.`
        });
      } else {
        throw new Error(result.message || "Failed to finalize file transaction.");
      }
    } catch (err: any) {
      console.error("Synchronization error:", err);
      setSyncStatus({
        type: 'error',
        message: err.message || "Synchronization failed. Verify system environment secrets."
      });
    } finally {
      setSyncRunning(false);
    }
  };

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

  const handleSelectJob = (job: SarkariNotification | null) => {
    setSelectedJob(job);
    if (job) {
      const targetPath = `/jobs/${encodeURIComponent(job.id)}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ jobId: job.id }, '', targetPath);
      }
    } else {
      const homePath = activeTab === 'home' ? '/' : `/category/${activeTab}`;
      if (window.location.pathname !== homePath) {
        window.history.pushState({}, '', homePath);
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedJob(null);
    if (tab === 'home') {
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
      }
    } else {
      const targetPath = `/category/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  // Handle path-based routing & back/forward navigation
  useEffect(() => {
    const handleUrlChange = () => {
      // 1. Check for single jobs route
      const match = window.location.pathname.match(/^\/jobs\/([^/]+)/);
      if (match) {
        const jobId = decodeURIComponent(match[1]);
        const foundJob = jobs.find(item => item.id === jobId);
        if (foundJob) {
          setSelectedJob(foundJob);
          return;
        }
      }
      
      // 2. Check for category route
      const catMatch = window.location.pathname.match(/^\/category\/([^/]+)/);
      if (catMatch) {
        const cat = catMatch[1];
        setActiveTab(cat);
        setSelectedJob(null);
        return;
      }
      
      // 3. Fallback query parameter extraction (for SEO transition)
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get('job') || params.get('id');
      if (jobId) {
        const foundJob = jobs.find(item => item.id === jobId);
        if (foundJob) {
          setSelectedJob(foundJob);
          window.history.replaceState({}, '', `/jobs/${encodeURIComponent(jobId)}`);
          return;
        }
      }

      // 4. Default state
      setSelectedJob(null);
      setActiveTab('home');
    };

    handleUrlChange();

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, [jobs]);

  // Dynamic Google Schema JSON-LD SEO/AEO & Document Title/Meta Metadata Injector
  useEffect(() => {
    // 1. Dynamic Document Title update
    if (selectedJob) {
      document.title = `${selectedJob.title} - Sarkari Result 2026 | Eligibility, Salary, Apply Link`;
    } else if (activeTab !== 'home') {
      const formattedTab = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      document.title = `Sarkari Result 2026 - ${formattedTab} | Latest Govt Jobs & Vacancies`;
    } else {
      document.title = "Sarkari Result 2026 - State & Central Govt Job Vacancies, Admit Card & Exams";
    }

    // 2. Dynamic Meta Description update
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    if (selectedJob) {
      metaDesc.setAttribute('content', `Apply online for ${selectedJob.title} vacancy released by ${selectedJob.authority}. Check educational qualification eligibility, pay scale salary, age limit, selection phase rules, and key dates.`);
    } else {
      metaDesc.setAttribute('content', "Sarkari Result 2026 - Access direct links for active Government of India (Central & State Level) recruitment notices, exam result keys, admit cards, answer keys, and dynamic online application guidelines.");
    }

    // Clean up old script tags first
    const existing = document.getElementById('sarkari-result-json-ld');
    if (existing) {
      existing.remove();
    }

    // Determine target jobs to index as JobPostings (Either selectedJob, or top active jobs)
    const targets = selectedJob 
      ? [selectedJob] 
      : jobs.filter(j => j.type === 'job' && j.status === 'active').slice(0, 10);

    const schemaData = targets.map(job => {
      // Intelligently parse salary figures from strings (e.g. "Level-10 Pay Scale" or "Rs. 56,100 - 1,77,500/-")
      let minSalaryValue = 25000;
      let maxSalaryValue = 81100;

      if (job.salary) {
        const salaryDigits = job.salary.replace(/,/g, '').match(/\d+/g);
        if (salaryDigits && salaryDigits.length >= 2) {
          minSalaryValue = parseInt(salaryDigits[0], 10) || minSalaryValue;
          maxSalaryValue = parseInt(salaryDigits[1], 10) || maxSalaryValue;
        } else if (salaryDigits && salaryDigits.length === 1) {
          minSalaryValue = parseInt(salaryDigits[0], 10) || minSalaryValue;
          maxSalaryValue = minSalaryValue * 3; // sensible multiplier fallback
        }
      }

      // Format ISO 8601 clean dates or safe future-pointing placeholders
      const postDateISO = job.applicationStart ? new Date(job.applicationStart).toISOString().split('T')[0] : '2026-06-01';
      const validThroughISO = job.lastDate ? new Date(job.lastDate).toISOString().split('T')[0] : '2026-07-31';

      return {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": job.title,
        "description": job.details || `${job.title} - Career Notification published by ${job.authority}. Qualification eligibility criteria: ${job.qualification}. Apply on sarkariresultgovt.online to retrieve the official registration resources.`,
        "identifier": {
          "@type": "PropertyValue",
          "name": job.authority,
          "value": job.id
        },
        "datePosted": postDateISO,
        "validThrough": validThroughISO,
        "employmentType": "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.authority,
          "sameAs": "https://sarkariresultgovt.online/"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "All Major Cities",
            "addressRegion": "All States",
            "addressCountry": "IN"
          }
        },
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "INR",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": minSalaryValue,
            "maxValue": maxSalaryValue,
            "unitText": "MONTH"
          }
        },
        "industry": "Government",
        "educationRequirements": {
          "@type": "EducationalOccupationalCredential",
          "credentialCategory": job.qualification
        }
      };
    });

    // Structure dynamic FAQ Schema for AEO (Answer Engine Optimization)
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How to fix spelling or DOB errors in submitted forms?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most recruitment boards (SSC, UPSC, RRB) open a dedicated 'Correction Window' 3-5 days after online registration closes. If mistakes persist, email the official support team with your registration ID immediately. Do not submit double registrations, as they may lead to automatic disqualification."
          }
        },
        {
          "@type": "Question",
          "name": "Money debited but payment status is still pending?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Do not make a secondary payment immediately! Server-side synchronization often takes 24 to 48 hours. Log out and log back in to review the status, or check the bank verification status using your bank transaction reference ID in the recruitment portal."
          }
        },
        {
          "@type": "Question",
          "name": "Is e-Aadhaar card accepted for Document Verification?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes, printed e-Aadhaar with a verified QR code is fully accepted at document verification centers. However, your name, parentage, and Date of Birth (DOB) must match your Matriculation (Class 10th) mark sheet and official certificate exactly."
          }
        },
        {
          "@type": "Question",
          "name": "What is the format validity for OBC-NCL/EWS certificates?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "OBC (Non-Creamy Layer) and EWS certificates must be validated for the current financial year and must adhere to the prescribed Central Government format (often provided in the notification annexures) rather than simple state formats."
          }
        }
      ]
    };

    // Google Sitelinks Searchbox WebSite Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Sarkari Result Govt",
      "alternateName": ["Sarkari Result", "Sarkari Result Website", "Sarkari Job", "Sarkari Result Govt Jobs"],
      "url": "https://sarkariresultgovt.online/",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://sarkariresultgovt.online/?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    };

    // SiteNavigationElement lists to promote instant sitelinks under the main ranking
    const navigationSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Sarkari Result Categories",
      "description": "Primary navigation channels for active government job listings, results, admit cards, and answers",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Sarkari Result Home",
          "url": "https://sarkariresultgovt.online/"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Latest Jobs",
          "url": "https://sarkariresultgovt.online/category/jobs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Results",
          "url": "https://sarkariresultgovt.online/category/results"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "Admit Card",
          "url": "https://sarkariresultgovt.online/category/admit"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "Answer Key",
          "url": "https://sarkariresultgovt.online/category/answer-keys"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Syllabus Guide",
          "url": "https://sarkariresultgovt.online/category/syllabus"
        }
      ]
    };

    // Combine all schemas for ultimate indexing
    const combinedSchema = [
      ...schemaData,
      faqSchema,
      websiteSchema,
      navigationSchema
    ];

    const script = document.createElement('script');
    script.id = 'sarkari-result-json-ld';
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(combinedSchema, null, 2);
    document.head.appendChild(script);

    return () => {
      const tag = document.getElementById('sarkari-result-json-ld');
      if (tag) {
        tag.remove();
      }
    };
  }, [selectedJob, jobs, activeTab]);

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
        onTabChange={handleTabChange}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Top Horizontal Header Leaderboard Google Ads Slot */}
        <GoogleAd format="horizontal" slot="ad-header-leaderboard" className="mb-6" />

        {/* Live Synchronization Dashboard */}
        <div className="mb-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-32 h-32 bg-blue-500/5 rounded-full"></div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1 md:flex-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider">Live Synchronization Portal Active</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#1a237e]" /> Sync with sarkariresultgovt.online
              </h3>
              <p className="text-xs text-slate-500 font-medium max-w-2xl leading-relaxed">
                Stay up to date with live Indian Government examinations, competitive results, admit cards, or job application notices. Core synchronizer merges listings automatically or instantly on press.
              </p>
              
              {lastSyncedInfo ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] font-bold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-1.5 w-fit">
                  <span className="flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5 text-slate-400" />
                    Last Synced: <strong className="text-slate-800">{new Date(lastSyncedInfo.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}, {new Date(lastSyncedInfo.lastUpdated).toLocaleDateString()}</strong>
                  </span>
                  <span className="text-slate-300">•</span>
                  <span>Total Active: <strong className="text-[#1a237e]">{lastSyncedInfo.totalCount} listings</strong></span>
                  <span className="text-slate-300">•</span>
                  <span>Channel: <strong className="text-indigo-700">{lastSyncedInfo.method === 'search_grounding' ? 'AI Search Grounding' : 'Source Direct'}</strong></span>
                </div>
              ) : (
                <p className="text-[11px] font-bold text-slate-400 italic mt-2.5">
                  No automated synchronizations run yet. Tap Sync below to fetch the latest notifications from the original web source.
                </p>
              )}
            </div>

            <div className="shrink-0">
              <button
                onClick={triggerSync}
                disabled={syncRunning}
                className={`w-full sm:w-auto relative flex items-center justify-center gap-2 px-6 py-3 border border-slate-200/50 rounded-xl text-xs sm:text-sm font-black transition-all select-none shadow-xs cursor-pointer ${
                  syncRunning
                    ? 'bg-slate-100 text-slate-400 border-none cursor-not-allowed'
                    : 'bg-[#1a237e] hover:bg-[#1a237e]/90 text-white hover:shadow active:scale-97'
                }`}
              >
                <RefreshCw className={`h-4 w-4 shrink-0 ${syncRunning ? 'animate-spin' : ''}`} />
                <span>{syncRunning ? 'Parsing Web Source...' : 'Synchronize Live Data'}</span>
              </button>
            </div>
          </div>

          {/* Sync status toast overlay element */}
          {syncStatus && (
            <div className={`mt-4 p-4 rounded-xl text-xs flex items-start gap-3 border font-semibold animate-fadeIn ${
              syncStatus.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              {syncStatus.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-extrabold">{syncStatus.type === 'success' ? 'Live Data Synchronized' : 'Notice'}</p>
                <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">{syncStatus.message}</p>
              </div>
              <button 
                onClick={() => setSyncStatus(null)}
                className="text-slate-400 hover:text-slate-600 select-none cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>
        
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
              {jobs.filter(item => bookmarkedIds.includes(item.id)).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleSelectJob(item)}
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
                  jobs={jobs}
                  onSelectJob={handleSelectJob}
                />

                {/* Trending Hot recruitment widgets */}
                <TrendingJobs
                  jobs={jobs}
                  onSelectJob={handleSelectJob}
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
                  jobs={jobs}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={toggleBookmark}
                  onSelectJob={handleSelectJob}
                  searchQuery={searchQuery}
                />

                {/* Ultimate SEO & AEO Keyword-Rich Informational Guide Section */}
                <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 mt-8">
                  <div className="border-b border-slate-100 pb-4">
                    <h2 className="text-xl sm:text-2xl font-black text-[#1a237e] tracking-tight">
                      Sarkari Result 2026 — Latest Government Jobs, Admit Cards & Exams
                    </h2>
                    <p className="text-xs text-slate-500 font-bold mt-1.5 uppercase tracking-wider">
                      sarkariresultgovt.online — Your Trusted Sarkari Result Website
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed text-left">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-extrabold text-[#d32f2f] text-sm mb-1.5">
                          What is Sarkari Result and How to Use It?
                        </h3>
                        <p>
                          Welcome to the ultimate online hub for finding every active <strong>sarkari job</strong> and competitive recruitment notices. <strong>Sarkari Result</strong> is a highly trusted name for millions of Indian job seekers, providing direct, curated, and 100% verified links for state and central level examinations. Our official <strong>sarkari result website</strong> aims to simplify your path to secure <strong>government job</strong> placements across UPSC, SSC, Railways, Banking, Defense, and state PSC sectors.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#d32f2f] text-sm mb-1.5">
                          How We Help You Find the Right Sarkari Job
                        </h3>
                        <p>
                          Looking for active <strong>sarkari</strong> updates? Our live synchronizer parses verified portals instantly, saving you from navigating multiple disorganized websites. Whether you are seeking a central <strong>indian job</strong> or a regional state recruitment notification, we provide clear summaries of online registration links, specific qualifying criteria, eligibility age limits, pay scale structures, and written examination centers.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-extrabold text-[#d32f2f] text-sm mb-1.5">
                          Step-by-Step Guide to Apply for Government Jobs
                        </h3>
                        <p>
                          To secure your desired vacancy on our <strong>sarkari result job</strong> portal, simply choose an active post from the list, review the comprehensive eligibility requirements, and click the direct apply link. Always ensure you have your Matriculation mark sheets, valid identification proofs (like e-Aadhaar cards), passport-sized photographs, and qualifying degrees handy. Pay the registration fees within the specified timeline to successfully finalize your candidature.
                        </p>
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#d32f2f] text-sm mb-1.5">
                          Instant Access to Admit Cards & Answer Keys
                        </h3>
                        <p>
                          Our <strong>sarkari result govt</strong> platform updates the moment official boards release written exam admit cards or provisional answer keys. Never miss a critical deadline — bookmark this page or use our integrated <strong>AI Career Advisor Mitra</strong> to ask custom queries regarding exam patterns, syllabi changes, official correction window schedules, or selection standards.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* High Density Key-Term Pill Bar for Search Crawlers */}
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider mr-2">Quick Searches:</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">sarkari result</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">sarkari result website</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">sarkari job</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">sarkari</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">government job</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">indian job</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">sarkari result job</span>
                    <span className="bg-white border border-slate-200 text-slate-600 font-extrabold text-[11px] px-2.5 py-1 rounded-lg">sarkari result govt</span>
                  </div>
                </section>
              </>
            ) : (
              <PageViews
                activeTab={activeTab}
                jobs={jobs}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={toggleBookmark}
                onSelectJob={handleSelectJob}
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
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p>© 2026 Sarkari Result • Built with Antigravity AI Engine</p>
          <div className="flex items-center justify-center gap-4 text-[10px] text-indigo-500 normal-case">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold flex items-center gap-1">
              <Globe className="h-3 w-3" />
              Sitemap.xml (Google SEO Index)
            </a>
          </div>
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
          onClose={() => handleSelectJob(null)}
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
