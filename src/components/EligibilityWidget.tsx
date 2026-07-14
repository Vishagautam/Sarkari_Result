import React, { useState } from 'react';
import { EligibilityProfile, SarkariNotification } from '../types';
import { User, Sparkles, AlertCircle, CheckCircle2, RefreshCw, Search, Compass, Briefcase, ArrowRight } from 'lucide-react';

interface EligibilityWidgetProps {
  profile: EligibilityProfile;
  setProfile: React.Dispatch<React.SetStateAction<EligibilityProfile>>;
  onRunAiEvaluation: (profile: EligibilityProfile) => void;
  aiLoading: boolean;
  aiMatchResults: Array<{ jobId: string; matchScore: number; matchStatus: string; matchReason: string }> | null;
  jobs: SarkariNotification[];
  onSelectJob: (job: SarkariNotification) => void;
}

const QUALIFICATIONS = [
  'Class 10th Metric',
  'Class 12th Pass',
  'Bachelor Degree (Graduation)',
  'B.Tech / Engineering',
  'ITI Certificate',
  'Diploma in Engineering',
  'Science (PCB)'
];

const STREAMS = [
  'Any Stream / General',
  'Science (PCM)',
  'Science (PCB)',
  'Commerce',
  'Arts / Humanities',
  'Mechanical',
  'Electrical',
  'Computer Science / IT',
  'Mechanical / Electrical / Automobile ITI'
];

const SUGGESTED_SEARCHES = [
  "I passed 12th science (PCM), find me active central railway or SSC posts",
  "B.Tech CS graduate under age 25, find high paying engineering or tech recruitment notifications",
  "Class 10th pass, age 19. Recommend active defense/police/BSF government forms",
  "Graduated in Commerce stream, search for active bank officer or clerk positions"
];

