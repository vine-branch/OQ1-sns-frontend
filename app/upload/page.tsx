'use client';

import Image from 'next/image';
import { ArrowLeft, Home, Image as ImageIcon, Sparkles, Trophy, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';
import { CURRENT_USER, TODAY_WORD } from '../constants';
import { generatePrayerFromReflection } from '../services/geminiService';

export default function UploadPage() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGeneratingPrayer, setIsGeneratingPrayer] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleGeneratePrayer = async () => {
    if (!content || content.length < 10) {
      alert("묵상 내용을 10자 이상 적어주세요!");
      return;
    }
    setIsGeneratingPrayer(true);
    const prayer = await generatePrayerFromReflection(content);
    setContent(prev => prev + "\n\n[오늘의 기도]\n" + prayer);
    setIsGeneratingPrayer(false);
  };

  const handleSubmit = () => {
    if (!content) return;
    setShowReward(true);
  };

  const handleCloseReward = () => {
    router.push('/');
  };

  return (
    <div className="bg-white min-h-screen pb-20 md:pb-8 relative">
      
      {/* Reward Overlay */}
      {showReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center transform scale-100 animate-bounce-in relative overflow-hidden">
             
             {/* Background Gradient Blob */}
             <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-50"></div>
             <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-50"></div>

             <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-tr from-yellow-300 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-5 text-white shadow-lg">
                    <Trophy size={40} strokeWidth={1.5} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">인증 완료!</h2>
                <p className="text-gray-500 mb-8 text-sm">오늘도 말씀을 통해 승리하셨군요!</p>
                
                <div className="space-y-3 mb-8">
                    <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">획득 경험치</span>
                        <span className="text-sm font-bold text-blue-500">+50 EXP</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                        <span className="text-sm font-semibold text-gray-600">연속 묵상</span>
                        <div className="flex items-center gap-1">
                             <span className="text-sm font-bold text-orange-500">{CURRENT_USER.streak + 1}일째</span>
                             <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">HOT</span>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleCloseReward}
                    className="w-full bg-blue-500 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                >
                    <Home size={18} />
                    <span>홈으로 돌아가기</span>
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.back()} className="p-1 -ml-1 hover:opacity-70 transition-opacity">
          <ArrowLeft size={26} className="text-gray-900" strokeWidth={1.5} />
        </button>
        <h1 className="text-base font-bold text-gray-900">새 게시물</h1>
        <button 
          onClick={handleSubmit}
          className={`text-sm font-semibold transition-colors ${content ? 'text-blue-500 hover:text-blue-700' : 'text-blue-200 cursor-default'}`}
        >
          공유
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Today's Word Quote */}
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-300">
           <h2 className="font-bold text-gray-900 text-sm mb-1">{TODAY_WORD.reference}</h2>
           <p className="text-sm text-gray-600 line-clamp-2 italic">{`"${TODAY_WORD.text}"`}</p>
        </div>

        {/* Text Editor */}
        <div className="flex gap-3">
           <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 relative">
               <Image src={CURRENT_USER.avatar} alt="Me" fill className="object-cover" unoptimized />
           </div>
           <div className="flex-1">
              <textarea 
                className="w-full h-40 p-0 text-base placeholder:text-gray-400 border-none focus:ring-0 resize-none leading-relaxed bg-transparent"
                placeholder="문구를 입력하세요..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
           </div>
        </div>
        
        {/* Image Preview Area */}
        {image && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200 aspect-video">
                <Image src={image} alt="Preview" fill className="object-cover" unoptimized />
                <button 
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
        )}

        {/* AI Helper Button */}
        <div className="flex justify-end">
            <button 
                onClick={handleGeneratePrayer}
                disabled={isGeneratingPrayer}
                className="flex items-center gap-2 text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
            >
                {isGeneratingPrayer ? (
                    <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <Sparkles size={14} />
                )}
                <span>AI 기도문 생성</span>
            </button>
        </div>

        {/* Tools Section */}
        <div className="border-t border-gray-100 pt-2">
            
            {/* Action Items */}
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-between py-3.5 border-b border-gray-100 cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded transition-colors"
            >
                <div className="flex items-center gap-3">
                    <ImageIcon size={22} className="text-gray-900" strokeWidth={1.5} />
                    <span className="text-base text-gray-900">사진 추가</span>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                />
            </div>

            {/* Tags Input */}
            <div className="py-3.5 border-b border-gray-100">
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded font-medium flex items-center gap-1">
                            #{tag}
                            <button onClick={() => removeTag(tag)} className="hover:text-blue-800"><X size={12} /></button>
                        </span>
                    ))}
                </div>
                <input 
                    type="text" 
                    placeholder="# 태그 입력..." 
                    className="w-full text-base bg-transparent border-none p-0 focus:ring-0 placeholder:text-gray-400"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between py-3.5 px-2 -mx-2">
                <span className="text-base text-gray-900">나만 보기</span>
                <button 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-black' : 'bg-gray-300'}`}
                >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${isAnonymous ? 'left-[22px]' : 'left-0.5'}`}></div>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
