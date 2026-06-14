import React, { useState } from 'react';
import { EligibilityProfile, SarkariNotification } from '../types';
import { User, Sparkles, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

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

  // Simple client-side qualifier heuristic to instantly show matches
  const getClientHeuristicMatches = () => {
    return jobs.filter(job => {
      if (job.type !== 'job') return false;

      // Simplistic matches based on user's selected qualification
      const q = profile.qualification.toLowerCase();
      const jq = job.qualification.toLowerCase();

      if (q.includes('10th') && jq.includes('10th')) return true;
      if (q.includes('12th') && (jq.includes('12th') || jq.includes('10+2') || jq.includes('intermediate'))) return true;
      if (q.includes('iti') && (jq.includes('iti') || jq.includes('technician'))) return true;
      if (q.includes('bachelor') || q.includes('degree') || q.includes('graduation')) {
        // Graduates can also apply to 12th or any general degree posts
        if (jq.includes('bachelor') || jq.includes('degree') || jq.includes('graduation') || jq.includes('graduate') || jq.includes('any stream')) return true;
      }
      if (q.includes('engineering') && (jq.includes('engineering') || jq.includes('diploma') || jq.includes('bachelor') || jq.includes('degree') || jq.includes('graduation'))) return true;
      if (q.includes('diploma') && (jq.includes('diploma') || jq.includes('engineering'))) return true;

      // Fallback: If job qualification is "Any Stream"
      if (jq.includes('any stream') || jq.includes('any recognized university')) return true;

      return false;
    });
  };

  const clientMatches = getClientHeuristicMatches();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Sarkari Job Eligibility Assistant</h3>
            <p className="text-xs text-gray-500">Find which government forms fit your age and qualifications</p>
          </div>
        </div>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-semibold cursor-pointer"
        >
          {showConfig ? 'Collapse Form' : 'Update Profile'}
        </button>
      </div>

      <div className="p-5 sm:p-6">
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

                const isEligible = evaluation.matchStatus === 'EXCELLENT' || evaluation.matchStatus === 'GOOD';
                
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
    </div>
  );
}
