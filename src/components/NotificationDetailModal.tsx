import React from 'react';
import { SarkariNotification } from '../types';
import { X, Calendar, DollarSign, Award, ArrowUpRight, HelpCircle, Briefcase, Bookmark, FileText, Hourglass, Timer, AlertTriangle, Download, Printer, ZoomIn, ZoomOut, Search, ChevronLeft, ChevronRight, Check, CalendarPlus, Share2, MessageCircle } from 'lucide-react';
import GoogleAd from './GoogleAd';

interface NotificationDetailModalProps {
  job: SarkariNotification | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export default function NotificationDetailModal({ job, onClose, isBookmarked, onToggleBookmark }: NotificationDetailModalProps) {
  if (!job) return null;

  const [showPdfViewer, setShowPdfViewer] = React.useState(false);
  const [zoomLevel, setZoomLevel] = React.useState(100);
  const [pdfPage, setPdfPage] = React.useState(1);
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);
  const [printSuccess, setPrintSuccess] = React.useState(false);
  const [calendarSuccess, setCalendarSuccess] = React.useState(false);
  const [shareSuccess, setShareSuccess] = React.useState(false);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    setScrollProgress(0);
  }, [job]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalHeight = target.scrollHeight - target.clientHeight;
    if (totalHeight <= 0) {
      setScrollProgress(0);
      return;
    }
    const currentProgress = (target.scrollTop / totalHeight) * 100;
    setScrollProgress(currentProgress);
  };

  const [timeLeft, setTimeLeft] = React.useState<{
    status: 'active' | 'upcoming' | 'closed' | 'none';
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    diffMs?: number;
  }>({ status: 'none', days: 0, hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    if (!job || job.type !== 'job' || !job.lastDate) {
      setTimeLeft({ status: 'none', days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const calculateTime = () => {
      const deadlineDate = new Date(`${job.lastDate}T23:59:59`);
      const now = new Date();
      const diffMs = deadlineDate.getTime() - now.getTime();

      if (job.status === 'upcoming' || (job.applicationStart && new Date(job.applicationStart) > now)) {
        setTimeLeft({ status: 'upcoming', days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      if (diffMs <= 0 || job.status === 'closed') {
        setTimeLeft({ status: 'closed', days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ status: 'active', days, hours, minutes, seconds, diffMs });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [job]);

  // Calculate percentage of application window remaining
  const getProgressPercentage = () => {
    if (!job || !job.lastDate || !timeLeft.diffMs) return 0;
    const startMs = job.applicationStart ? new Date(`${job.applicationStart}T00:00:00`).getTime() : (new Date(`${job.lastDate}T23:59:59`).getTime() - 30 * 24 * 60 * 60 * 1000);
    const endMs = new Date(`${job.lastDate}T23:59:59`).getTime();
    const total = endMs - startMs;
    if (total <= 0) return 100;
    const current = timeLeft.diffMs;
    return Math.max(0, Math.min(100, (current / total) * 100));
  };

  const progressPct = getProgressPercentage();
  const daysLeft = timeLeft.days;

  // Determine urgency color
  const getUrgencyColor = () => {
    if (daysLeft < 3) return { text: 'text-red-400', bg: 'bg-red-500', bgSoft: 'bg-red-950/40 border-red-900/60 text-red-300' };
    if (daysLeft < 7) return { text: 'text-amber-400', bg: 'bg-amber-500', bgSoft: 'bg-amber-950/40 border-amber-900/60 text-amber-300' };
    return { text: 'text-green-400', bg: 'bg-green-600', bgSoft: 'bg-green-950/40 border-green-900/60 text-green-300' };
  };

  const urgency = getUrgencyColor();

  const handleDownloadPdf = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handlePrintPdf = () => {
    setPrintSuccess(true);
    setTimeout(() => setPrintSuccess(false), 2000);
  };

  const handleAddToCalendar = () => {
    let eventDate = new Date();
    let hasSpecificDate = false;
    let summary = `Exam: ${job.postName || job.title}`;
    let description = `Official event for ${job.title}. Details: ${job.examDate || 'Check official notification'}.`;

    if (job.examDate) {
      // Try to parse some explicit date formats
      const dateMatch = job.examDate.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+\d{4}/i);
      if (dateMatch) {
        const parsed = new Date(dateMatch[0]);
        if (!isNaN(parsed.getTime())) {
          eventDate = parsed;
          hasSpecificDate = true;
        }
      } else {
        // Try to match "Month Year", e.g., "August 2026"
        const monthYearMatch = job.examDate.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/i);
        if (monthYearMatch) {
          const parsed = new Date(`1 ${monthYearMatch[0]}`);
          if (!isNaN(parsed.getTime())) {
            eventDate = parsed;
            hasSpecificDate = true;
          }
        } else {
          // If it's a month range like "July-August 2026", try first month
          const rangeMatch = job.examDate.match(/(January|February|March|April|May|June|July|August|September|October|November|December)-(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
          if (rangeMatch) {
            const parsed = new Date(`1 ${rangeMatch[1]} ${rangeMatch[3]}`);
            if (!isNaN(parsed.getTime())) {
              eventDate = parsed;
              hasSpecificDate = true;
            }
          }
        }
      }
    }

    // If no exam date was found, we can schedule a reminder for the Application Deadline (last date to apply)
    if (!hasSpecificDate && job.lastDate) {
      const parsed = new Date(`${job.lastDate}T12:00:00`);
      if (!isNaN(parsed.getTime())) {
        eventDate = parsed;
        summary = `DEADLINE: Apply for ${job.title}`;
        description = `This is the LAST DATE to apply online for ${job.title}. Submit before deadline!`;
      }
    }

    // Format to iCalendar format
    const formatDate = (date: Date) => {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}${m}${d}T090000Z`; // 9:00 AM UTC
    };

    const formatDateEnd = (date: Date) => {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}${m}${d}T100000Z`; // 10:00 AM UTC (1 hour duration)
    };

    const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const startStr = formatDate(eventDate);
    const endStr = formatDateEnd(eventDate);
    const uid = `${job.id}-${Date.now()}@sarkariresultgovt.online`;

    // Escape special chars for ICS formatting
    const escapeIcsText = (str: string) => {
      return str
        .replace(/\\/g, '\\\\')
        .replace(/,/g, '\\,')
        .replace(/;/g, '\\;')
        .replace(/\n/g, '\\n');
    };

    const safeSummary = escapeIcsText(summary);
    const safeDescription = escapeIcsText(`${description}\n\nAuthority: ${job.authority}\nOfficial link: ${job.officialLink}`);

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Sarkari Result//Recruitment Event Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${safeSummary}`,
      `DESCRIPTION:${safeDescription}`,
      `LOCATION:${escapeIcsText(job.officialLink)}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const icsString = icsLines.join('\r\n');

    // Trigger file download
    const blob = new Blob([icsString], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sarkari-${job.id}-calendar.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCalendarSuccess(true);
    setTimeout(() => setCalendarSuccess(false), 2500);
  };

  const handleShareLink = () => {
    const directUrl = `${window.location.origin}/jobs/${encodeURIComponent(job.id)}`;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(directUrl)
          .then(() => {
            setShareSuccess(true);
            setTimeout(() => setShareSuccess(false), 2500);
          })
          .catch((err) => {
            console.error("Clipboard API write failed, trying fallback:", err);
            fallbackCopyText(directUrl);
          });
      } else {
        fallbackCopyText(directUrl);
      }
    } catch (err) {
      console.error("Clipboard copy failed:", err);
      fallbackCopyText(directUrl);
    }
  };

  const fallbackCopyText = (text: string) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2500);
    } catch (err) {
      console.error('Fallback copy strategy failed:', err);
    }
    document.body.removeChild(textarea);
  };

  const getWhatsAppShareLink = () => {
    const directUrl = `${window.location.origin}/jobs/${encodeURIComponent(job.id)}`;
    
    let message = `📢 *Govt Job Update: ${job.title}*\n\n`;
    message += `🏛️ *Authority:* ${job.authority}\n`;
    if (job.totalPosts) {
      message += `💼 *Total Vacancies:* ${job.totalPosts}\n`;
    }
    message += `🎓 *Eligibility:* ${job.qualification}\n`;
    if (job.lastDate) {
      message += `📅 *Last Date:* ${job.lastDate}\n`;
    }
    if (job.salary) {
      message += `💰 *Salary:* ${job.salary}\n`;
    }
    message += `\n🔗 *Check details & apply here:* ${directUrl}\n`;
    message += `\n_Shared from Sarkari Result careers portal_`;
    
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs">
      <div id="notification-detail-modal" className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] relative text-slate-100">
        
        {/* Subtle Horizontal Scroll Progress Bar at the very top */}
        <div className="w-full h-1 bg-slate-800 absolute top-0 left-0 right-0 z-20">
          <div 
            className="h-full bg-blue-500 transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 pt-5 sm:pt-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start gap-4">
          <div>
            <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              job.type === 'job' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60' :
              job.type === 'admit-card' ? 'bg-blue-950/40 text-blue-400 border border-blue-800/60' :
              'bg-purple-950/40 text-purple-400 border border-purple-800/60'
            }`}>
              {job.type.toUpperCase().replace('-', ' ')}
            </span>
            <h3 className="font-extrabold text-white text-base sm:text-lg mt-2 leading-snug">{job.title}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{job.authority}</p>
          </div>
          
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={onToggleBookmark}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
            >
              <Bookmark className="h-4 w-4 fill-current" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-750 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div onScroll={handleScroll} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Deadline Countdown Area */}
          {timeLeft.status !== 'none' && (
            <div className={`p-4 rounded-xl border ${timeLeft.status === 'closed' ? 'bg-slate-800/60 border-slate-750 text-slate-400' : timeLeft.status === 'upcoming' ? 'bg-indigo-950/30 border-indigo-900/55' : urgency.bgSoft} transition-all`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Timer className={`h-5 w-5 ${timeLeft.status === 'closed' ? 'text-slate-500' : timeLeft.status === 'upcoming' ? 'text-indigo-400' : urgency.text} shrink-0`} />
                  <span className={`text-[11px] font-black uppercase tracking-wider ${timeLeft.status === 'closed' ? 'text-slate-500' : timeLeft.status === 'upcoming' ? 'text-indigo-300' : urgency.text}`}>
                    {timeLeft.status === 'closed' && 'Registration Period Ended'}
                    {timeLeft.status === 'upcoming' && 'Application Portal Upcoming'}
                    {timeLeft.status === 'active' && (daysLeft < 3 ? 'CRITICAL DEADLINE CLOSING SOON' : 'APPLICATION DEADLINE COUNTDOWN')}
                  </span>
                </div>
                {timeLeft.status === 'active' && (
                  <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-0.5 rounded ${daysLeft < 3 ? 'bg-red-600 text-white animate-pulse' : daysLeft < 7 ? 'bg-amber-500 text-white' : 'bg-green-600 text-white'}`}>
                    {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'} Remaining
                  </span>
                )}
              </div>

              {/* Countdown metrics */}
              {timeLeft.status === 'active' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-slate-950/80 backdrop-blur-xs p-2 rounded border border-slate-800/80">
                      <div className="text-xl sm:text-2xl font-black text-slate-100 leading-none">{timeLeft.days}</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mt-1">Days</div>
                    </div>
                    <div className="bg-slate-950/80 backdrop-blur-xs p-2 rounded border border-slate-800/80">
                      <div className="text-xl sm:text-2xl font-black text-slate-100 leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mt-1">Hrs</div>
                    </div>
                    <div className="bg-slate-950/80 backdrop-blur-xs p-2 rounded border border-slate-800/80">
                      <div className="text-xl sm:text-2xl font-black text-slate-100 leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mt-1">Mins</div>
                    </div>
                    <div className="bg-slate-950/80 backdrop-blur-xs p-2 rounded border border-slate-800/80">
                      <div className="text-xl sm:text-2xl font-black text-red-400 leading-none animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</div>
                      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold mt-1">Secs</div>
                    </div>
                  </div>
                  
                  {/* Visual deadline timeline progress bar */}
                  <div className="space-y-1">
                    <div className="relative w-full h-2 bg-slate-850 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${urgency.bg} transition-all duration-1000`} 
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                      <span>Window Opened</span>
                      <span>{Math.round(progressPct)}% Time Remaining</span>
                      <span>Target Close</span>
                    </div>
                  </div>
                </div>
              ) : timeLeft.status === 'upcoming' ? (
                <div className="flex items-center space-x-2 text-indigo-305 font-bold text-xs p-2 bg-indigo-950/40 border border-indigo-900/60 rounded-lg">
                  <Calendar className="h-4 w-4 shrink-0 text-indigo-400" />
                  <span>The online portal is scheduled to open on <span className="font-black text-indigo-200">{job.applicationStart || 'soon'}</span>. Prepare your certificates!</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-slate-400 font-extrabold text-xs p-2 bg-slate-800/40 border border-slate-700/60 rounded-lg">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-slate-500" />
                  <span>The application registration deadline has closed. Late admissions cannot be processed.</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Last Date</p>
                <p className="text-xs font-black text-slate-100">{job.lastDate || 'N/A'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center space-x-3">
              <Award className="h-5 w-5 text-indigo-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Total Vacancy</p>
                <p className="text-xs font-black text-slate-100">{job.totalPosts || 'N/A'}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center space-x-3 col-span-2 sm:col-span-1">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Salary Pay</p>
                <p className="text-xs font-black text-slate-100 truncate select-all">{job.salary || 'Per Grade Rules'}</p>
              </div>
            </div>
          </div>

          {/* Educational Criteria */}
          <div>
            <h4 className="text-xs uppercase font-black tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-blue-400" /> Education Qualification & Eligibility
            </h4>
            <div className="p-3.5 bg-blue-950/40 rounded-xl border border-blue-900/60 text-sm font-semibold text-blue-200 leading-relaxed">
              {job.qualification}
            </div>
          </div>

          {/* Age Limit & Dates parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs uppercase font-black tracking-widest text-slate-500 mb-2">Age Limit Criteria</h4>
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-semibold">
                {job.ageLimit || 'Depends on candidate category. Please check detailed notification.'}
              </div>
            </div>

            <div>
              <h4 className="text-xs uppercase font-black tracking-widest text-slate-500 mb-2">Application Fee</h4>
              <div className="p-3.5 bg-slate-800/40 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-semibold">
                {job.fee || 'Gen/OBC: ₹100 | SC/ST/PH: Free'}
              </div>
            </div>
          </div>

          {/* Core Description details */}
          {job.details && (
            <div>
              <h4 className="text-xs uppercase font-black tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-indigo-400" /> Summary Overview
              </h4>
              <div className="text-sm text-slate-200 leading-relaxed bg-slate-800/40 p-4 border border-slate-800/80 rounded-xl whitespace-pre-line font-medium">
                {job.details}
              </div>
            </div>
          )}

          {/* Sleek In-Line Google Ads Zone */}
          <GoogleAd format="horizontal" slot="ad-modal-internal-102" className="my-2" />

          {/* Safety Disclaimer */}
          <div className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-[11px] text-amber-200 leading-relaxed flex items-start gap-2 font-medium">
            <HelpCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong className="text-amber-300">Disclaimers:</strong> Candidates are highly advised to thoroughly study the official recruitment pdf specification before filing any online registration forms. Sarkari Result does not host/process official forms.</span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="sticky bottom-0 z-10 p-4 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 flex flex-col gap-3">
          
          {/* Top row with info and desktop close/link info */}
          <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
            <span className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase">
              Start Date: {job.applicationStart || 'Released'}
            </span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-indigo-400 hidden sm:inline">
              Verified Sarkari Result Notification
            </span>
          </div>

          {/* Mobile Layout: Split into Primary (Top) and Accessory Grid (Bottom) */}
          <div className="block sm:hidden space-y-2">
            {/* Primary Action Buttons Mobile Row */}
            <div className="grid grid-cols-2 gap-2">
              {/* Primary Action Button */}
              <a
                href={job.officialLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-2 rounded-xl text-xs font-black shadow-md hover:bg-blue-700 transition-all cursor-pointer text-center"
              >
                <span>Apply Online</span>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </a>

              {/* Share to WhatsApp Button */}
              <a
                href={getWhatsAppShareLink()}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-2 rounded-xl text-xs font-black shadow-md hover:bg-emerald-700 transition-all cursor-pointer text-center"
              >
                <span>WhatsApp Share</span>
                <MessageCircle className="h-4 w-4 shrink-0" />
              </a>
            </div>

            {/* Accessory Buttons Mobile Grid */}
            <div className="grid grid-cols-4 gap-2">
              {/* Bookmark */}
              <button
                onClick={onToggleBookmark}
                className={`flex flex-col items-center justify-center gap-2 py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  isBookmarked
                    ? 'bg-amber-955/40 border-amber-800/60 text-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
              </button>

              {/* Share */}
              <button
                onClick={handleShareLink}
                className={`flex flex-col items-center justify-center gap-2 py-1 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  shareSuccess
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-slate-900 border-slate-800 text-indigo-400 hover:text-indigo-300'
                }`}
              >
                {shareSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-indigo-400" />
                    <span>Share</span>
                  </>
                )}
              </button>

              {/* Calendar */}
              <button
                onClick={handleAddToCalendar}
                className={`flex flex-col items-center justify-center gap-2 py-2 px-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  calendarSuccess
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-slate-900 border-slate-800 text-emerald-400 hover:text-emerald-300'
                }`}
              >
                {calendarSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>Added!</span>
                  </>
                ) : (
                  <>
                    <CalendarPlus className="h-4 w-4 text-emerald-400" />
                    <span>Calendar</span>
                  </>
                )}
              </button>

              {/* PDF */}
              <button
                onClick={() => setShowPdfViewer(true)}
                className="flex flex-col items-center justify-center gap-2 py-2 px-1 rounded-xl text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
              >
                <FileText className="h-4 w-4 text-red-400" />
                <span>PDF Info</span>
              </button>
            </div>
          </div>

          {/* Desktop Layout: Sleek Side-by-Side row */}
          <div className="hidden sm:flex flex-wrap items-center justify-end gap-2">
            {/* Share to WhatsApp Button Desktop */}
            <a
              href={getWhatsAppShareLink()}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
              title="Share details to WhatsApp"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-white" />
              <span>Share to WhatsApp</span>
            </a>

            {/* Bookmark */}
            <button
              onClick={onToggleBookmark}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                isBookmarked 
                  ? 'bg-amber-955/40 border-amber-800/60 text-amber-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
            >
              <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            {/* Calendar */}
            <button
              onClick={handleAddToCalendar}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer ${
                calendarSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-900 hover:bg-slate-850 text-emerald-400 border border-slate-800'
              }`}
              title="Add event date to calendar"
            >
              {calendarSuccess ? (
                <>
                  <Check className="h-4 w-4 text-emerald-200 shrink-0" />
                  <span>Calendar Added!</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Add to Calendar</span>
                </>
              )}
            </button>

            {/* Share */}
            <button
              onClick={handleShareLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer ${
                shareSuccess 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-900 hover:bg-slate-850 text-indigo-400 border border-slate-800'
              }`}
              title="Copy direct share Link"
            >
              {shareSuccess ? (
                <>
                  <Check className="h-4 w-4 text-blue-200 shrink-0 font-extrabold" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Share Link</span>
                </>
              )}
            </button>

            {/* PDF */}
            <button
              onClick={() => setShowPdfViewer(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <FileText className="h-4 w-4 text-red-400 shrink-0" />
              <span>View PDF</span>
            </button>

            {/* Primary Action Button Desktop */}
            <a
              href={job.officialLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-md hover:bg-blue-700 transition-all cursor-pointer"
            >
              <span>Visit Official Apply Link</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

        </div>

      </div>
    </div>

      {/* Simulated Document / PDF Viewer Overlay Modal */}
      {showPdfViewer && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 flex flex-col justify-between overflow-hidden animate-fadeIn font-sans">
          
          {/* PDF TOP CONTROL BAR */}
          <div className="bg-[#1a237e] text-white p-3 flex flex-wrap items-center justify-between gap-3 border-b border-indigo-900/50 shadow-md">
            
            {/* Logo/Info */}
            <div className="flex items-center space-x-2.5">
              <span className="p-1 bg-red-600 rounded">
                <FileText className="h-4.5 w-4.5 text-white" />
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-black tracking-tight uppercase max-w-[220px] sm:max-w-xs truncate">
                  GOVT_OFFICIAL_RECRUITMENT_{job.id}.pdf
                </h4>
                <p className="text-[9px] text-indigo-200 uppercase font-bold tracking-widest">{job.authority}</p>
              </div>
            </div>

            {/* Document page scroll actions */}
            <div className="flex items-center space-x-1 sm:space-x-2.5">
              <button 
                onClick={() => setPdfPage(p => Math.max(1, p - 1))}
                disabled={pdfPage === 1}
                className="p-1 hover:bg-indigo-800 rounded disabled:opacity-30 cursor-pointer text-white"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-[11px] font-extrabold tracking-wider bg-indigo-950 px-2.5 py-1 rounded select-none">
                Page <span className="text-yellow-400">{pdfPage}</span> &nbsp;/&nbsp; 4
              </span>
              <button 
                onClick={() => setPdfPage(p => Math.min(4, p + 1))}
                disabled={pdfPage === 4}
                className="p-1 hover:bg-indigo-800 rounded disabled:opacity-30 cursor-pointer text-white"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Scale Zoom and Action Utility Group */}
            <div className="flex items-center space-x-2 sm:space-x-3 text-white">
              <div className="hidden md:flex items-center space-x-1.5 bg-indigo-950 px-2 py-1 rounded">
                <button 
                  onClick={() => setZoomLevel(z => Math.max(50, z - 10))}
                  className="p-1 hover:bg-indigo-800 rounded text-slate-300 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-bold select-none min-w-[36px] text-center">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel(z => Math.min(200, z + 10))}
                  className="p-1 hover:bg-indigo-800 rounded text-slate-300 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Direct Print and Download mock buttons */}
              <button 
                onClick={handlePrintPdf}
                className="p-2 hover:bg-indigo-800 rounded-md relative cursor-pointer"
                title="Print Document"
              >
                {printSuccess ? (
                  <Check className="h-4 text-emerald-400" />
                ) : (
                  <Printer className="h-4 w-4 text-white" />
                )}
                {printSuccess && (
                  <span className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-[9px] bg-slate-800 text-white font-bold py-0.5 px-2 rounded whitespace-nowrap">
                    Sent to printer!
                  </span>
                )}
              </button>

              <button 
                onClick={handleDownloadPdf}
                className="p-2 bg-indigo-800 hover:bg-indigo-700 hover:border-indigo-400 border border-transparent rounded-md transition-all relative cursor-pointer"
                title="Download PDF Notice"
              >
                {downloadSuccess ? (
                  <div className="flex items-center gap-1 text-[11px] font-black">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">Downloaded</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] font-black text-indigo-50">
                    <Download className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Download PDF</span>
                  </div>
                )}
              </button>

              <button 
                onClick={() => setShowPdfViewer(false)}
                className="p-2 bg-[#d32f2f] hover:bg-red-700 rounded-md text-white border border-red-500 font-extrabold cursor-pointer"
                title="Close Viewer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
          </div>

          {/* MAIN PDF PAGE GRAPHIC SYSTEM */}
          <div className="flex-1 overflow-auto bg-slate-800/80 p-4 flex justify-center items-start">
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="bg-white text-slate-800 shadow-2xl border border-slate-300 p-8 sm:p-12 w-full max-w-[800px] min-h-[1050px] transition-all flex flex-col justify-between my-4 relative font-serif select-text"
            >
              
              {/* PAGE 1 CONTENT */}
              {pdfPage === 1 && (
                <div className="space-y-6">
                  {/* Top Gazette Stamp Header */}
                  <div className="text-center space-y-2 border-b-2 border-slate-900 pb-5">
                    <div className="h-14 w-auto mx-auto flex justify-center mb-1">
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                        alt="State Emblem of India" 
                        className="h-full w-auto"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <h5 className="text-[12px] font-bold tracking-widest uppercase text-slate-900">Government of India</h5>
                    <h5 className="text-[10px] font-semibold tracking-wider uppercase text-slate-700">{job.authority.toUpperCase()}</h5>
                    <p className="text-[9px] italic text-slate-500 font-sans">Published in Part II, Section 3, Sub-section (i) of the Extraordinary Gazette of India</p>
                  </div>

                  {/* Ref & Date Area */}
                  <div className="flex justify-between text-[11px] font-sans font-bold border-b border-slate-200 pb-3">
                    <div>F. No. A-12011/12/2026-Estt. (B)</div>
                    <div>Dated: {job.applicationStart || 'Released January 2026'}</div>
                  </div>

                  {/* Main Notice Subject Heading */}
                  <div className="text-center py-4">
                    <h3 className="text-base sm:text-lg font-bold tracking-tight uppercase underline leading-tight decoration-double">
                      Official Recruitment Notice 2026
                    </h3>
                    <p className="text-xs font-semibold italic mt-1 font-sans text-slate-700">{job.title}</p>
                  </div>

                  {/* Body Text Clauses */}
                  <div className="space-y-4 text-xs leading-relaxed text-justify text-slate-800">
                    <p>
                      <strong>1. GENERAL INSTRUCTIONS:</strong> Online applications are hereby invited from eligible citizen candidates for direct deployment to the vacancies announced inside <strong>{job.authority}</strong> under recruitment reference code 2026. The positions carry all-India service liabilities. Interested aspirants must process applications along with authentic certifications strictly before <span className="font-bold text-red-600">{job.lastDate || 'Closing Date'}</span>.
                    </p>
                    <p>
                      <strong>2. SALARY MATRICES DETAILS:</strong> Candidates selected upon recommendation metrics shall be mounted per rules of corresponding Pay level tables:
                      <br />
                      <span className="block p-2.5 bg-slate-100 border-l-4 border-slate-600 rounded font-sans text-[11px] font-bold mt-2 text-slate-850">
                        {job.salary || 'Level standards plus central DA/HRA allowance allowances'}
                      </span>
                    </p>
                    <p>
                      <strong>3. SCHEME RULES OF RESERVATION:</strong> Concessionary provisions for Scheduled Castes (SC), Scheduled Tribes (ST), Other Backward Classes (OBC), Economically Weaker Sections (EWS), and Persons with Benchmark Disabilities (PwBD) are applied strictly under Ministry of Personnel orders.
                    </p>
                    
                    <div className="pt-6 border-t border-dashed border-slate-200 bg-slate-50 p-3 rounded-lg font-sans">
                      <p className="text-[10px] uppercase font-black text-blue-700 tracking-wider">★ CRITICAL REGISTRATION TIMELINES:</p>
                      <ul className="text-[11px] font-bold text-slate-600 mt-2 space-y-1">
                        <li>• Application Online Portal Starts: <span className="text-slate-800">{job.applicationStart || 'Soon'}</span></li>
                        <li>• Online Registration Closure Deadline: <span className="text-red-700 font-extrabold">{job.lastDate || 'Soon'}</span></li>
                        <li>• Deadline to Submit Prescribed Fees: <span className="text-slate-800">{job.lastDate || 'Soon'}</span></li>
                        <li>• Date of Competitive Computer-Based Exam: <span className="text-blue-700 font-extrabold">{job.examDate || 'Refer Annexure'}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 2 CONTENT */}
              {pdfPage === 2 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[10px] font-sans font-bold float-right uppercase text-slate-400">Section II - Vacancy Grid</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Document No. A-12011/2026/G-I</h4>
                  </div>

                  <h3 className="text-sm font-bold uppercase underline">4. DETAILED BREAKDOWN OF VACANCIES & RESERVATION SLOTS</h3>
                  <p className="text-xs text-justify leading-relaxed text-slate-800">
                    The total count of vacancies released tentatively for Indian citizens stands at <strong>{job.totalPosts || 'Refer table below'}</strong> jobs. Allocation slots are structured statically below:
                  </p>

                  <div className="overflow-x-auto pt-3">
                    <table className="w-full text-left text-xs border border-slate-400 border-collapse font-sans font-semibold">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-400 text-[10px] uppercase text-slate-600 font-black">
                          <th className="p-2 border-r border-slate-300">Category Slot</th>
                          <th className="p-2 border-r border-slate-300 text-center">Unreserved (UR)</th>
                          <th className="p-2 border-r border-slate-300 text-center">OBC Slot</th>
                          <th className="p-2 border-r border-slate-300 text-center">SC Category</th>
                          <th className="p-2 border-r border-slate-300 text-center">ST Slot</th>
                          <th className="p-2 border-r border-slate-300 text-center">EWS</th>
                          <th className="p-2 text-center">Aggregate Count</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300 text-slate-800">
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 font-bold">Executive Office Posts</td>
                          <td className="p-2 border-r border-slate-300 text-center">342</td>
                          <td className="p-2 border-r border-slate-300 text-center">210</td>
                          <td className="p-2 border-r border-slate-300 text-center">112</td>
                          <td className="p-2 border-r border-slate-300 text-center">54</td>
                          <td className="p-2 border-r border-slate-300 text-center">88</td>
                          <td className="p-2 text-center font-bold text-slate-900">806</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 font-bold">Field Assistants / Clerk</td>
                          <td className="p-2 border-r border-slate-300 text-center">512</td>
                          <td className="p-2 border-r border-slate-300 text-center">310</td>
                          <td className="p-2 border-r border-slate-300 text-center">180</td>
                          <td className="p-2 border-r border-slate-300 text-center">92</td>
                          <td className="p-2 border-r border-slate-300 text-center">120</td>
                          <td className="p-2 text-center font-bold text-slate-900">1,214</td>
                        </tr>
                        <tr className="hover:bg-slate-50">
                          <td className="p-2 border-r border-slate-300 font-bold">Technical Advisories</td>
                          <td className="p-2 border-r border-slate-300 text-center">118</td>
                          <td className="p-2 border-r border-slate-300 text-center">64</td>
                          <td className="p-2 border-r border-slate-300 text-center">42</td>
                          <td className="p-2 border-r border-slate-300 text-center">18</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">25</td>
                          <td className="p-2 text-center font-bold text-slate-900">267</td>
                        </tr>
                        <tr className="bg-slate-100 font-bold text-[11px] text-slate-900">
                          <td className="p-2 border-r border-slate-400">Total Overall Estimations</td>
                          <td className="p-2 border-r border-slate-400 text-center">972</td>
                          <td className="p-2 border-r border-slate-400 text-center">584</td>
                          <td className="p-2 border-r border-slate-400 text-center">334</td>
                          <td className="p-2 border-r border-slate-400 text-center">164</td>
                          <td className="p-2 border-r border-slate-400 text-center">233</td>
                          <td className="p-2 text-center underline font-black text-red-700">{job.totalPosts || '2,287+'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-xs text-slate-500 italic leading-relaxed mt-4">
                    *Note: The vacancy metrics listed are tentative. {job.authority} reserves absolute executive authority to increase, decrease, or terminate announced vacancy slots at any stage of recruitment cycles without issuing secondary declarations.
                  </p>
                </div>
              )}

              {/* PAGE 3 CONTENT */}
              {pdfPage === 3 && (
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-3">
                    <span className="text-[10px] font-sans font-bold float-right uppercase text-slate-400">Section III - Eligibility</span>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Document No. A-12011/2026/G-I</h4>
                  </div>

                  <h3 className="text-sm font-bold uppercase underline">5. ELIGIBILITY SCHEME PARAMETERS</h3>
                  
                  <div className="space-y-4 text-xs font-sans">
                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">• CITIZENSHIP & NATIONALITY:</h4>
                      <p className="text-slate-600 leading-relaxed font-semibold pl-3 text-justify">
                        Candidates wishing to apply online must hold citizenship of the Republic of India, or subjects of Bhutan/Nepal under rules declared by home departments.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">• PRESCRIBED EDUCATION LEVEL CRITERIA:</h4>
                      <div className="text-slate-600 leading-relaxed font-semibold pl-3 text-justify">
                        Candidates must satisfy minimum qualification thresholds below relative to their application profile:
                        <p className="p-2 bg-blue-50 text-blue-900 font-extrabold text-[10.5px] border border-blue-100 rounded mt-1.5">
                          {job.qualification}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded border border-slate-200">
                      <h4 className="font-black text-slate-800 text-[11px] uppercase tracking-wider mb-1.5">• PRESCRIBED AGE THRESHOLDS:</h4>
                      <div className="text-slate-600 leading-relaxed font-semibold pl-3">
                        Candidate profile must strictly fall between guidelines below on standard baseline cutoff:
                        <p className="p-2 bg-slate-100 text-slate-800 font-black text-[10.5px] border border-slate-200 rounded mt-1.5">
                          {job.ageLimit || 'Minimum: 18 Years | Maximum: 27 Years'}
                        </p>
                        <ul className="mt-2 space-y-1 text-[10px] text-slate-500 font-bold leading-normal">
                          <li>• SC / ST Candidates: Relaxable by standard 05 years</li>
                          <li>• OBC Candidates (Non-Creamy): Relaxable by standard 03 years</li>
                          <li>• PwBD Category Candidates: Relaxable by standard 10 years</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGE 4 CONTENT */}
              {pdfPage === 4 && (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="border-b border-slate-900 pb-3">
                      <span className="text-[10px] font-sans font-bold float-right uppercase text-slate-400">Section IV - Test Scheme</span>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Document No. A-12011/2026/G-I</h4>
                    </div>

                    <h3 className="text-sm font-bold uppercase underline mt-4">6. STRUCTURE & SCHEME OF COMPETITIVE WRITTEN EXAMINATION</h3>
                    <p className="text-xs text-justify leading-relaxed mt-1 text-slate-800">
                      Recruitment evaluation metrics are processed across subsequent levels of assessment:
                    </p>

                    <div className="mt-4 space-y-3.5 text-xs">
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                        <strong className="text-blue-900 uppercase">Tier I: Computer-Based Written Examination</strong>
                        <p className="text-slate-600 font-sans mt-0.5">
                          Objective test with Multiple Choice (MCQs) carrying 200 aggregate marks across General English (50 marks), Reasoning Ability (50 marks), Quantitative Aptitude (50 marks), and General Awareness (50 marks). Penalty for incorrect options stands at 0.50 points per error.
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                        <strong className="text-blue-900 uppercase">Tier II: Technical Evaluation and Skill Testing</strong>
                        <p className="text-slate-600 font-sans mt-0.5">
                          Descriptive test examining subject parameters or direct typing skills evaluating speed limits per eligibility definitions (e.g., minimum speeds matching qualification levels).
                        </p>
                      </div>
                      
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800">
                        <strong className="text-emerald-950 uppercase">Tier III: Document Verification Portfolio Check</strong>
                        <p className="text-slate-600 font-sans mt-0.5">
                          Successful selection recommendations require physical verification of educational degrees, identity records, and reservation categories certificates.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SIGNATURE AREA AT THE BOTTOM OF THE LAST PAGE */}
                  <div className="border-t border-slate-300 pt-6 mt-8 flex justify-between items-end font-sans">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      End of Notification Notice
                    </div>
                    <div className="text-right space-y-1.5 shrink-0">
                      <div className="h-10 w-32 ml-auto p-1 bg-slate-100 border border-slate-200 rounded flex items-center justify-center select-none shadow-inner opacity-80">
                        <span className="text-[10px] italic text-slate-400 font-black font-sans">Authorized Official Sign</span>
                      </div>
                      <div className="text-[11px] font-black text-slate-900">
                        (MOHINDER SINGH MATHANI)
                      </div>
                      <div className="text-[9px] uppercase tracking-wide text-slate-500 font-extrabold leading-none">
                        Under Secretary to the Government of India
                        <br />
                        {job.authority}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* FOOTER COUNTER */}
              <div className="border-t border-slate-200 pt-2 font-sans flex justify-between text-[10px] font-extrabold text-slate-400 uppercase select-none mt-auto">
                <span>RECRUITMENT CODE: 2026-REF</span>
                <span>Page {pdfPage} of 4</span>
                <span>EMBLEM INDEX: SECURED</span>
              </div>

            </div>
          </div>

          {/* LOWER TOOLBAR BAR */}
          <div className="bg-[#11164c] p-2 text-center text-[10px] text-indigo-300 select-none flex items-center justify-between px-4">
            <span>Powered by National Informatics Center (NIC) / Sarkari Result Viewer</span>
            <span>Document integrity verified and cryptographically stamped</span>
          </div>

        </div>
      )}
    </>
  );
}
