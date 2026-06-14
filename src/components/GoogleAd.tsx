import React, { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, CheckCircle2, DollarSign, Info, Sparkles } from 'lucide-react';

interface GoogleAdProps {
  slot?: string;
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  responsive?: boolean;
  className?: string;
}

// Highly relevant educational & exam coaching mock ads to display in sandbox/adblocker fallback
const MOCK_ADS = {
  horizontal: [
    {
      title: "🔥 ExamPrep Prime Online Live Classes Batch",
      subtitle: "Crack SSC, Railway, & Banking Exams in 90 Days under India's TOP Educators!",
      cta: "Join Live Batch — 50% OFF",
      highlight: "UPSC Level Quality",
      colorClass: "from-indigo-600 to-blue-700",
      link: "#"
    },
    {
      title: "📚 Download 2026 General Knowledge Mega PDF",
      subtitle: "10,000+ Topicwise Solved MCQ questions for all Central & State recruitment examinations.",
      cta: "Instant PDF Download",
      highlight: "Revised Edition",
      colorClass: "from-[#d32f2f] to-orange-600",
      link: "#"
    }
  ],
  rectangle: [
    {
      title: "🏆 UPSC civil services Masterclass",
      subtitle: "Complete mock answers and premium guidance sheets by IAS Toppers.",
      cta: "Register for Webinar",
      highlight: "Limited Seats",
      colorClass: "from-slate-900 to-indigo-950",
      link: "#"
    },
    {
      title: "⏱️ Speed-Math Shortcut Masterclass",
      subtitle: "Solve 20 Quantitative Aptitude sums in 5 minutes. Guaranteed score booster for IBPS & SSC.",
      cta: "Buy Course @ ₹299",
      highlight: "Banker Special",
      colorClass: "from-emerald-800 to-teal-950",
      link: "#"
    }
  ],
  vertical: [
    {
      title: "⚡ Target RRB ALP 2026 Test Series",
      subtitle: "Full-length bilingual test papers with detailed analytical solution breakdowns.",
      cta: "Start Free Practice",
      highlight: "100k+ Aspirants",
      colorClass: "from-amber-600 to-red-700",
      link: "#"
    }
  ]
};

