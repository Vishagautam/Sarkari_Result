import React from 'react';
import { SarkariNotification } from '../types';
import { Flame } from 'lucide-react';

interface TrendingJobsProps {
  jobs: SarkariNotification[];
  onSelectJob: (job: SarkariNotification) => void;
}

export default function TrendingJobs({ jobs, onSelectJob }: TrendingJobsProps) {
  const trendingJobs = jobs.filter(job => job.trending);

  if (trendingJobs.length === 0) return null;

  return (
    <div id="trending-jobs-panel" className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-[#1a237e] text-white py-2.5 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="h-4.5 w-4.5 text-yellow-400 animate-pulse fill-yellow-400 shrink-0" />
          <h3 className="font-black text-xs sm:text-sm uppercase tracking-wider">Trending Current Job Openings</h3>
        </div>
        <span className="text-[9px] bg-red-600 text-white font-black uppercase px-2 py-0.5 rounded animate-pulse tracking-widest">HOT</span>
      </div>
      
      <div className="p-3 sm:p-4 bg-slate-50/50">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {trendingJobs.map(job => (
            <button
              id={`trending-job-${job.id}`}
              key={job.id}
              onClick={() => onSelectJob(job)}
              className="flex flex-col justify-between items-center p-3 bg-white border border-slate-200/80 rounded hover:border-red-600 hover:shadow-xs cursor-pointer transition-all active:scale-98 group h-24 text-center"
            >
              <h4 className="text-xs font-black text-blue-700 group-hover:text-red-700 line-clamp-3 leading-snug">
                {job.title}
              </h4>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 group-hover:text-red-600 group-hover:bg-red-50 font-black mt-2 bg-slate-100 px-1.5 py-0.5 rounded transition-colors shrink-0">
                {job.authority.split('(')[1]?.replace(')', '') || 'Exam'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