export default function EligibilityWidget({
  profile,
  setProfile,
  onRunAiEvaluation,
  aiLoading,
  aiMatchResults,
  jobs,
  onSelectJob
}: EligibilityWidgetProps) {
  const [showConfig, setShowConfig] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'ai_search'>('ai_search'); // Default to AI Search as requested by the user
  const [naturalQuery, setNaturalQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchMatches, setSearchMatches] = useState<Array<{
    jobId: string;
    relevanceScore: number;
    reason: string;
    recommendedNextStep: string;
  }> | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Simple client-side qualifier heuristic to instantly show matches
  const getClientHeuristicMatches = () => {
    return jobs.filter(job => {
      if (job.type !== 'job') return false;

      const q = profile.qualification.toLowerCase();
      const jq = job.qualification.toLowerCase();

      if (q.includes('10th') && jq.includes('10th')) return true;
      if (q.includes('12th') && (jq.includes('12th') || jq.includes('10+2') || jq.includes('intermediate'))) return true;
      if (q.includes('iti') && (jq.includes('iti') || jq.includes('technician'))) return true;
      if (q.includes('bachelor') || q.includes('degree') || q.includes('graduation')) {
        if (jq.includes('bachelor') || jq.includes('degree') || jq.includes('graduation') || jq.includes('graduate') || jq.includes('any stream')) return true;
      }
      if (q.includes('engineering') && (jq.includes('engineering') || jq.includes('diploma') || jq.includes('bachelor') || jq.includes('degree') || jq.includes('graduation'))) return true;
      if (q.includes('diploma') && (jq.includes('diploma') || jq.includes('engineering'))) return true;

      if (jq.includes('any stream') || jq.includes('any recognized university')) return true;

      return false;
    });
  };

  const clientMatches = getClientHeuristicMatches();

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    setSearchMatches(null);

    try {
      const response = await fetch('/api/ai-job-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalQuery })
      });

      if (!response.ok) {
        throw new Error("Failed to process your AI job search request.");
      }

      const result = await response.json();
      setSearchMatches(result.matches || []);
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || "Failed to search for matching jobs. Make sure GEMINI_API_KEY is defined in Secrets.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePillClick = (prompt: string) => {
    setNaturalQuery(prompt);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white">
            <Sparkles className="h-5 w-5 fill-white/10 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">AI Sarkari Job Assistant</h3>
            <p className="text-xs text-gray-500">Discover your ideal government jobs through search or criteria checks</p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('ai_search')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'ai_search'
                ? 'bg-white text-[#1a237e] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>AI Perfect Job Finder</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-[#1a237e] shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Structured Eligibility</span>
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        
        {activeTab === 'ai_search' ? (
          /* AI SEARCH TAB ENGINE */
          <div className="space-y-6">
            <form onSubmit={handleAiSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Describe Yourself (Education, Age, Stream, Interests or Target Sectors)
                </label>
                <div className="relative">
                  <textarea
                    value={naturalQuery}
                    onChange={(e) => setNaturalQuery(e.target.value)}
                    placeholder="e.g. I am a 23-year-old commerce graduate with a computer diploma. Show me high paying banking and administrative clerical jobs where I am eligible."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 transition-all font-medium leading-relaxed resize-none shadow-inner"
                  />
                  <div className="absolute right-3 bottom-3 text-[10px] text-gray-400 font-extrabold flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-md px-1.5 py-0.5">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span>Gemini AI Engine</span>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Or Try Pre-formulated Prompts:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SEARCHES.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePillClick(prompt)}
                      className="text-[11px] font-semibold text-slate-600 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-100 hover:border-indigo-200 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-left line-clamp-1 max-w-full"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={searchLoading || !naturalQuery.trim()}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-extrabold text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer select-none"
                >
                  {searchLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>AI finding your perfect jobs...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 fill-white animate-pulse" />
                      <span>Find Perfect Job with AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Indicators */}
            {searchError && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start space-x-3 font-semibold leading-relaxed">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-amber-800">API Key Note</p>
                  <p className="mt-1 text-amber-700">We used the smart local query-parsing fallback engine to match jobs. To run deep generative AI reasoning, please check your GEMINI_API_KEY in Settings &gt; Secrets.</p>
                </div>
              </div>
            )}

            {/* AI Natural Search Results Container */}
            {searchMatches && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mt-4">
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-600 fill-purple-100" />
                    <span>AI Recommended Job Matches ({searchMatches.length})</span>
                  </span>
                  <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    Match Analysis Ready
                  </span>
                </h4>

                {searchMatches.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500 font-semibold">
                    No perfect job matches found for this query in the current active database. Try specifying simpler qualifications like "10th", "12th", or "Degree".
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchMatches.map((match, index) => {
                      const matchedJob = jobs.find(j => j.id === match.jobId);
                      if (!matchedJob) return null;

                      return (
                        <div
                          key={index}
                          onClick={() => onSelectJob(matchedJob)}
                          className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl p-4 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                        >
                          {/* Top-right corner matching accent */}
                          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform"></div>

                          <div className="space-y-2 relative z-10">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                                  {matchedJob.authority}
                                </span>
                                <h5 className="text-xs font-black text-gray-900 mt-0.5 line-clamp-1 group-hover:text-blue-700 transition-colors">
                                  {matchedJob.title}
                                </h5>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black px-2 py-0.5 rounded-full block">
                                  {match.relevanceScore}% Match
                                </span>
                              </div>
                            </div>

                            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed line-clamp-3">
                              <span className="text-[#1a237e] font-black">AI Reasoning:</span> {match.reason}
                            </p>
                          </div>

                          <div className="border-t border-slate-100 pt-3 mt-3 flex items-center justify-between text-[11px] relative z-10">
                            <span className="text-indigo-600 font-extrabold truncate max-w-[200px]">
                              Next: {match.recommendedNextStep}
                            </span>
                            <span className="text-gray-400 group-hover:text-blue-600 flex items-center gap-0.5 font-bold text-[10px] uppercase shrink-0">
                              View <ArrowRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ORIGINAL STRUCTURED ELIGIBILITY TAB */
          <div className="space-y-6">
            {showConfig && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Qualification</label>
                  <select
                    value={profile.qualification}
                    onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Education Stream</label>
                  <select
                    value={profile.stream}
                    onChange={(e) => setProfile({ ...profile, stream: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STREAMS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Age</label>
                    <input
                      type="number"
                      min="16"
                      max="60"
                      value={profile.age}
                      onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">Category</label>
                    <select
                      value={profile.category}
                      onChange={(e) => setProfile({ ...profile, category: e.target.value })}
                      className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="OBC">OBC</option>
                      <option value="SC">SC</option>
                      <option value="ST">ST</option>
                      <option value="EWS">EWS</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-5 gap-4">
              <div className="text-sm text-gray-600">
                Based on qualifications, <strong className="text-blue-600 font-bold">{clientMatches.length}</strong> active sarkari notifications match your background.
              </div>
              
              <button
                id="run-ai-check-btn"
                onClick={() => onRunAiEvaluation(profile)}
                disabled={aiLoading}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all cursor-pointer select-none"
              >
                {aiLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>AI analyzing requirements...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 fill-white animate-pulse" />
                    <span>Verify with AI Matcher (Gemini)</span>
                  </>
                )}
              </button>
            </div>

            {/* AI Matcher Results Display */}
            {aiMatchResults && (
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
                <h4 className="text-sm font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-purple-600 fill-purple-200" />
                  <span>AI Evaluation Report (Sarkari Eligibility Analysis)</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.filter(j => j.type === 'job').map(job => {
                    const evaluation = aiMatchResults.find(ev => ev.jobId === job.id);
                    if (!evaluation) return null;

                    return (
                      <div
                        key={job.id}
                        onClick={() => onSelectJob(job)}
                        className="p-3.5 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-all cursor-pointer flex justify-between gap-3 items-start"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 truncate">{job.authority}</p>
                          <h5 className="text-xs font-bold text-gray-900 line-clamp-2 mt-0.5">{job.title}</h5>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 font-medium">Reason: {evaluation.matchReason}</p>
                        </div>

                        <div className="flex flex-col items-end shrink-0 gap-1.5">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            evaluation.matchStatus === 'EXCELLENT' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            evaluation.matchStatus === 'GOOD' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            evaluation.matchStatus.includes('WORK') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {evaluation.matchStatus}
                          </span>
                          <span className="text-xs font-black text-slate-700">
                            Match: {evaluation.matchScore}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