export default function GoogleAd({
  slot = 'default-slot-101',
  format = 'auto',
  responsive = true,
  className = ''
}: GoogleAdProps) {
  const [isAdBlockerActive, setIsAdBlockerActive] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Pull publisher client ID from env, or default to the user's verified client ID
  const rawClientId = (import.meta as any).env?.VITE_GOOGLE_ADSENSE_CLIENT;
  const clientId = rawClientId && rawClientId !== 'ca-pub-XXXXXXXXXXXXXXXX' ? rawClientId : 'ca-pub-8340394030904166';
  const isRealClient = clientId !== 'ca-pub-XXXXXXXXXXXXXXXX';

  // Select a mock ad based on format
  const mockFormat = format === 'rectangle' ? 'rectangle' : format === 'vertical' ? 'vertical' : 'horizontal';
  const mockAdsList = MOCK_ADS[mockFormat];
  // Stable select index for page consistency
  const adIndex = Math.abs(slot.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % mockAdsList.length;
  const activeMockAd = mockAdsList[adIndex];

  useEffect(() => {
    // 1. Programmatically load AdSense Script if not already loaded
    const scriptId = 'google-adsense-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    const handleScriptError = () => {
      setIsAdBlockerActive(true);
      console.warn("Google AdSense script failed to load. Ad blocker may be active or file sandbox restrictions are in place.");
    };

    const handleScriptLoad = () => {
      setIsScriptLoaded(true);
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('load', handleScriptLoad);
      script.addEventListener('error', handleScriptError);
      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }

    // 2. Push to adsbygoogle inside block
    if (isRealClient) {
      try {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      } catch (err) {
        console.error("AdSense initialization caught error", err);
      }
    }

    return () => {
      // Keep script to avoid reloading repeatedly on other ad mount cycles
    };
  }, [clientId, isRealClient]);

  // Define layout styles for mock elements
  const getLayoutStyles = () => {
    switch (format) {
      case 'rectangle':
        return 'min-h-[250px] w-full flex flex-col justify-between p-5 rounded-2xl border';
      case 'vertical':
        return 'min-h-[400px] w-[160px] sm:w-[240px] flex flex-col justify-between p-5 rounded-2xl border mx-auto';
      default: // leaderboard or auto horizontal
        return 'min-h-[90px] py-4 px-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 w-full';
    }
  };

  // Render original Google Ads container if a real verified script loads and user has defined a custom ID
  const shouldRenderRealAd = isRealClient && !isAdBlockerActive;

  return (
    <div className={`google-ad-zone relative select-none text-left z-10 ${className}`}>
      
      {shouldRenderRealAd ? (
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl overflow-hidden p-2">
          {/* Ad Label */}
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center mb-1">
            Advertisement (Google Adsense Zone)
          </div>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={clientId}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? "true" : "false"}
          />
        </div>
      ) : (
        /* Highly Polished Native Sponsor Mock Ad fallback with developer integration guides */
        <div className={`relative overflow-hidden shadow-sm bg-gradient-to-br ${activeMockAd.colorClass} border-white/5 text-white ${getLayoutStyles()} transition-all duration-300 group`}>
          
          {/* Decorative Sparkle backgrounds */}
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-32 h-32 bg-white/5 rounded-full select-none pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="absolute bottom-0 left-0 transform -translate-x-12 translate-y-12 w-28 h-28 bg-white/5 rounded-full select-none pointer-events-none" />

          {/* Ad Metadata Badges */}
          <div className="flex items-center justify-between w-full relative z-20">
            <span className="bg-white/20 hover:bg-white/30 text-white rounded-full text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 flex items-center gap-1 transition-all">
              <Sparkles className="h-2.5 w-2.5 fill-current animate-pulse" />
              {activeMockAd.highlight}
            </span>

            {/* Micro Admin Indicator Settings */}
            <button
              id={`ad-info-btn-${slot}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowConfigGuide(!showConfigGuide);
              }}
              className="px-2 py-0.5 rounded bg-black/30 hover:bg-black/50 text-white/90 hover:text-white transition-all text-[9.5px] font-extrabold flex items-center gap-1 cursor-pointer"
              title="Click to view AdSense revenue setup instructions"
            >
              <Info className="h-3 w-3" />
              <span>Ad Setup</span>
            </button>
          </div>

          {/* Core advertisement messaging structure inside layout */}
          {format === 'rectangle' || format === 'vertical' ? (
            <div className="my-4 relative z-10 flex-1 flex flex-col justify-center text-center sm:text-left">
              <h5 className="font-extrabold text-sm sm:text-base tracking-tight leading-snug">{activeMockAd.title}</h5>
              <p className="text-xs text-white/80 leading-relaxed mt-2 font-medium">{activeMockAd.subtitle}</p>
            </div>
          ) : (
            <div className="flex-1 relative z-10">
              <h5 className="font-extrabold text-sm sm:text-base tracking-tight leading-none mt-1">{activeMockAd.title}</h5>
              <p className="text-xs text-white/80 leading-normal mt-1.5 font-medium">{activeMockAd.subtitle}</p>
            </div>
          )}

          {/* Call to action action layout */}
          <div className={`relative z-10 flex items-center ${format === 'rectangle' || format === 'vertical' ? 'w-full pt-1' : 'shrink-0'}`}>
            <a
              href={activeMockAd.link}
              onClick={(e) => e.preventDefault()}
              className="bg-white hover:bg-slate-100 text-slate-900 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1 w-full justify-center select-all cursor-pointer"
            >
              <span>{activeMockAd.cta}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Configuration Overlay Guide: Explains how to integrate Google AdSense inside AI Studio dynamically */}
          {showConfigGuide && (
            <div className="absolute inset-0 bg-slate-950/98 z-30 p-4 flex flex-col justify-between text-slate-100 animate-fadeIn">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-green-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 fill-green-950" /> Ready to Earn Money?
                  </span>
                  <button
                    onClick={() => setShowConfigGuide(false)}
                    className="text-[10px] text-slate-400 hover:text-white font-black uppercase px-2 py-1 rounded bg-slate-800"
                  >
                    Close
                  </button>
                </div>
                <div className="text-[11px] leading-relaxed text-slate-300 space-y-1.5 font-medium">
                  <p>
                    I have built <strong className="text-white">live Google AdSense units</strong> into your app layout. To start earning, link your AdSense account:
                  </p>
                  <ol className="list-decimal list-inside pl-1 text-[10px] text-slate-400 space-y-1">
                    <li>Open <strong className="text-slate-200">Secrets panel</strong> in Settings first.</li>
                    <li>Add your Google AdSense Publisher ID.</li>
                    <li>Key: <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-400">VITE_GOOGLE_ADSENSE_CLIENT</code></li>
                    <li>Value: <code className="bg-slate-900 px-1 py-0.5 rounded text-emerald-400">ca-pub-XXXXXXXXXXXXXXXX</code></li>
                  </ol>
                  <p className="text-[9.5px] italic text-slate-500 bg-slate-900/50 p-1.5 rounded border border-slate-800/80">
                    Ads load script programmatically and register automatically after adding the valid Client ID.
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-[#d32f2f]/20 border border-[#d32f2f]/30 p-2 rounded-xl text-[10px] text-red-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>Make sure your domain is approved inside Google AdSense console.</span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
