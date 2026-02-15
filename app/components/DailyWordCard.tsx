'use client';

import { BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { TODAY_WORD } from '../constants';
import { getDailyInsight } from '../services/geminiService';

const DailyWordCard = () => {
  const [expanded, setExpanded] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetInsight = async () => {
    if (insight) return;
    setLoading(true);
    const result = await getDailyInsight(TODAY_WORD.text);
    setInsight(result);
    setLoading(false);
  };

  return (
    <div className="bg-white md:rounded-lg border-b md:border border-gray-200 mb-6 overflow-hidden">
      {/* Instagram Story-like Header */}
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 px-5 py-4 flex justify-between items-center text-white">
        <div>
          <h2 className="text-xs font-semibold opacity-90 uppercase tracking-wider">{TODAY_WORD.date}</h2>
          <h1 className="text-lg font-bold mt-0.5">{TODAY_WORD.reference}</h1>
        </div>
        <BookOpen className="opacity-90" size={20} />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{TODAY_WORD.title}</h3>
        
        <div className={`relative ${!expanded ? 'max-h-24 overflow-hidden' : ''} transition-all duration-300`}>
          <p className="text-gray-800 leading-relaxed whitespace-pre-line text-sm md:text-base font-light">
            {TODAY_WORD.text}
          </p>
          {!expanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full flex justify-center items-center gap-1 mt-3 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
        >
          {expanded ? (
            <>접기 <ChevronUp size={14} /></>
          ) : (
            <>더 보기 <ChevronDown size={14} /></>
          )}
        </button>

        <div className="mt-5 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300 italic">
          <p className="text-gray-600 font-medium text-sm">
            {`"${TODAY_WORD.keyVerse}"`}
          </p>
        </div>

        {/* AI Insight Section */}
        <div className="mt-5">
            {!insight && !loading && (
                <button 
                    onClick={handleGetInsight}
                    className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 flex justify-center items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                    <Sparkles size={16} className="text-yellow-500" />
                    <span>AI 묵상 질문 보기</span>
                </button>
            )}

            {loading && (
                 <div className="w-full py-4 flex justify-center items-center text-gray-400 gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                    <span className="text-sm">생각하는 중...</span>
                 </div>
            )}

            {insight && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg animate-fade-in border border-purple-100">
                    <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-purple-600">
                            <Sparkles size={16} fill="currentColor" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-1">묵상 포인트</h4>
                            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DailyWordCard;