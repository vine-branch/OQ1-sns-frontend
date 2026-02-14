'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { OqUser } from '../types';

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

const inputClass =
  'w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400';

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromKakao = searchParams.get('from') === 'kakao';

  const [form, setForm] = useState<Pick<OqUser, 'user_name' | 'guk_no' | 'birth_date' | 'leader_name' | 'enneagram_type'>>({
    user_name: '',
    guk_no: 0,
    birth_date: '',
    leader_name: '',
    enneagram_type: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'guk_no' ? (value ? Number(value) : 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.user_name?.trim() || !form.guk_no || !form.birth_date || !form.leader_name?.trim() || !form.enneagram_type) {
      alert('모든 항목을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      // TODO: POST /api/users 또는 회원가입 API 연동
      const payload = {
        user_name: form.user_name.trim(),
        guk_no: form.guk_no,
        birth_date: form.birth_date,
        leader_name: form.leader_name.trim(),
        enneagram_type: form.enneagram_type,
      };
      console.log('Signup payload:', payload);
      router.push(fromKakao ? '/' : '/login');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4">
        <h1 className="text-2xl font-bold italic font-serif tracking-tight text-center text-gray-900">
          OQ1
        </h1>
        <p className="text-center text-sm font-medium text-gray-600 mt-1">오늘 큐티 완료</p>
        <p className="text-center text-xs text-gray-500 mt-2 mb-6">
          매일 QT를 나누고 사람을 연결하는 플랫폼
        </p>
        {fromKakao ? (
          <p className="text-sm text-gray-700 text-center mb-6 bg-gray-50 rounded-md py-3 px-3">
            카카오로 로그인한 뒤, 아래 회원 정보를 입력해 주세요.
          </p>
        ) : (
          <p className="text-sm text-gray-500 text-center mb-6">회원가입 (oq_users)</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user_name" className="block text-xs font-medium text-gray-600 mb-1">
              이름 *
            </label>
            <input
              id="user_name"
              name="user_name"
              type="text"
              placeholder="이름을 입력하세요"
              value={form.user_name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="guk_no" className="block text-xs font-medium text-gray-600 mb-1">
              국번 (guk_no) *
            </label>
            <input
              id="guk_no"
              name="guk_no"
              type="number"
              placeholder="숫자로 입력"
              value={form.guk_no || ''}
              onChange={handleChange}
              min={1}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="birth_date" className="block text-xs font-medium text-gray-600 mb-1">
              생년월일 *
            </label>
            <input
              id="birth_date"
              name="birth_date"
              type="date"
              value={form.birth_date}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="leader_name" className="block text-xs font-medium text-gray-600 mb-1">
              리더 이름 *
            </label>
            <input
              id="leader_name"
              name="leader_name"
              type="text"
              placeholder="리더 이름을 입력하세요"
              value={form.leader_name}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="enneagram_type" className="block text-xs font-medium text-gray-600 mb-1">
              에니어그램 유형 *
            </label>
            <select
              id="enneagram_type"
              name="enneagram_type"
              value={form.enneagram_type}
              onChange={handleChange}
              className={inputClass}
              required
            >
              {ENNEAGRAM_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 text-sm font-semibold text-white bg-black rounded-md hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? '가입 중...' : '가입하기'}
          </button>
        </form>
      </div>

      {!fromKakao && (
        <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg py-5 px-4 text-center">
          <p className="text-sm text-gray-700">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-semibold text-gray-900 hover:underline">
              로그인
            </Link>
          </p>
        </div>
      )}

      <p className="mt-6 text-xs text-gray-400">
        <Link href="/" className="hover:text-gray-600">
          ← 홈으로
        </Link>
      </p>
    </div>
  );
}
