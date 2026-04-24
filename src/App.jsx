import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactGA from "react-ga4";
import {
  Search,
  Home,
  Monitor,
  LayoutDashboard,
  BarChart3,
  Calendar as CalendarIcon,
  Database,
  Mail,
  ArrowUpRight,
  TrendingUp,
  Globe,
  Activity,
  Loader2,
  Maximize2,
  PieChart,
  Gauge,
  Zap,
  Moon,
  Clock,
  Briefcase,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Award,
  BarChart,
  QrCode,
  X,
  Share2,
  Download,
  AlertTriangle,
  Filter,
  Users,
  LineChart,
  Eye,
  BookOpen,
  Scale,
  Lock,
  Unlock,
  Menu,
  Landmark,
  MessageSquare,
  Send
} from 'lucide-react';

const CONTAINER = "max-w-[1400px] 2xl:max-w-[1600px] mx-auto w-full";

// --- Market Status & Dynamic Holiday Component ---
const MarketStatusBanner = () => {
  const [status, setStatus] = useState({
    isOpen: false,
    message: 'Calculating...',
    nextEvent: ''
  });

  const currentYear = new Date().getFullYear();

  const holidaySchedule = useMemo(() => {

    const getNthWeekday = (year, month, dayOfWeek, n) => {
      let date = new Date(year, month, 1);
      let count = 0;
      while (date.getMonth() === month) {
        if (date.getDay() === dayOfWeek) {
          count++;
          if (count === n) return new Date(date);
        }
        date.setDate(date.getDate() + 1);
      }
    };

    const getLastWeekday = (year, month, dayOfWeek) => {
      let date = new Date(year, month + 1, 0);
      while (date.getDay() !== dayOfWeek) {
        date.setDate(date.getDate() - 1);
      }
      return new Date(date);
    };

    const getObservedDate = (date) => {
      const d = new Date(date);
      if (d.getDay() === 0) d.setDate(d.getDate() + 1);
      if (d.getDay() === 6) d.setDate(d.getDate() - 1);
      return d;
    };

    const formatDate = (d) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // 🔥 Easter calculation (for Good Friday)
    const getEasterSunday = (year) => {
      const a = year % 19;
      const b = Math.floor(year / 100);
      const c = year % 100;
      const d = Math.floor(b / 4);
      const e = b % 4;
      const f = Math.floor((b + 8) / 25);
      const g = Math.floor((b - f + 1) / 3);
      const h = (19 * a + b - d - g + 15) % 30;
      const i = Math.floor(c / 4);
      const k = c % 4;
      const l = (32 + 2 * e + 2 * i - h - k) % 7;
      const m = Math.floor((a + 11 * h + 22 * l) / 451);
      const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
      const day = ((h + l - 7 * m + 114) % 31) + 1;

      return new Date(year, month, day);
    };

    const easter = getEasterSunday(currentYear);
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);

    const holidays = [
      { name: "New Year's", date: getObservedDate(new Date(currentYear, 0, 1)) },
      { name: "MLK Day", date: getNthWeekday(currentYear, 0, 1, 3) },
      { name: "Presidents", date: getNthWeekday(currentYear, 1, 1, 3) },
      { name: "Good Fri", date: goodFriday },
      { name: "Memorial", date: getLastWeekday(currentYear, 4, 1) },
      { name: "Juneteenth", date: getObservedDate(new Date(currentYear, 5, 19)) },
      { name: "July 4th", date: getObservedDate(new Date(currentYear, 6, 4)) },
      { name: "Labor Day", date: getNthWeekday(currentYear, 8, 1, 1) },
      { name: "Thanksgiving", date: getNthWeekday(currentYear, 10, 4, 4) },
      { name: "Christmas", date: getObservedDate(new Date(currentYear, 11, 25)) },
    ];

    return holidays
      .sort((a, b) => a.date - b.date)
      .map(h => ({
        name: h.name,
        date: h.date,
        formatted: formatDate(h.date)
      }));

  }, [currentYear]);

  // ✅ Find next holiday
  const nextHolidayIndex = useMemo(() => {
    const now = new Date();

    return holidaySchedule
      .map((h, i) => ({ ...h, i }))
      .filter(h => h.date >= now)
      .sort((a, b) => a.date - b.date)[0]?.i ?? -1;

  }, [holidaySchedule]);

  // ✅ Market status (extended with next holiday info)
  useEffect(() => {
      const isSameDayEST = (date1, date2) => {
        const toEST = (d) =>
          new Date(
            new Intl.DateTimeFormat('en-US', {
              timeZone: 'America/New_York',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(d)
          );

        const d1 = toEST(date1);
        const d2 = toEST(date2);

        return (
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate()
        );
      };
    const checkMarketStatus = () => {
      const now = new Date();

      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        weekday: 'short'
      }).formatToParts(now);

      const weekday = parts.find(p => p.type === 'weekday').value;
      const hour = parseInt(parts.find(p => p.type === 'hour').value);
      const minute = parseInt(parts.find(p => p.type === 'minute').value);

      const isWeekend = weekday === 'Sat' || weekday === 'Sun';

      // 🕒 Time windows (EST)
      const isPremarket =
        (hour >= 4 && hour < 9) || (hour === 9 && minute < 30);

      const isRegular =
        (hour === 9 && minute >= 30) || (hour > 9 && hour < 16);

      const isAfterHours =
        (hour >= 16 && hour < 20);

      // 📅 Today holiday check
      const todayHoliday = holidaySchedule.find(h =>
        isSameDayEST(h.date, now)
      );

      // 🔮 Next holiday info
      let nextEventText = '';
      if (nextHolidayIndex !== -1) {
        const nextHoliday = holidaySchedule[nextHolidayIndex];
        const days = Math.ceil(
          (nextHoliday.date - now) / (1000 * 60 * 60 * 24)
        );

        nextEventText = `Next Holiday: ${nextHoliday.name} (${nextHoliday.formatted}) in ${days}d`;
      }

      // 🚨 HOLIDAY OVERRIDE
      if (todayHoliday) {
        setStatus({
          isOpen: false,
          message: 'Market Closed',
          nextEvent: `Closed for ${todayHoliday.name}`
        });
        return;
      }

      // 🚨 WEEKEND
      if (isWeekend) {
        setStatus({
          isOpen: false,
          message: 'Market Closed',
          nextEvent: nextEventText || 'Opens Monday 4:00 AM EST (Premarket)'
        });
        return;
      }

      // 🟡 PREMARKET
      if (isPremarket) {
        setStatus({
          isOpen: true,
          message: 'Premarket',
          nextEvent: nextEventText || 'Regular opens 9:30 AM EST'
        });
        return;
      }

      // 🟢 REGULAR HOURS
      if (isRegular) {
        setStatus({
          isOpen: true,
          message: 'Market Open',
          nextEvent: nextEventText || 'Closes at 4:00 PM EST'
        });
        return;
      }

      // 🔵 AFTER HOURS
      if (isAfterHours) {
        setStatus({
          isOpen: true,
          message: 'After Hours',
          nextEvent: nextEventText || 'Closes at 8:00 PM EST'
        });
        return;
      }

      // ⚫ NIGHT (fully closed)
      setStatus({
        isOpen: false,
        message: 'Market Closed',
        nextEvent: nextEventText || 'Opens 4:00 AM EST (Premarket)'
      });
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, [holidaySchedule, nextHolidayIndex]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

      {/* LEFT PANEL */}
      <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-[2rem] flex flex-col justify-between shadow-xl backdrop-blur-sm">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
              Exchange Status
            </p>
            <h4 className="text-2xl font-black text-white flex items-center gap-2">
              {status.message === 'Market Open' && (
                <Unlock className="text-emerald-500" size={20} />
              )}

              {status.message === 'Market Closed' && (
                <Lock className="text-red-500" size={20} />
              )}

              {status.message === 'Premarket' && (
                <Zap className="text-yellow-400" size={20} />
              )}

              {status.message === 'After Hours' && (
                <Moon className="text-blue-400" size={20} />
              )}

              {status.message}
            </h4>
          </div>

          <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${
            status.isOpen
              ? 'bg-emerald-500/10 text-emerald-500'
              : 'bg-red-500/10 text-red-500'
          }`}>
            Live Feed
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <p className="text-[11px] text-gray-400 font-medium flex items-center gap-2">
            <Clock size={12}/> {status.nextEvent}
          </p>
        </div>
      </div>

      {/* HOLIDAY PANEL */}
      <div className="md:col-span-2 bg-gray-900/40 border border-gray-800 p-6 rounded-[2rem] shadow-xl backdrop-blur-sm">

        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={12} /> NYSE / NASDAQ HOLIDAYS {currentYear}
          </h4>
          <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {holidaySchedule.map((holiday, i) => {
            const isNext = i === nextHolidayIndex;

            return (
              <div
                key={i}
                className={`p-2 rounded-xl text-center transition-all border ${
                  isNext
                    ? 'bg-blue-500/20 border-blue-500 scale-105'
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                }`}
              >
                <p className="text-[9px] font-black text-white truncate uppercase">
                  {holiday.name}
                </p>

                <p className={`text-[11px] font-bold ${
                  isNext ? 'text-blue-400' : 'text-gray-500'
                }`}>
                  {holiday.formatted}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

// --- Macro Data Components (FRED) ---

const FredChart = ({ url, title }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3 px-2">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">{title}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[8px] text-gray-600 font-bold uppercase">Fluid Width</span>
                   <Landmark size={14} className="text-gray-600" />
                </div>
            </div>
            <div className="flex-1 bg-gray-900/60 rounded-[2.5rem] border border-gray-800 overflow-hidden relative group min-h-[600px]">
                <iframe
                    src={url}
                    className="w-full h-full border-none filter grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                    scrolling="no" frameborder="0"
                    style={{ width: '100%', height: '100%' }}
                    allowTransparency="true" loading="lazy"
                />
                <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-[2.5rem] shadow-inner" />
            </div>
        </div>
    );
};

const MacroSection = () => {
    const macroData = [
        { title: "CPI (Inflation)", url: "https://fred.stlouisfed.org/graph/graph-landing.php?g=1k6gW&width=100%&height=570" },
        { title: "Unemployment Rate", url: "https://fred.stlouisfed.org/graph/graph-landing.php?g=1jGaT&width=100%&height=570" },
        { title: "Fed Funds Rate", url: "https://fred.stlouisfed.org/graph/graph-landing.php?g=1n07T&width=100%&height=570" },
        { title: "Real GDP Growth", url: "https://fred.stlouisfed.org/graph/graph-landing.php?g=1lk6a&width=100%&height=570" }
    ];

    return (
        <div className="space-y-8 pt-12 mt-12 border-t border-gray-800/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                        <Scale size={18} className="text-indigo-500" /> Macro Economic Benchmarks
                    </h3>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Source: Federal Reserve Economic Data (FRED) • High-Fidelity Views</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {macroData.map((item, i) => (
                    <FredChart key={i} title={item.title} url={item.url} />
                ))}
            </div>
        </div>
    );
};

// --- Contact Components ---

const ContactIntelligence = () => {
  return (
    <div className="w-full pt-16 mt-16 border-t border-gray-800/50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                <MessageSquare size={12} /> Contact Us
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">Direct Intelligence <span className="text-blue-500 text-nowrap">Lines</span></h3>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Have questions about our swing trading methodology or terminal features? Our research team is available for direct inquiries.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              <a
                href="mailto:contact@sigmatrader.net"
                className="flex items-center justify-between gap-6 px-8 py-5 bg-gray-900 border border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/50 rounded-2xl transition-all group/mail">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover/mail:scale-110 transition-transform">
                    <Mail size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Email Enquiries</p>
                    <p className="text-sm font-bold text-white">contact@sigmatrader.net</p>
                  </div>
                </div>
                <ArrowUpRight size={18} className="text-gray-600 group-hover/mail:text-blue-500 transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- TradingView Widget Components ---

const TickerTape = () => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        { "proName": "FOREXCOM:SPX500", "title": "S&P 500" },
        { "proName": "FOREXCOM:NSXUSD", "title": "Nasdaq 100" },
        { "proName": "COINBASE:BTCUSD", "title": "Bitcoin" },
        { "proName": "TVC:GOLD", "title": "Gold" },
        { "proName": "TVC:USOIL", "title": "OIL" }
      ],
      "showSymbolLogo": true,
      "colorTheme": "dark",
      "isTransparent": true,
      "displayMode": "adaptive",
      "locale": "en"
    });
    container.current.appendChild(script);
  }, []);
  return <div ref={container} className="w-full border-b border-gray-800 bg-black/50 backdrop-blur-md min-h-[46px]"></div>;
};

const TechnicalAnalysis = ({ symbol }) => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "interval": "1D", "width": "100%", "isTransparent": true, "height": "100%", "symbol": symbol,
      "showIntervalTabs": true, "displayMode": "single", "locale": "en", "colorTheme": "dark"
    });
    container.current.appendChild(script);
  }, [symbol]);
  return <div className="h-[400px] w-full bg-gray-900/40 rounded-3xl p-4 border border-gray-800 shadow-xl overflow-hidden"><div ref={container} className="h-full w-full" /></div>;
};

const AdvancedChart = ({ symbol }) => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true, "symbol": symbol, "interval": "W", "theme": "dark", "style": "1", "locale": "en",
      "enable_publishing": false, "allow_symbol_change": true, "calendar": true, "details": true, "hotlist": true
    });
    container.current.appendChild(script);
  }, [symbol]);
  return <div className="h-[650px] w-full bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl relative"><div ref={container} className="h-full w-full" /></div>;
};

const FundamentalData = ({ symbol }) => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-financials.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "isTransparent": true, "largeChartHeight": 350, "displayMode": "regular", "width": "100%", "height": "100%",
      "colorTheme": "dark", "symbol": symbol, "locale": "en"
    });
    container.current.appendChild(script);
  }, [symbol]);
  return <div className="h-[500px] w-full bg-gray-900/50 rounded-3xl p-4 border border-gray-800 shadow-2xl overflow-hidden"><div ref={container} className="h-full w-full" /></div>;
};

const CompanyProfile = ({ symbol }) => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-profile.js';
    script.async = true;
    script.innerHTML = JSON.stringify({ "symbol": symbol, "width": "100%", "height": "100%", "colorTheme": "dark", "isTransparent": true, "locale": "en" });
    container.current.appendChild(script);
  }, [symbol]);
  return <div className="h-[400px] w-full bg-gray-900 rounded-3xl p-4 border border-gray-800 shadow-2xl overflow-hidden"><div ref={container} className="h-full w-full" /></div>;
};

// --- Screener Components ---

const ScreenerHub = () => {
  const screeners = [
    {
      title: "Institutional Insider Buys",
      description: "Real-time tracking of transaction values over $100k where C-suite executives are increasing their personal stakes.",
      url: "https://finviz.com/insidertrading?or=-10&tv=100000&tc=1&o=-transactionValue",
      icon: <Users className="text-emerald-500" />,
      tags: ["Insider", "High Conviction", "Finviz"]
    },
    {
      title: "52-Week Low Large Caps",
      description: "High quality large-cap stocks with positive earnings growth trading near annual lows. Potential value rotation candidates.",
      url: "https://finviz.com/screener.ashx?v=111&f=cap_largeover%2Cfa_div_pos%2Cfa_epsyoy_pos%2Cfa_epsyoy1_pos%2Cta_highlow52w_a0to10h%2Ctargetprice_above&ft=4&o=-marketcap&ar=180&preset=s44313929",
      icon: <Filter className="text-blue-500" />,
      tags: ["Large Cap", "Value", "52W Low"]
    },
    {
      title: "Insider Trading Activity",
      description: "Follow the 'Smart Money' with Barchart's real-time tracker of corporate officers and directors buying their own stock.",
      url: "https://www.barchart.com/investing-ideas/insider-trading-activity",
      icon: <Eye className="text-red-500" />,
      tags: ["High Signal", "Filings", "Barchart"]
    },
    {
      title: "Current Market Valuation",
      description: "Track the Buffet Indicator, P/E ratios, and yield curves to determine overall stock market risk vs historical averages.",
      url: "https://www.currentmarketvaluation.com/",
      icon: <LineChart className="text-amber-500" />,
      tags: ["Macro", "Valuation", "Risk"]
    },
     {
       title: "Global Economic Calendar",
       description: "Comprehensive multi-country calendar filtered for medium and high importance volatility events.",
       url: "https://sslecal2.investing.com/?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=2,3&features=datepicker,timezone&countries=5&calType=week&timeZone=55&lang=1",
       icon: <CalendarIcon className="text-purple-500" />,
       tags: ["Volatility", "Global", "Investing.com"]
     },
    {
      title: "CME FedWatch Tool",
      description: "Analyze the probabilities of FOMC rate moves based on Fed Funds futures pricing. Critical for macro positioning.",
      url: "https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html",
      icon: <Scale className="text-cyan-400" />,
      tags: ["Macro", "Interest Rates", "FOMC"]
    }
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 py-6">
      <div className="border-b border-gray-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase">Institutional <span className="text-blue-500">Signals</span></h2>
          <p className="text-gray-500 text-sm mt-2 font-medium">Quant-driven filters and professional-grade data pipelines.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screeners.map((screener, idx) => (
          <div key={idx} className="group bg-gray-900/30 border border-gray-800 p-8 rounded-[2.5rem] hover:border-blue-500/50 transition-all flex flex-col justify-between h-full shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
               {React.cloneElement(screener.icon, { size: 100 })}
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="p-4 bg-gray-800/50 rounded-2xl group-hover:bg-blue-500/10 transition-colors">
                  {screener.icon}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  {screener.tags.map(tag => (
                    <span key={tag} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/5 text-gray-400 rounded-lg">{tag}</span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-3 group-hover:text-blue-400 transition-colors">{screener.title}</h3>
                <p className="text-gray-400 text-[11px] leading-relaxed font-medium">
                  {screener.description}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-800/50 relative z-10">
              <a
                href={screener.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 transition-all"
              >
                Launch Intelligence Feed <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Home Components ---

const EconomicCalendar = () => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark", "isTransparent": true, "width": "100%", "height": "100%", "locale": "en",
      "importanceFilter": "0,1", "currencyFilter": "USD"
    });
    container.current.appendChild(script);
  }, []);
  return <div className="h-[450px] w-full bg-gray-900/50 rounded-3xl p-4 border border-gray-800 shadow-2xl overflow-hidden"><div ref={container} className="h-full w-full" /></div>;
};

const MarketOverviewWidget = () => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark", "dateRange": "12M", "showChart": true, "locale": "en", "isTransparent": true, "showSymbolLogo": true, "width": "100%", "height": "100%",
      "tabs": [
        {
          "title": "Indices",
          "symbols": [
            { "s": "FOREXCOM:SPX500", "d": "S&P 500" },
            { "s": "FOREXCOM:NSXUSD", "d": "Nasdaq 100" },
            { "s": "FOREXCOM:DJI", "d": "Dow 30" }
          ]
        },
        {
          "title": "Commodities & Crypto",
          "symbols": [
            { "s": "COINBASE:BTCUSD", "d": "Bitcoin" },
            { "s": "TVC:GOLD", "d": "Gold" },
            { "s": "TVC:USOIL", "d": "Oil (WTI)" }
          ]
        }
      ]
    });
    container.current.appendChild(script);
  }, []);
  return <div className="h-[450px] w-full bg-gray-900/50 rounded-3xl p-4 border border-gray-800 shadow-2xl overflow-hidden"><div ref={container} className="h-full w-full" /></div>;
};

const MarketHeatmap = () => {
  const container = useRef();
  useEffect(() => {
    if (!container.current) return;
    container.current.innerHTML = "";
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "exchanges": [], "dataSource": "S&P500", "grouping": "sector", "blockSize": "market_cap_basic", "blockColor": "change", "locale": "en", "colorTheme": "dark", "hasTopBar": false, "isTransparent": true, "width": "100%", "height": "100%"
    });
    container.current.appendChild(script);
  }, []);
  return <div className="h-[600px] w-full bg-gray-900/50 rounded-3xl p-4 border border-gray-800 shadow-2xl overflow-hidden"><div ref={container} className="h-full w-full" /></div>;
};

const EarningsHubWidget = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div className="h-[700px] w-full bg-[#0d1117] rounded-3xl border border-gray-800 shadow-2xl overflow-hidden relative group">
      {loading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 text-[10px] font-black uppercase text-gray-500 tracking-widest animate-pulse"><Loader2 className="mb-2 animate-spin text-blue-500" size={24}/>Syndicating Feed...</div>}
      <iframe src="https://earningshub.com/embed/calendar?theme=dark&calendarView=week&filter=popular" className="w-full h-full border-none" onLoad={() => setLoading(false)} title="EarningsHub" />
    </div>
  );
};

// --- Portfolio Hub ---

const SavvyTraderPortfolio = () => {
  const [showQR, setShowQR] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const portfolioUrl = "https://savvytrader.com/vmustafayev/sigmatrader?tab=summary";
  const qrImageUrl = "/SigmaTrader-Swing-qr-code.png";
  const [copied, setCopied] = useState(false);

  const stats = [
    { label: 'Total Return', value: 'Verified', icon: <TrendingUp size={16} />, color: 'text-emerald-400' },
    { label: 'Primary Strategy', value: 'Swing Trading', icon: <Zap size={16} />, color: 'text-amber-400' },
    { label: 'Asset Classes', value: 'Equity / ETF', icon: <PieChart size={16} />, color: 'text-blue-400' },
    { label: 'Status', value: 'Active', icon: <ShieldCheck size={16} />, color: 'text-emerald-500' }
  ];

  const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(portfolioUrl);
        setCopied(true);

        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Copy failed", err);
      }
  };

  return (
    <>
        <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500 w-full py-10 relative">

          {showQR && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6" onClick={() => setShowQR(false)}>
              <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-[3rem] text-center space-y-6 max-w-sm w-full animate-in zoom-in duration-300 shadow-2xl shadow-blue-500/10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-gray-400 tracking-[0.2em]">OFFICIAL SAVVYTRADER QR</span>
                   </div>
                   <button onClick={() => setShowQR(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white"><X size={18} /></button>
                </div>

                <div className="relative bg-white p-3 rounded-3xl overflow-hidden aspect-square flex items-center justify-center">
                  {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Loader2 className="animate-spin text-blue-600" size={32} />
                    </div>
                  )}
                  <img
                    src={qrImageUrl}
                    alt="SigmaTrader QR Code"
                    className={`w-full h-full object-contain transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setImgLoaded(true)}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white tracking-tight">SigmaTrader Swing</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">Scan with your mobile camera to launch the verified portfolio terminal instantly.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setShowQR(false)}
                    className="py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all border border-white/5"
                  >
                    Close
                  </button>
                  <a
                    href={qrImageUrl}
                    download
                    target="_blank"
                    className="py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Download size={14} /> Save
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
              <Award size={12} /> Verified Track Record
            </div>
            <h2 className="text-5xl font-black text-white tracking-tight text-center">SigmaTrader <span className="text-blue-500 text-nowrap">Strategy Portfolio</span></h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl text-center space-y-2 hover:border-gray-700 transition-all">
                <div className={`mx-auto w-10 h-10 rounded-2xl bg-gray-800 flex items-center justify-center ${s.color}`}>
                  {s.icon}
                </div>
                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{s.label}</div>
                <div className="text-lg font-bold text-white">{s.value}</div>
              </div>
            ))}
          </div>

          <div className="relative group bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-1 shadow-2xl shadow-blue-500/20">
            <div className="bg-gray-950 rounded-[2.3rem] p-10 flex flex-col items-center text-center gap-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                 <BarChart size={200} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Full Trade Transparency</h3>
                <p className="text-gray-500 text-sm">SavvyTrader prohibits direct embedding for security. Launch the portal below to view all current Swing positions and trade history.</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center z-10">
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      Scan to Open Portfolio
                    </p>

                    <img
                      src={qrImageUrl}
                      alt="SigmaTrader QR Code"
                      onClick={() => setShowQR(true)}
                      className="w-36 h-36 p-2 bg-white rounded-2xl cursor-pointer hover:scale-105 transition-all shadow-lg" />

                    <div className="flex flex-col items-center gap-2 mt-2">
                      <a
                        href={portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 font-bold break-all text-center" >
                        Open Portfolio ↗
                      </a>

                      <button
                          onClick={handleCopy}
                          className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition">
                          Copy Link
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>

        {copied && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl shadow-lg text-xs font-bold text-white flex items-center gap-2">
              <span>Copied</span>
              <span className="text-emerald-400">✅</span>
            </div>
          </div>
        )}
    </>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState('HOME');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSymbol, setCurrentSymbol] = useState('NASDAQ:AAPL');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
      ReactGA.initialize("G-B92TM15HNG");
  }, []);

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: window.location.pathname,
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;
    setCurrentSymbol(query);
    setView('TERMINAL');
    setSearchQuery('');
  };

  const ticker = currentSymbol.includes(':') ? currentSymbol.split(':')[1] : currentSymbol;

  const externalLinks = [
    { name: 'Finviz', url: `https://finviz.com/quote.ashx?t=${ticker}`, color: 'bg-blue-500/10 text-blue-400' },
    { name: 'SavvyTrader', url: `https://savvytrader.com/q/${ticker}`, color: 'bg-indigo-500/10 text-indigo-400' },
    { name: 'ValueInvesting', url: `https://valueinvesting.io/${ticker}/valuation/intrinsic-value`, color: 'bg-emerald-500/10 text-emerald-400' },
    { name: 'Dataroma', url: `https://www.dataroma.com/m/stock.php?sym=${ticker}`, color: 'bg-amber-500/10 text-amber-400' },
    { name: 'SEC Filings', url: `https://www.sec.gov/edgar/search/#/category=custom&entityName=${ticker}&forms=10-K%252C10-Q%252C13F-HR`, color: 'bg-red-500/10 text-red-400' }
  ];

  const navigate = (newView) => {
    setView(newView);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 font-sans flex flex-col">
      <TickerTape />

      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-[#050505]/95 backdrop-blur-xl">
        <div className={`${CONTAINER} px-6 h-16 flex items-center justify-between`}>
          <button onClick={() => setView('HOME')} className="flex items-center gap-3 group shrink-0">
               <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:rotate-12 transition-transform">
                  <Activity className="text-white" size={24} />
               </div>
               <div className="hidden md:block text-left">
                  <p className="text-lg font-black text-white leading-tight tracking-tighter">SIGMA<span className="text-blue-500">TRADER</span></p>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Quantitative Research</p>
               </div>
          </button>

          <form onSubmit={handleSearch} className="relative group flex-1 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-900/50 border border-gray-800 rounded-2xl py-2 pl-10 pr-4 text-xs md:text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all placeholder:text-gray-600 font-medium"
            />
          </form>

          <div className="hidden lg:flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar whitespace-nowrap">
             <button onClick={() => setView('HOME')} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${view === 'HOME' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>
                <Home size={14} /> Dashboard
             </button>
             <button onClick={() => setView('SCREENER')} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${view === 'SCREENER' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>
                <Filter size={14} /> Signals
             </button>
             <button onClick={() => setView('TERMINAL')} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${view === 'TERMINAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>
                <Monitor size={14} /> Terminal
             </button>
             <button onClick={() => setView('PORTFOLIO')} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${view === 'PORTFOLIO' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>
                <Briefcase size={14} /> Portfolio
             </button>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl animate-in fade-in duration-200">
           <div className="flex flex-col h-full">
              <div className="h-16 px-6 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">Σ</div>
                  <span className="text-lg font-black tracking-tight text-white uppercase">Sigma Menu</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 <button onClick={() => navigate('HOME')} className={`w-full flex items-center justify-between p-6 rounded-3xl border ${view === 'HOME' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900/50 border-gray-800 text-gray-300'}`}>
                    <div className="flex items-center gap-4">
                       <Home size={24} />
                       <span className="font-black uppercase tracking-widest text-sm">Dashboard</span>
                    </div>
                    <ChevronRight size={18} />
                 </button>
                 <button onClick={() => navigate('SCREENER')} className={`w-full flex items-center justify-between p-6 rounded-3xl border ${view === 'SCREENER' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900/50 border-gray-800 text-gray-300'}`}>
                    <div className="flex items-center gap-4">
                       <Monitor size={24} />
                       <span className="font-black uppercase tracking-widest text-sm">Signals</span>
                    </div>
                    <ChevronRight size={18} />
                 </button>
                 <button onClick={() => navigate('TERMINAL')} className={`w-full flex items-center justify-between p-6 rounded-3xl border ${view === 'TERMINAL' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900/50 border-gray-800 text-gray-300'}`}>
                    <div className="flex items-center gap-4">
                       <Monitor size={24} />
                       <span className="font-black uppercase tracking-widest text-sm">Stock Terminal</span>
                    </div>
                    <ChevronRight size={18} />
                 </button>
                 <button onClick={() => navigate('PORTFOLIO')} className={`w-full flex items-center justify-between p-6 rounded-3xl border ${view === 'PORTFOLIO' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-900/50 border-gray-800 text-gray-300'}`}>
                    <div className="flex items-center gap-4">
                       <Monitor size={24} />
                       <span className="font-black uppercase tracking-widest text-sm">Portfolio</span>
                    </div>
                    <ChevronRight size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-900/10 to-black">
        <div className={`${CONTAINER} px-6 py-8`}>
          {view === 'HOME' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <MarketStatusBanner />

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={14} className="text-blue-500" /> Market Benchmarks</h3>
                    <MarketOverviewWidget />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" /> US Economic Events
                        <a
                            href="https://sslecal2.investing.com/?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=2,3&features=datepicker,timezone&countries=5&calType=week&timeZone=55&lang=1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 hover:text-blue-400 transition-all"
                          >
                            View <ExternalLink size={14} />
                        </a>
                    </h3>
                    <EconomicCalendar />
                  </div>

               </div>

               <div className="space-y-4">
                  <MarketHeatmap />
               </div>

               <div className="space-y-4">
                  <EarningsHubWidget />
               </div>

               <MacroSection />

               {/* New Contact Section */}
               <ContactIntelligence />
            </div>
          )}

          {view === 'SCREENER' && <ScreenerHub />}

          {view === 'PORTFOLIO' && <SavvyTraderPortfolio />}

          {view === 'TERMINAL' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                    {ticker}
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  {externalLinks.map(link => (
                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2 text-[10px] md:text-[11px] font-black transition-all hover:bg-white/5 ${link.color}`}>
                      {link.name} <ExternalLink size={12} />
                    </a>
                  ))}
                </div>
              </div>

              <AdvancedChart symbol={currentSymbol} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <TechnicalAnalysis symbol={currentSymbol} />
                <div className="lg:col-span-2">
                  <CompanyProfile symbol={currentSymbol} />
                </div>
              </div>

              <FundamentalData symbol={currentSymbol} />
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-gray-950 pt-16 pb-8 px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">Σ</div>
                <span className="text-xl font-black tracking-tight text-white">SigmaTrader<span className="text-blue-500">.Net</span></span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed max-w-xs">
                Quantitative trading terminal and macro intelligence for institutional-grade market analysis.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connect</p>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:contact@sigmatrader.net" className="text-sm text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-2 group">
                    <Mail size={14} className="group-hover:translate-x-1 transition-transform"/> contact@sigmatrader.net
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compliance</p>
              <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
                Information provided is for educational purposes only. Investing involves risk. SigmaTrader is not a registered investment advisor.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900 text-center">
            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.4em]">
              &copy; {new Date().getFullYear()} SIGMATRADER &bull; V1.0.0
            </p>
          </div>
      </footer>
    </div>
  );
}