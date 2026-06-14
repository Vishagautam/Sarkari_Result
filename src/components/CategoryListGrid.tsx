import React from 'react';
import { SarkariNotification } from '../types';
import { Flame, Bell, Award, FileCheck, Bookmark, ArrowRight } from 'lucide-react';

interface CategoryListGridProps {
  jobs: SarkariNotification[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelectJob: (job: SarkariNotification) => void;
  searchQuery: string;
}

export default function CategoryListGrid({
  jobs,
  bookmarkedIds,
  onToggleBookmark,
  onSelectJob,
  searchQuery
}: CategoryListGridProps) {
  
  // Filter helper
  const filterByQuery = (item: SarkariNotification) => {
    if (!searchQuery.trim()) return true;
    const s = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(s) ||
      item.authority.toLowerCase().includes(s) ||
      (item.postName && item.postName.toLowerCase().includes(s)) ||
      item.qualification.toLowerCase().includes(s)
    );
  };

  const results = jobs.filter(item => item.type === 'result' && filterByQuery(item));
  const admitCards = jobs.filter(item => item.type === 'admit-card' && filterByQuery(item));
  const latestJobs = jobs.filter(item => item.type === 'job' && filterByQuery(item));
  
  // Auxiliary columns
  const ancillaryList = jobs.filter(item => 
    ['answer-key', 'syllabus', 'admission', 'important'].includes(item.type) && filterByQuery(item)
  );

  return (
    <div className="space-y-12">
      
      {/* Dynamic Grid for Results | Admit Cards | Latest Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Exam Results Panel Column */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-[#1565c0] text-white py-2.5 px-4 font-black text-center uppercase tracking-wider text-xs border-b border-blue-900/10">
            Result
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto flex-1">
            {results.length === 0 ? (
              <p className="p-6 text-xs text-center text-gray-400">No outcomes match search criteria.</p>
            ) : (
              results.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectJob(item)}
                  className="p-3.5 border-b border-gray-100 hover:bg-blue-50/50 active:bg-blue-50/80 transition-all cursor-pointer group flex items-start justify-between gap-3 text-blue-700"
                >
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-[#1565c0] font-black">{item.authority}</p>
                    <h4 className="text-xs font-bold text-blue-700 line-clamp-2 mt-0.5 group-hover:text-blue-900 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => onToggleBookmark(item.id, e)}
                      className={`p-1.5 rounded-lg border border-transparent transition-all hover:bg-gray-100 ${
                        bookmarkedIds.includes(item.id) ? 'text-amber-500' : 'text-gray-300'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <ArrowRight className="h-3.5 w-3.5 text-blue-400 group-hover:text-blue-700 transform group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Admit Cards Column */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-[#c62828] text-white py-2.5 px-4 font-black text-center uppercase tracking-wider text-xs border-b border-red-905">
            Admit Card
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto flex-1">
            {admitCards.length === 0 ? (
              <p className="p-6 text-xs text-center text-gray-400">No active admit cards match search criteria.</p>
            ) : (
              admitCards.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectJob(item)}
                  className="p-3.5 border-b border-gray-100 hover:bg-red-50/50 active:bg-red-50/80 transition-all cursor-pointer group flex items-start justify-between gap-3 text-red-700"
                >
                  <div className="min-w-0">
                    <p className="text-[9px] uppercase tracking-wider text-[#c62828] font-black">{item.authority}</p>
                    <h4 className="text-xs font-bold text-red-700 line-clamp-2 mt-0.5 group-hover:text-red-900 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => onToggleBookmark(item.id, e)}
                      className={`p-1.5 rounded-lg border border-transparent transition-all hover:bg-gray-100 ${
                        bookmarkedIds.includes(item.id) ? 'text-amber-500' : 'text-gray-300'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <ArrowRight className="h-3.5 w-3.5 text-red-400 group-hover:text-red-700 transform group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Jobs Column */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-[#2e7d32] text-white py-2.5 px-4 font-black text-center uppercase tracking-wider text-xs border-b border-green-905">
            Latest Jobs
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto flex-1">
            {latestJobs.length === 0 ? (
              <p className="p-6 text-xs text-center text-gray-400">No active application forms found.</p>
            ) : (
              latestJobs.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectJob(item)}
                  className="p-3.5 border-b border-gray-100 hover:bg-green-50/55 active:bg-green-50/80 transition-all cursor-pointer group flex items-start justify-between gap-3 text-green-755"
                >
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] uppercase tracking-wider text-green-700 font-extrabold">{item.authority}</span>
                      {item.status === 'active' && (
                        <span className="bg-green-100 text-green-800 text-[8px] font-black uppercase px-1 rounded">Open</span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-green-700 line-clamp-2 mt-0.5 group-hover:text-green-900 transition-colors">
                      {item.title}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={(e) => onToggleBookmark(item.id, e)}
                      className={`p-1.5 rounded-lg border border-transparent transition-all hover:bg-gray-100 ${
                        bookmarkedIds.includes(item.id) ? 'text-amber-500' : 'text-gray-300'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-current" />
                    </button>
                    <ArrowRight className="h-3.5 w-3.5 text-green-400 group-hover:text-green-700 transform group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Auxiliary Grid Panel: Syllabus, Admission, Answer Key, Updates */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-3.5 mb-5 flex items-center space-x-2">
          <FileCheck className="h-5 w-5 text-indigo-600" />
          <span>Syllabus, Admission, Answer Keys & Pan/Aadhar Guidelines</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ancillaryList.length === 0 ? (
            <p className="col-span-4 p-6 text-xs text-center text-gray-400">No administrative listings match current query.</p>
          ) : (
            ancillaryList.map(item => (
              <div
                key={item.id}
                onClick={() => onSelectJob(item)}
                className="p-3.5 bg-slate-50 hover:bg-white border border-gray-200 hover:border-blue-400/50 rounded-xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                    item.type === 'syllabus' ? 'bg-amber-100 text-amber-800' :
                    item.type === 'admission' ? 'bg-indigo-100 text-indigo-800' :
                    item.type === 'answer-key' ? 'bg-cyan-100 text-cyan-800' :
                    'bg-slate-200 text-slate-800'
                  }`}>
                    {item.type.replace('-', ' ')}
                  </span>
                  <p className="text-[9px] uppercase tracking-wider text-gray-400 font-bold mt-2.5">{item.authority}</p>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-2 mt-0.5 group-hover:text-blue-600 transition-all">
                    {item.title}
                  </h4>
                </div>
                
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-4 text-[10px] text-gray-400 font-semibold group-hover:text-blue-600 transition-all">
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3 text-gray-300 group-hover:text-blue-500 transform group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
