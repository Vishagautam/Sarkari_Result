import React from 'react';
import { Search, Flame, Bot, Smartphone, Mic, MicOff } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAiMitra: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Header({ searchQuery, setSearchQuery, onOpenAiMitra, activeTab, onTabChange }: HeaderProps) {
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isListening, setIsListening] = React.useState(false);
  const [speechError, setSpeechError] = React.useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = React.useState(true);
  const recognitionRef = React.useRef<any>(null);

  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }
  }, []);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice Search is not supported on this browser. Please try Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // 'en-IN' is excellent for recognizing typical English/Hindi blended recruitment queries in India
      recognition.lang = 'en-IN'; 

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError("Microphone permission denied.");
        } else {
          setSpeechError(`Voice Error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          onTabChange('home');
          setShowDropdown(true);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error(err);
      setIsListening(false);
    }
  };

  const trendingKeywords = [
    { text: 'SSC GD Constable', tab: 'results', searchTerm: 'SSC GD', label: 'Result' },
    { text: 'Railway RRB ALP', tab: 'jobs', searchTerm: 'Railway RRB', label: 'Job' },
    { text: 'UP Police Constable', tab: 'admit', searchTerm: 'UP Police', label: 'Admit Card' },
    { text: 'UPSC Civil Services', tab: 'jobs', searchTerm: 'UPSC', label: 'Job' },
    { text: 'CBSE 12th Result', tab: 'results', searchTerm: 'CBSE', label: 'Result' }
  ];

  // Filter trending options dynamically as the user types
  const displayKeywords = searchQuery
    ? trendingKeywords.filter(k => k.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : trendingKeywords;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      {/* Tricolor Ribbon Strip */}
      <div className="h-1.5 w-full flex">
        <div className="h-full flex-1 bg-[#FF9933]"></div> {/* Saffron */}
        <div className="h-full flex-1 bg-white"></div>     {/* White */}
        <div className="h-full flex-1 bg-[#138808]"></div> {/* Green */}
      </div>

      {/* Primary Sleek Header */}
      <div className="bg-[#1a237e] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div onClick={() => onTabChange('home')} className="flex items-center space-x-3 text-center md:text-left cursor-pointer group">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white p-1 shadow-lg border border-red-500 select-none shrink-0 group-hover:bg-slate-100 transition-colors">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Satyameva Jayate" 
                className="h-full w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 id="brand-title" className="text-3xl sm:text-4xl font-extrabold tracking-tighter leading-none text-white">
                SARKARI RESULT
              </h1>
              <p className="text-[10px] sm:text-xs uppercase tracking-widest text-blue-200 font-bold mt-1">
                sarkariresultgovt.online — The Best Portal for Govt Jobs
              </p>
            </div>
          </div>

          {/* Call Support & Apps Banner */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[10px] text-blue-300 uppercase tracking-wider font-extrabold">Official Support</span>
              <span className="text-[13px] font-black text-blue-100">sarkariresultcm@gmail.com</span>
            </div>
            
            <button
              onClick={onOpenAiMitra}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs sm:text-sm font-black py-2 px-5 rounded-md shadow-lg transition-all transform hover:scale-102 active:scale-98 cursor-pointer select-none"
            >
              <Bot className="h-4 w-4 shrink-0" />
              <span>Ask AI Career Mitra</span>
            </button>
          </div>
        </div>
      </div>

      {/* Red Navigation Bar */}
      <nav className="bg-[#d32f2f] text-white shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center relative">
          <ul className="flex flex-wrap justify-center sm:justify-start font-black text-xs sm:text-sm uppercase tracking-wider">
            <li
              onClick={() => onTabChange('home')}
              className={`px-4 py-3.5 cursor-pointer transition-colors border-r border-red-700/30 ${activeTab === 'home' ? 'bg-red-900 border-b-2 border-white' : 'hover:bg-red-800'}`}
            >
              Home
            </li>
            <li
              onClick={() => onTabChange('jobs')}
              className={`px-4 py-3.5 cursor-pointer transition-colors border-r border-red-700/30 ${activeTab === 'jobs' ? 'bg-red-900 border-b-2 border-white' : 'hover:bg-red-800'}`}
            >
              Latest Jobs
            </li>
            <li
              onClick={() => onTabChange('results')}
              className={`px-4 py-3.5 cursor-pointer transition-colors border-r border-red-700/30 ${activeTab === 'results' ? 'bg-red-900 border-b-2 border-white' : 'hover:bg-red-800'}`}
            >
              Results
            </li>
            <li
              onClick={() => onTabChange('admit')}
              className={`px-4 py-3.5 cursor-pointer transition-colors border-r border-red-700/30 ${activeTab === 'admit' ? 'bg-red-900 border-b-2 border-white' : 'hover:bg-red-800'}`}
            >
              Admit Card
            </li>
            <li
              onClick={() => onTabChange('answer-keys')}
              className={`px-4 py-3.5 cursor-pointer transition-colors border-r border-red-700/30 ${activeTab === 'answer-keys' ? 'bg-red-900 border-b-2 border-white' : 'hover:bg-red-800'}`}
            >
              Answer Key
            </li>
            <li
              onClick={() => onTabChange('syllabus')}
              className={`px-4 py-3.5 cursor-pointer transition-colors border-r border-red-700/30 hide-on-mobile sm:block ${activeTab === 'syllabus' ? 'bg-red-900 border-b-2 border-white' : 'hover:bg-red-800'}`}
            >
              Syllabus
            </li>
          </ul>

          {/* Search Box on red nav with absolute quick-search dropdown container */}
          <div className="w-full sm:w-64 py-2 sm:py-0 pb-3 sm:pb-0 relative z-50">
            <div className="relative flex items-center">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-red-300" />
              </span>
              <input
                id="search-input"
                type="text"
                placeholder={isListening ? "Listening... Speak now!" : "Search recruitment portals..."}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => {
                  // Small delay to allow clicking search dropdown options before blur closes them
                  setTimeout(() => setShowDropdown(false), 200);
                }}
                className={`block w-full pl-9 pr-9 py-1.5 border border-red-700 rounded-md text-xs transition-all ${
                  isListening 
                    ? 'bg-red-900 border-white text-white placeholder:text-white/80 ring-2 ring-white font-extrabold animate-pulse'
                    : 'bg-red-800/50 text-white placeholder:text-red-200/70 focus:outline-none focus:ring-1 focus:ring-white focus:bg-red-900/50'
                }`}
              />
              
              {/* Voice search button inside the input element on the right */}
              {speechSupported && (
                <button
                  type="button"
                  id="voice-search-btn"
                  onClick={toggleListening}
                  className={`absolute right-1 p-1 rounded-md transition-all duration-300 flex items-center justify-center select-none ${
                    isListening 
                      ? 'bg-white text-red-600 shadow-md scale-110' 
                      : 'text-red-200 hover:text-white hover:bg-red-700/50 cursor-pointer'
                  }`}
                  title="Search by voice"
                >
                  {isListening ? (
                    <Mic className="h-3.5 w-3.5 animate-bounce" />
                  ) : (
                    <Mic className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>

            {/* Dynamic Status Feedback for Speech Recognition */}
            {isListening && (
              <div 
                id="voice-search-status-tooltip"
                className="absolute right-0 left-0 top-full mt-2 bg-slate-950 border border-slate-800 text-white rounded-xl shadow-2xl p-3 z-[60] flex flex-col items-center gap-2 animate-fadeIn"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-300">Listening... Speak Now</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center font-bold">
                  Try speaking: &quot;Railway recruitment&quot; or &quot;SSC GD Constable result&quot;
                </p>
                {/* Audio wave indicator */}
                <div className="flex gap-1 items-end justify-center h-4 mt-1">
                  <span className="w-1 bg-red-500 rounded-full animate-pulse h-3"></span>
                  <span className="w-1 bg-red-400 rounded-full animate-pulse h-4"></span>
                  <span className="w-1 bg-red-500 rounded-full animate-pulse h-2"></span>
                  <span className="w-1 bg-red-400 rounded-full animate-pulse h-3"></span>
                </div>
              </div>
            )}

            {speechError && (
              <div 
                id="voice-search-error-tooltip"
                className="absolute right-0 left-0 top-full mt-2 bg-red-950 border border-red-800 text-red-200 rounded-xl shadow-2xl p-2.5 z-[60] text-center text-[10px] font-bold leading-relaxed animate-fadeIn"
              >
                <p>{speechError}</p>
                <button 
                  onClick={() => setSpeechError(null)}
                  className="mt-1 text-[9px] font-black uppercase tracking-wider text-white hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Quick-Search dropdown menu absolute card */}
            {showDropdown && displayKeywords.length > 0 && (
              <div 
                id="search-quick-dropdown"
                className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 shadow-xl rounded-md overflow-hidden text-slate-800 animate-fadeIn"
              >
                <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider flex justify-between items-center select-none">
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> Popular Trending Search
                  </span>
                  <span>Direct Match</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto">
                  {displayKeywords.map((item, index) => (
                    <button
                      key={item.text}
                      onMouseDown={(e) => {
                        e.preventDefault(); // crucial to prevent onBlur dismiss before click executes!
                        setSearchQuery(item.searchTerm);
                        onTabChange(item.tab);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 active:bg-slate-100 flex items-center justify-between transition-colors focus:outline-none cursor-pointer"
                    >
                      <span className="font-extrabold text-blue-800 line-clamp-1">{item.text}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        item.label === 'Result' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        item.label === 'Admit Card' ? 'bg-red-50 text-red-700 border border-red-100' :
                        'bg-green-50 text-green-700 border border-green-100'
                      }`}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sleek Flash Yellow Ticker */}
      <div className="bg-yellow-100 border-b border-yellow-200 py-2 px-4 overflow-hidden select-none">
        <div className="max-w-7xl mx-auto flex items-center text-xs font-bold gap-3">
          <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase animate-pulse shrink-0 flex items-center gap-1">
            <Flame className="h-3 w-3 fill-white" /> FLASH
          </span>
          <div className="relative overflow-hidden w-full h-4">
            <div className="absolute animate-[marquee_25s_linear_infinite] whitespace-nowrap flex gap-8">
              <span className="text-red-700 font-extrabold flex items-center shrink-0">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2 shrink-0"></span>
                SSC GD Constable Result Declared - Click Here
              </span>
              <span className="text-blue-800 font-extrabold flex items-center shrink-0">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2 shrink-0"></span>
                UPPSC RO/ARO Re-Exam Date Announced
              </span>
              <span className="text-green-700 font-extrabold flex items-center shrink-0">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2 shrink-0"></span>
                RRB ALP Revised Total Vacancies Increased to 18,799! Download Now
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
