'use client';

import { createClient } from '@/lib/supabase/client';
import { CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ReactivatePage() {
  const router = useRouter();
  const [isReactivating, setIsReactivating] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleReactivate = async () => {
    setIsReactivating(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert('로그인이 필요합니다.');
        router.push('/login');
        return;
      }

      // deleted_at을 NULL로 설정하여 계정 복구
      const { error: updateError } = await supabase
        .from('oq_users')
        .update({
          deleted_at: null,
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Account reactivation error:', updateError);
        alert('계정 복구 중 오류가 발생했습니다. 다시 시도해 주세요.');
        setIsReactivating(false);
        return;
      }

      setIsComplete(true);

      // 2초 후 마이페이지로 이동
      setTimeout(() => {
        router.push('/mypage');
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error('Unexpected error during account reactivation:', error);
      alert('예상치 못한 오류가 발생했습니다.');
      setIsReactivating(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              계정이 복구되었습니다!
            </h1>
            <p className="text-sm text-gray-500">
              다시 돌아오신 것을 환영합니다
            </p>
          </div>
          <p className="text-xs text-gray-400">
            잠시 후 마이페이지로 이동합니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 아이콘 */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-4xl">👋</span>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            다시 돌아오셨네요!
          </h1>
          <p className="text-sm text-gray-500">
            탈퇴하신 계정을 복구하시겠어요?
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="bg-blue-50 rounded-lg p-5 text-left space-y-3">
          <h3 className="font-semibold text-blue-900 text-sm">
            💡 계정 복구 안내
          </h3>
          <p className="text-sm text-blue-800">
            탈퇴 후 30일 이내에는 계정을 복구할 수 있습니다.
          </p>
          <p className="text-sm text-blue-800">
            복구하시면 이전의 모든 데이터(프로필, 큐티 묵상, 활동 기록)가 그대로 유지됩니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-3 pt-4">
          <button
            type="button"
            onClick={handleReactivate}
            disabled={isReactivating}
            className="w-full py-3 text-sm font-semibold text-white bg-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isReactivating ? '복구 중...' : '계정 복구하기'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/login')}
            disabled={isReactivating}
            className="w-full py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            취소
          </button>
        </div>

        <p className="text-xs text-gray-400 pt-4">
          복구를 원하지 않으시면 로그아웃 상태를 유지해주세요
        </p>
      </div>
    </div>
  );
}
