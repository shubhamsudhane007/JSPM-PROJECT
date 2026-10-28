import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TransactionCategory, TransactionType } from '../types';

interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export const VoiceEntryModal: React.FC = () => {
  const { voiceModalOpen, setVoiceModalOpen, addTransaction, language, t } = useApp();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    type: TransactionType;
    amount: number;
    category: TransactionCategory;
    note: string;
  } | null>(null);
  const [micSupported, setMicSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!voiceModalOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      setParsedResult(null);
      setTranscript('');
      setErrorMsg(null);
      return;
    }

    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRec) {
      setMicSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg(t.voice.micBlocked);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Error initializing speech recognition:', e);
      setMicSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [voiceModalOpen, language, t.voice.micBlocked]);

  if (!voiceModalOpen) return null;

  const startListening = () => {
    setParsedResult(null);
    setErrorMsg(null);
    setTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
      }
    }
  };

  const stopListeningAndProcess = async (textToProcess?: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);

    const query = textToProcess || transcript;
    if (!query.trim()) {
      setErrorMsg('Please speak or type a transaction first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/voice-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: query, language }),
      });
      const data = await res.json();
      if (data.success) {
        setParsedResult({
          type: data.type === 'expense' ? 'expense' : 'income',
          amount: Number(data.amount) || 100,
          category: (data.category as TransactionCategory) || (data.type === 'expense' ? 'stock purchase' : 'sales'),
          note: data.note || query,
        });
      } else {
        throw new Error('Could not parse transaction');
      }
    } catch (e) {
      console.warn('Failed parsing via backend, using smart fallback', e);
      // Fallback
      const isExpense = query.toLowerCase().includes('spent') || query.toLowerCase().includes('kharcha') || query.toLowerCase().includes('bill');
      const nums = query.match(/\d+/);
      const amount = nums ? parseInt(nums[0], 10) : 200;
      setParsedResult({
        type: isExpense ? 'expense' : 'income',
        amount,
        category: isExpense ? 'stock purchase' : 'sales',
        note: query,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedResult) return;
    const now = new Date();
    addTransaction({
      type: parsedResult.type,
      amount: parsedResult.amount,
      category: parsedResult.category,
      note: parsedResult.note,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().substring(0, 5),
    });
    setVoiceModalOpen(false);
  };

  const sampleChips = [
    language === 'hi'
      ? 'चावल 200 रुपये नकद बिका'
      : language === 'mr'
      ? 'तांदूळ २०० रुपये रोख विकले'
      : 'sold 200 rupees of rice',
    language === 'hi'
      ? '500 रुपये दुकान का बिजली बिल भरा'
      : language === 'mr'
      ? '५०० रुपये दुकानाचे लाईट बिल भरले'
      : 'spent 500 on electricity bill',
    language === 'hi'
      ? 'रमेश ने उधार जमा किया 350'
      : language === 'mr'
      ? 'रमेशने उधारी ३५० जमा केली'
      : 'received 350 from Ramesh customer',
    language === 'hi'
      ? 'दूध और ब्रेड खरीदा 420'
      : language === 'mr'
      ? 'दूध आणि ब्रेड खरेदी ४२०'
      : 'spent 420 on dairy stock',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {t.voice.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AI powered speech-to-khata copilot
              </p>
            </div>
          </div>
          <button
            onClick={() => setVoiceModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content State 1: Speech / Mic Screen */}
        {!parsedResult && (
          <div className="py-6 text-center">
            {/* Mic Pulse Button */}
            <div className="relative inline-block my-4">
              {isListening && (
                <>
                  <span className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
                  <span className="absolute -inset-8 rounded-full bg-emerald-500/10 animate-pulse" />
                </>
              )}
              <button
                onClick={isListening ? () => stopListeningAndProcess() : startListening}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-600 to-red-500 animate-bounce'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-emerald-500/30'
                }`}
              >
                {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              </button>
            </div>

            <p className="text-sm font-bold text-slate-900 dark:text-white mt-2">
              {isListening ? t.voice.listening : 'Tap the microphone & speak your transaction'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              {t.voice.examples}
            </p>

            {/* Live Transcript Box */}
            <div className="mt-5 text-left">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                {isListening ? 'Live Speech Captured:' : 'Or type / edit text:'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="e.g. Rice 200 rs sold"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-emerald-500"
                />
                <button
                  onClick={() => stopListeningAndProcess()}
                  disabled={!transcript.trim() || isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Parse</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Click Samples */}
            <div className="mt-5 text-left">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Test Prompts:
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sampleChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTranscript(chip);
                      stopListeningAndProcess(chip);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 text-xs font-medium border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                  >
                    “{chip}”
                  </button>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Content State 2: Confirmation Card Before Saving */}
        {parsedResult && (
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.voice.confirmTitle}</span>
            </div>

            <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setParsedResult({ ...parsedResult, type: 'income' })
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                      parsedResult.type === 'income'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    + Income (Jama)
                  </button>
                  <button
                    onClick={() =>
                      setParsedResult({ ...parsedResult, type: 'expense' })
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition ${
                      parsedResult.type === 'expense'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    - Expense (Kharcha)
                  </button>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Amount:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-slate-800 dark:text-white">₹</span>
                    <input
                      type="number"
                      value={parsedResult.amount}
                      onChange={(e) =>
                        setParsedResult({ ...parsedResult, amount: Number(e.target.value) || 0 })
                      }
                      className="w-24 px-2 py-0.5 rounded-lg border border-slate-300 dark:border-slate-700 text-lg font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Category:
                </label>
                <select
                  value={parsedResult.category}
                  onChange={(e) =>
                    setParsedResult({
                      ...parsedResult,
                      category: e.target.value as TransactionCategory,
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-emerald-500"
                >
                  <option value="sales">Customer Sales</option>
                  <option value="stock purchase">Stock Purchase</option>
                  <option value="rent">Shop Rent</option>
                  <option value="electricity">Electricity Bill</option>
                  <option value="salary">Worker Salary</option>
                  <option value="transport">Transport / Tempo</option>
                  <option value="other">Chai / Other Expense</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">
                  Description / Note:
                </label>
                <input
                  type="text"
                  value={parsedResult.note}
                  onChange={(e) =>
                    setParsedResult({ ...parsedResult, note: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setParsedResult(null)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                {t.voice.cancel}
              </button>
              <button
                onClick={handleConfirmSave}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer"
              >
                {t.voice.saveToLedger}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
