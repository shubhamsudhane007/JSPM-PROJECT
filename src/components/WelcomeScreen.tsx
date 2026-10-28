import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Store, Clock, Calendar, Sun, Zap, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { motivationalQuotes } from '../translations';
import { Language } from '../types';

export const WelcomeScreen: React.FC = () => {
  const { settings, setShowWelcome, language, setLanguage, t } = useApp();
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      // Format time with AM/PM
      setTime(
        now.toLocaleTimeString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );

      // Format date e.g. Wednesday, 28 October 2026
      setDateStr(
        now.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  // Pick quote by day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24
  );
  const quoteIndex = dayOfYear % motivationalQuotes.length;
  const currentQuote = motivationalQuotes[quoteIndex][language] || motivationalQuotes[quoteIndex].en;

  const handleEnter = () => {
    setShowWelcome(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto bg-gradient-to-br from-emerald-600 via-teal-700 to-amber-700 text-white p-6 sm:p-10 select-none"
    >
      {/* Background Decorative Ambient Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-400 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-orange-400 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-yellow-300 blur-3xl" />
      </div>

      {/* Top Header Bar on Welcome */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <Store className="w-5 h-5 text-amber-300" />
          <span className="text-sm font-bold tracking-wide">{settings.shopName}</span>
        </div>

        {/* Quick Language Pill */}
        <div className="flex items-center gap-1 bg-black/25 backdrop-blur-md p-1 rounded-full border border-white/20">
          <Globe className="w-3.5 h-3.5 text-white/70 ml-2 mr-1" />
          {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-full transition-all ${
                language === lang
                  ? 'bg-amber-400 text-slate-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
            </button>
          ))}
        </div>
      </div>

      {/* Center Hero Content */}
      <div className="relative z-10 my-auto py-8 max-w-xl mx-auto w-full text-center">
        {/* Animated Icon Badge */}
        <motion.div
          initial={{ scale: 0.8, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-3xl shadow-2xl shadow-orange-500/40 mb-6 border-2 border-white/30"
        >
          <Zap className="w-10 h-10 text-white fill-white" />
        </motion.div>

        {/* Big Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight drop-shadow-md"
        >
          {t.welcome} {settings.ownerName}! 👋
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg sm:text-xl font-medium text-emerald-100 mt-2 flex items-center justify-center gap-2"
        >
          <span>{t.welcomeSub}</span>
        </motion.p>

        {/* Live Date and Time Badge Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white/15 backdrop-blur-lg border border-white/25 rounded-2xl p-4 sm:p-5 shadow-xl text-left flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/40 rounded-xl border border-white/20">
              <Calendar className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">
                {language === 'hi' ? 'आज का दिन' : language === 'mr' ? 'आजचा वार व दिनांक' : "Today's Date"}
              </div>
              <div className="text-base sm:text-lg font-bold text-white capitalize">{dateStr}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-white/20 pt-3 sm:pt-0 sm:pl-5 w-full sm:w-auto">
            <div className="p-3 bg-amber-500/30 rounded-xl border border-white/20">
              <Clock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="text-xs text-white/70 font-semibold uppercase tracking-wider">{t.liveClock}</div>
              <div className="text-base sm:text-lg font-mono font-bold tracking-wider text-amber-200">
                {time}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Motivational Line */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 rounded-2xl bg-black/20 border border-white/15 backdrop-blur-sm"
        >
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-widest mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            <span>
              {language === 'hi' ? 'आज का सुविचार' : language === 'mr' ? 'आजचा प्रेरणादायी विचार' : 'Thought for Today'}
            </span>
          </div>
          <p className="text-sm sm:text-base italic font-medium text-white/95 leading-relaxed">
            {currentQuote}
          </p>
        </motion.div>
      </div>

      {/* Bottom Action Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 max-w-xl mx-auto w-full pt-4 pb-2"
      >
        <button
          onClick={handleEnter}
          className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 hover:from-amber-300 hover:to-orange-300 text-slate-900 font-extrabold text-lg sm:text-xl py-4 sm:py-5 px-8 rounded-2xl shadow-2xl shadow-orange-950/40 transform active:scale-98 transition-all duration-200 cursor-pointer"
        >
          <span>{t.enterApp}</span>
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />
        </button>

        <p className="text-center text-xs text-white/70 mt-3 font-medium">
          {settings.shopName} • {settings.tagline}
        </p>
      </motion.div>
    </motion.div>
  );
};
