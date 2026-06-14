import React, { useState } from 'react';
import { SarkariNotification } from '../types';
import { Search, MapPin, Calendar, Award, BookOpen, Clock, FileText, CheckCircle2, ChevronRight, ExternalLink, Bookmark, ShieldAlert, BadgeInfo } from 'lucide-react';

interface PageViewsProps {
  activeTab: string;
  jobs: SarkariNotification[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onSelectJob: (job: SarkariNotification) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function PageViews({
  activeTab,
  jobs,
  bookmarkedIds,
  onToggleBookmark,
  onSelectJob,
  searchQuery,
  setSearchQuery
}: PageViewsProps) {
  const [internalSearch, setInternalSearch] = useState('');

  // Determine core filter based on active tab
  let filterType = '';
  let pageTitle = '';
  let pageDescription = '';
  let headerColor = '';
  let badgeColor = '';

  switch (activeTab) {
    case 'jobs':
      filterType = 'job';
      pageTitle = 'Latest Online Application Forms 2026';
      pageDescription = 'Apply online for the latest active Indian Government job vacancies, state/central recruitment portals, and public sector openings.';
      headerColor = 'bg-[#2e7d32]'; // Sleek Forest Green
      badgeColor = 'bg-green-150 text-green-800 border-green-200';
      break;
    case 'results':
      filterType = 'result';
      pageTitle = 'Government Recruitment Exam Results 2026';
      pageDescription = 'Access officially declared written test results, competitive exam scores, merit lists, and department allocation schedules.';
      headerColor = 'bg-[#1565c0]'; // Sleek Royal Blue
      badgeColor = 'bg-blue-50 text-blue-800 border-blue-150';
      break;
    case 'admit':
      filterType = 'admit-card';
      pageTitle = 'Download Hall Ticket / Admit Card 2026';
      pageDescription = 'Immediate link portals to fetch official exam center maps, candidate seat schedules, and digital admit cards.';
      headerColor = 'bg-[#c62828]'; // Sleek Dark Saffron / Crimson
      badgeColor = 'bg-red-50 text-red-800 border-red-100';
      break;
    case 'answer-keys':
      filterType = 'answer-key';
      pageTitle = 'Official Exam Answer Keys & Response Sheets';
      pageDescription = 'Verify your answers against correct sheets released by recruit boards. Raise objections prior to final merit calculations.';
      headerColor = 'bg-amber-800';
      badgeColor = 'bg-amber-50 text-amber-800 border-amber-100';
      break;
    case 'syllabus':
      filterType = 'syllabus';
      pageTitle = 'Official Exam Syllabus & Pattern Guides';
      pageDescription = 'Download detailed syllabus breakdowns, mark weight distributions, and selection boards pattern structures.';
      headerColor = 'bg-violet-800';
      badgeColor = 'bg-violet-50 text-violet-800 border-violet-100';
      break;
    default:
      return null;
  }

  // Filter items based on activeTab type and search keywords (supporting both top bar and page-specific filter state)
  const combinedSearch = (searchQuery || internalSearch).toLowerCase();
  const filteredItems = jobs.filter(item => {
    const matchesTab = item.type === filterType;
    const matchesSearch = combinedSearch 
      ? item.title.toLowerCase().includes(combinedSearch) || 
        item.authority.toLowerCase().includes(combinedSearch) || 
        (item.postName && item.postName.toLowerCase().includes(combinedSearch)) ||
        (item.qualification && item.qualification.toLowerCase().includes(combinedSearch))
      : true;
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Sleek Page Header Section with Color Theme */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className={`${headerColor} text-white p-6 md:p-8`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase text-white/80 bg-white/10 px-2.5 py-1 rounded tracking-widest border border-white/10">
                Sarkari Official Section
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mt-2.5 leading-none">
                {pageTitle}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-2 max-w-2xl leading-relaxed">
                {pageDescription}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs p-4 rounded border border-white/15 text-center shrink-0 min-w-[140px]">
              <span className="text-2xl sm:text-3xl font-black block text-white select-none">
                {filteredItems.length}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider block text-white/80 mt-0.5">
                Active Listings
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter state on page */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder={`Search within current ${activeTab} items...`}
              value={searchQuery || internalSearch}
              onChange={(e) => {
                if (searchQuery !== undefined && setSearchQuery) {
                  setSearchQuery(e.target.value);
                } else {
                  setInternalSearch(e.target.value);
                }
              }}
              className="block w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-xs bg-white placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600"
            />
          </div>
          <div className="flex items-center text-xs text-slate-500 font-bold">
            <ShieldAlert className="h-3.5 w-3.5 mr-2 text-indigo-600 rounded-full" />
            <span>Updated live: {new Date().toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Structured Listings Layout */}
      {filteredItems.length === 0 ? (
        <div className="bg-white text-center py-12 px-4 rounded-lg border border-slate-200">
          <BadgeInfo className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-sm font-black text-slate-700 uppercase">No active listings match</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Try resetting your filter search query to explore more examination listings.</p>
          {(searchQuery || internalSearch) && (
            <button
              onClick={() => {
                if (setSearchQuery) setSearchQuery('');
                setInternalSearch('');
              }}
              className="mt-3 text-xs text-red-600 hover:text-red-700 underline font-extrabold cursor-pointer"
            >
              Clear Search Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => onSelectJob(item)}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-lg hover:shadow-xs transition-all cursor-pointer p-4.5 flex flex-col justify-between group relative"
            >
              {/* Top Meta */}
              <div>
                <div className="flex items-start justify-between gap-2.5">
                  <span className="text-[10px] text-slate-400 font-black tracking-wider uppercase truncate">
                    {item.authority}
                  </span>
                  
                  {/* Bookmark Button */}
                  <button
                    onClick={(e) => onToggleBookmark(item.id, e)}
                    className={`p-1.5 rounded transition-colors hover:bg-slate-100 relative z-10 shrink-0 ${
                      bookmarkedIds.includes(item.id) ? 'text-amber-500' : 'text-slate-300'
                    }`}
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>
                </div>

                <h3 className="text-sm font-black text-slate-800 leading-tight mt-1.5 group-hover:text-blue-700 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                {/* Authority Badge Tag */}
                {item.postName && (
                  <p className="text-xs font-semibold text-slate-500 mt-2 line-clamp-1">
                    <span className="text-slate-400">Post: </span>{item.postName}
                  </p>
                )}

                {/* Qualification Check */}
                {item.qualification && (
                  <div className="mt-3.5 p-2 bg-slate-50 border border-slate-150/80 rounded flex items-center space-x-2">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 line-clamp-1">
                      {item.qualification}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Meta & Action buttons */}
              <div className="border-t border-slate-100/80 pt-3.5 mt-4 flex items-center justify-between text-[11px] font-bold">
                
                {/* Specific metadata depending on type */}
                {item.type === 'job' && (
                  <div className="flex items-center text-slate-400">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>Ends: <span className="text-red-600 font-extrabold">{item.lastDate || 'Soon'}</span></span>
                  </div>
                )}

                {item.type === 'admit-card' && (
                  <div className="flex items-center text-slate-400">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>Hall Ticket: <span className="text-blue-600 font-extrabold">{item.admitCardStatus === 'available' ? 'Available' : 'Soon'}</span></span>
                  </div>
                )}

                {item.type === 'result' && (
                  <div className="flex items-center text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    <span>Status: Declared</span>
                  </div>
                )}

                {(item.type === 'syllabus' || item.type === 'answer-key') && (
                  <div className="flex items-center text-slate-400">
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    <span>Official Released Document</span>
                  </div>
                )}

                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 select-none font-black text-xs">
                  Details →
                </span>
                
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
