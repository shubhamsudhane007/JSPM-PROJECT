import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  RotateCw,
  MessageCircle,
  Instagram,
  Twitter,
  Image as ImageIcon,
  Tag,
  Palette,
  Store,
  Flame,
  CheckCircle2,
  History,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GeneratedAd } from '../../types';

export const AdMakerTab: React.FC = () => {
  const { stock, settings, adsHistory, saveGeneratedAd, language, t } = useApp();

  const [selectedItems, setSelectedItems] = useState<string[]>([
    'Aashirvaad Shuddh Chakki Atta (10kg)',
    'Daawat Rozana Basmati Rice',
    'Fortune Sunlite Refined Sunflower Oil (1L)',
  ]);
  const [customItemInput, setCustomItemInput] = useState('');
  const [occasion, setOccasion] = useState('Diwali Dhamaka Sale');
  const [tone, setTone] = useState<'festive' | 'discount' | 'weekend' | 'newArrival'>('festive');
  const [customNotes, setCustomNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active or Current Ad Display
  const [currentAd, setCurrentAd] = useState<GeneratedAd | null>(
    () => adsHistory[0] || null
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleToggleStockItem = (itemName: string) => {
    if (selectedItems.includes(itemName)) {
      setSelectedItems(selectedItems.filter((i) => i !== itemName));
    } else {
      setSelectedItems([...selectedItems, itemName]);
    }
  };

  const handleAddCustomItem = () => {
    if (customItemInput.trim()) {
      setSelectedItems([...selectedItems, customItemInput.trim()]);
      setCustomItemInput('');
    }
  };

  const handleGenerateAd = async () => {
    if (selectedItems.length === 0) {
      setErrorMsg('Please select at least one item from stock or add a custom item.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    const occasionMap = {
      festive: occasion || 'Festive Offer',
      discount: 'Mega Clearance & Discount',
      weekend: 'Weekend Special Offer',
      newArrival: 'Fresh Stock & New Arrivals',
    };

    const finalOccasion = occasionMap[tone] || occasion;

    try {
      const response = await fetch('/api/ai/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: settings.shopName,
          items: selectedItems,
          occasion: finalOccasion,
          tone,
          language,
          customNotes,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Ad generation failed');
      }

      const newAd: GeneratedAd = {
        id: `ad-${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[0],
        shopName: settings.shopName,
        occasion: finalOccasion,
        tone,
        items: selectedItems,
        posterHeadline: data.posterHeadline,
        posterTagline: data.posterTagline,
        offerHighlight: data.offerHighlight,
        whatsappMessage: data.whatsappMessage,
        instagramCaption: data.instagramCaption,
        twitterPost: data.twitterPost,
        accentColor: data.accentColor || (tone === 'festive' ? '#ea580c' : '#16a34a'),
        language,
      };

      setCurrentAd(newAd);
      saveGeneratedAd(newAd);
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Error in generating ad:', error);
      setErrorMsg('Could not reach AI model. Displaying smart offline copy.');
    } finally {
      setIsGenerating(false);
    }
  };

  const shareOnWhatsApp = (text: string) => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-5 h-5 fill-amber-500" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.adMaker.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.adMaker.subtitle}
          </p>
        </div>

        <button
          onClick={handleGenerateAd}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition active:scale-95 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? t.adMaker.generating : t.adMaker.generateBtn}</span>
        </button>
      </div>

      {/* Campaign Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Controls (Occasion, Tone, Stock Items) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tone Selector */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              {t.adMaker.tone}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'festive', label: t.adMaker.festive, color: 'text-amber-600' },
                  { id: 'discount', label: t.adMaker.discount, color: 'text-rose-600' },
                  { id: 'weekend', label: t.adMaker.weekend, color: 'text-emerald-600' },
                  { id: 'newArrival', label: t.adMaker.newArrival, color: 'text-blue-600' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTone(item.id)}
                  className={`p-3 rounded-2xl text-left text-xs font-extrabold border transition cursor-pointer ${
                    tone === item.id
                      ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 text-slate-900 dark:text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 block mb-1">
                {t.adMaker.occasion}
              </label>
              <input
                type="text"
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                placeholder="e.g. Diwali Dhamaka, Makar Sankranti Special"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
              />
            </div>
          </div>

          {/* Select Stock Items */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                {t.adMaker.selectItems}
              </label>
              <span className="text-[11px] font-bold text-emerald-600">
                {selectedItems.length} selected
              </span>
            </div>

            {/* Quick stock item chips */}
            <div className="max-h-48 overflow-y-auto pr-1 flex flex-wrap gap-1.5">
              {stock.map((item) => {
                const isSelected = selectedItems.includes(item.name);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleToggleStockItem(item.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Custom Item Adder */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={customItemInput}
                onChange={(e) => setCustomItemInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomItem()}
                placeholder={t.adMaker.customItemsPlaceholder}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
              />
              <button
                onClick={handleAddCustomItem}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* History of Recent Ads */}
          {adsHistory.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {t.adMaker.recentAds}
                </h4>
              </div>
              <div className="space-y-2">
                {adsHistory.map((ad) => (
                  <button
                    key={ad.id}
                    onClick={() => setCurrentAd(ad)}
                    className={`w-full p-2.5 rounded-2xl text-left border text-xs transition cursor-pointer flex items-center justify-between ${
                      currentAd?.id === ad.id
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-slate-900 dark:text-white'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">
                      <span className="font-bold block truncate">{ad.posterHeadline}</span>
                      <span className="text-[10px] text-slate-400">{ad.occasion}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-2">
                      {ad.timestamp}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Poster Preview & Multichannel Copy Cards */}
        <div className="lg:col-span-7 space-y-5">
          {isGenerating ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
                <Sparkles className="w-6 h-6 text-amber-500 absolute inset-0 m-auto" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {t.adMaker.generating}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Gemini is composing tailored WhatsApp broadcast copy, Instagram hashtags, and designing your storefront banner!
              </p>
            </div>
          ) : currentAd ? (
            <>
              {/* FEATURED POSTER PREVIEW CARD */}
              <div
                style={{
                  background: `linear-gradient(135deg, ${currentAd.accentColor || '#ea580c'}, #b45309)`,
                }}
                className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-orange-950/20"
              >
                {/* Decorative Pattern Background */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-black" />

                {/* Poster Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/20 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                      <Store className="w-5 h-5 text-amber-200" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm sm:text-base tracking-wide uppercase drop-shadow-sm">
                        {currentAd.shopName}
                      </h4>
                      <span className="text-[11px] text-amber-100 font-medium">
                        {settings.tagline} • {settings.phone}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                    {currentAd.offerHighlight}
                  </span>
                </div>

                {/* Poster Headline & Tagline */}
                <div className="relative z-10 my-6 text-center sm:text-left space-y-2">
                  <span className="text-xs font-extrabold tracking-widest uppercase text-amber-200">
                    ★ {currentAd.occasion} ★
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-md">
                    {currentAd.posterHeadline}
                  </h3>
                  <p className="text-sm sm:text-base font-medium text-amber-100/90 max-w-xl">
                    {currentAd.posterTagline}
                  </p>
                </div>

                {/* Featured Items Pills */}
                <div className="relative z-10 flex flex-wrap gap-2 pt-2 border-t border-white/20">
                  {currentAd.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/25"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* 1. WhatsApp Promotional Copy Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <MessageCircle className="w-4 h-4 fill-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {t.adMaker.whatsappCopy}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Ready to broadcast to customer groups
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy('wa', currentAd.whatsappMessage)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedKey === 'wa' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">{t.adMaker.copied}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.adMaker.copyText}</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => shareOnWhatsApp(currentAd.whatsappMessage)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{t.adMaker.shareWhatsApp}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 whitespace-pre-line text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed">
                  {currentAd.whatsappMessage}
                </div>
              </div>

              {/* 2. Instagram Caption Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      <Instagram className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {t.adMaker.instagramCopy}
                      </h4>
                      <p className="text-[11px] text-slate-400">Caption with viral local tags</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy('ig', currentAd.instagramCaption)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedKey === 'ig' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t.adMaker.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.adMaker.copyText}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 whitespace-pre-line text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {currentAd.instagramCaption}
                </div>
              </div>

              {/* 3. Twitter / X Announcement Card */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      <Twitter className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {t.adMaker.twitterCopy}
                      </h4>
                      <p className="text-[11px] text-slate-400">Short & punchy</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy('tw', currentAd.twitterPost)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedKey === 'tw' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{t.adMaker.copied}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.adMaker.copyText}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {currentAd.twitterPost}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                No Ad Generated Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Pick items from your shop and click &quot;Generate Smart Ads with Gemini&quot; to create high-converting promotional banners and copy!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
