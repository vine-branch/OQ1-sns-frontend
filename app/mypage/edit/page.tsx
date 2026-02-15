'use client';

import { signupSchema, type SignupFormData } from '@/app/signup/schema';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useProfile } from '../hooks/useProfile';

const ENNEAGRAM_OPTIONS = [
  { value: '', label: '에니어그램 유형 선택' },
  { value: '1', label: '1번 - 완벽주의자' },
  { value: '2', label: '2번 - 돕는 사람' },
  { value: '3', label: '3번 - 성취하는 사람' },
  { value: '4', label: '4번 - 개인주의자' },
  { value: '5', label: '5번 - 탐구자' },
  { value: '6', label: '6번 - 충성스러운 사람' },
  { value: '7', label: '7번 - 열정적인 사람' },
  { value: '8', label: '8번 - 도전자' },
  { value: '9', label: '9번 - 중재자' },
];

const inputErrorClass =
  'border-red-300 focus:ring-red-400 focus:border-red-400';

export default function MyPageEdit() {
  const router = useRouter();
  const { profile, loading, error } = useProfile();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SignupFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zodResolver Zod version compatibility
    resolver: zodResolver(signupSchema as any),
    defaultValues: {
      user_name: '',
      guk_no: undefined,
      birth_date: '',
      leader_name: '',
      enneagram_type: undefined,
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      user_name: profile.user_name,
      guk_no: profile.guk_no,
      birth_date: profile.birth_date,
      leader_name: profile.leader_name,
      enneagram_type: profile.enneagram_type ?? undefined,
    });
  }, [profile, reset]);

  const onSubmit = async (data: SignupFormData) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    const { error: updateError } = await supabase
      .from('oq_users')
      .update({
        user_name: data.user_name,
        guk_no: data.guk_no,
        birth_date: data.birth_date,
        leader_name: data.leader_name,
        enneagram_type: data.enneagram_type,
      })
      .eq('id', user.id);

    if (updateError) {
      alert('저장에 실패했습니다. 다시 시도해 주세요.');
      return;
    }
    router.push('/mypage');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <p className="text-sm text-red-600">
          {error ?? '로그인이 필요해요.'}
        </p>
        <Link
          href="/login"
          className="text-sm font-medium text-black underline"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8">
      {/* 인스타그램 스타일 헤더: 취소 | 프로필 편집 | 완료 */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:rounded-t-lg">
        <Link
          href="/mypage"
          className="flex items-center gap-1 text-black hover:opacity-70"
          aria-label="취소"
        >
          <ChevronLeft size={24} strokeWidth={2} />
          <span className="text-base font-medium">취소</span>
        </Link>
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base font-semibold text-gray-900">
          프로필 편집
        </h1>
        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || !isDirty}
          className="text-base font-semibold text-black hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '저장 중...' : '완료'}
        </button>
      </header>

      <div className="px-4 py-6 max-w-xl mx-auto">
        {/* 프로필 사진 영역 (인스타그램처럼 상단) */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt="프로필"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                👤
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">프로필 사진</p>
            <p className="text-sm text-gray-500 mt-0.5">
              카카오 로그인 시 사용 중인 프로필 사진이 표시됩니다.
            </p>
          </div>
        </div>

        {/* 폼: 인스타그램처럼 라벨 + 입력 한 줄 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="user_name" className="text-sm font-medium text-gray-700">
              이름
            </label>
            <Input
              id="user_name"
              type="text"
              placeholder="이름 (한글 10자 이내)"
              maxLength={10}
              className={cn('bg-gray-50', errors.user_name && inputErrorClass)}
              {...register('user_name')}
            />
            {errors.user_name && (
              <p className="text-xs text-red-600">{errors.user_name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="guk_no" className="text-sm font-medium text-gray-700">
              청년부 소속국(n국)
            </label>
            <div className="relative">
              <Input
                id="guk_no"
                type="number"
                placeholder="1~5"
                min={1}
                max={5}
                className={cn('bg-gray-50 pr-9', errors.guk_no && inputErrorClass)}
                {...register('guk_no')}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                국
              </span>
            </div>
            {errors.guk_no && (
              <p className="text-xs text-red-600">{errors.guk_no.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="birth_date" className="text-sm font-medium text-gray-700">
              생년월일
            </label>
            <Controller
              name="birth_date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="생년월일 선택"
                  error={!!errors.birth_date}
                />
              )}
            />
            {errors.birth_date && (
              <p className="text-xs text-red-600">{errors.birth_date.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="leader_name" className="text-sm font-medium text-gray-700">
              리더 이름
            </label>
            <Input
              id="leader_name"
              type="text"
              placeholder="리더 이름 (한글 10자 이내)"
              maxLength={10}
              className={cn('bg-gray-50', errors.leader_name && inputErrorClass)}
              {...register('leader_name')}
            />
            {errors.leader_name && (
              <p className="text-xs text-red-600">{errors.leader_name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="enneagram_type" className="text-sm font-medium text-gray-700">
              에니어그램 유형
            </label>
            <Controller
              name="enneagram_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="enneagram_type"
                    className={cn('bg-gray-50', errors.enneagram_type && inputErrorClass)}
                  >
                    <SelectValue placeholder="에니어그램 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENNEAGRAM_OPTIONS.filter((o) => o.value !== '').map((opt) => (
                      <SelectItem
                        key={opt.value}
                        value={opt.value}
                        textValue={opt.label}
                      >
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.enneagram_type && (
              <p className="text-xs text-red-600">{errors.enneagram_type.message}</p>
            )}
          </div>
        </form>

        {/* 회원탈퇴 링크 */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/mypage/delete"
            className="block text-center text-sm text-red-600 hover:text-red-700 font-medium"
          >
            회원탈퇴
          </Link>
        </div>
      </div>
    </div>
  );
}
