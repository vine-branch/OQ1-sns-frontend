"use client";

import {
  useKakaoProfile,
  useSignupFormDefaults,
  useSignupSubmit,
} from "@/app/signup/hooks";
import { signupSchema, type SignupFormData } from "@/app/signup/schema";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Controller, useForm } from "react-hook-form";

const SIGNUP_FORM_ID = "signup-form";

const ENNEAGRAM_OPTIONS = [
  { value: "", label: "에니어그램 유형 선택" },
  { value: "1", label: "1번 - 완벽주의자" },
  { value: "2", label: "2번 - 돕는 사람" },
  { value: "3", label: "3번 - 성취하는 사람" },
  { value: "4", label: "4번 - 개인주의자" },
  { value: "5", label: "5번 - 탐구자" },
  { value: "6", label: "6번 - 충성스러운 사람" },
  { value: "7", label: "7번 - 열정적인 사람" },
  { value: "8", label: "8번 - 도전자" },
  { value: "9", label: "9번 - 중재자" },
];

const inputErrorClass =
  "border-red-300 focus:ring-red-400 focus:border-red-400";

function SignupContent() {
  const searchParams = useSearchParams();
  const fromKakao = searchParams.get("from") === "kakao";
  const {
    userName: kakaoUserName,
    avatarUrl: kakaoAvatarUrl,
    isLoaded,
  } = useKakaoProfile(fromKakao);
  const { formKey, formDefaultUserName } = useSignupFormDefaults(
    fromKakao,
    isLoaded,
    kakaoUserName,
  );

  return (
    <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4">
        <h1 className="text-2xl font-bold italic font-serif tracking-tight text-center text-gray-900">
          OQ1
        </h1>
        <p className="text-center text-sm font-medium text-gray-600 mt-1">
          오늘 큐티 완료
        </p>
        <p className="text-center text-xs text-gray-500 mt-2 mb-6">
          매일 QT를 나누고 사람을 연결하는 플랫폼
        </p>
        {fromKakao ? (
          <div className="flex flex-col items-center gap-3 mb-6">
            {kakaoAvatarUrl ? (
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 shrink-0">
                <Image
                  src={kakaoAvatarUrl}
                  alt="프로필"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : null}
            <p className="text-sm text-gray-700 text-center bg-gray-50 rounded-md py-3 px-3">
              한 단계만 남았어요. 아래 항목을 입력하면 가입이 완료됩니다.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center mb-6">회원가입</p>
        )}

        <SignupForm
          key={formKey}
          formDefaultUserName={formDefaultUserName}
          fromKakao={fromKakao}
        />
      </div>

      {fromKakao ? null : (
        <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg py-5 px-4 text-center">
          <p className="text-sm text-gray-700">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold text-gray-900 hover:underline"
            >
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

type SignupFormProps = {
  formDefaultUserName: string;
  fromKakao: boolean;
};

function SignupForm({ formDefaultUserName, fromKakao }: SignupFormProps) {
  const submitSignup = useSignupSubmit(fromKakao);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zodResolver Zod version compatibility
    resolver: zodResolver(signupSchema as any),
    defaultValues: {
      user_name: formDefaultUserName,
      guk_no: undefined,
      birth_date: "",
      leader_name: "",
      enneagram_type: undefined,
    },
  });

  const onInvalid = (fieldErrors: Record<string, unknown>) => {
    const firstErrorKey = (
      Object.keys(fieldErrors) as (keyof SignupFormData)[]
    )[0];
    if (!firstErrorKey) return;
    const formEl = document.getElementById(SIGNUP_FORM_ID);
    const el = formEl?.querySelector<HTMLElement>(
      `[name="${firstErrorKey}"], #${firstErrorKey}`,
    );
    el?.scrollIntoView?.({ behavior: "smooth", block: "center" });
  };

  const onSubmit = async (data: SignupFormData) => {
    try {
      await submitSignup(data);
    } catch (e) {
      console.error("Signup submit error:", e);
      alert("가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <form
      id={SIGNUP_FORM_ID}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-4"
    >
      <div>
        <label
          htmlFor="user_name"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          이름 *
        </label>
        <Input
          id="user_name"
          type="text"
          placeholder="이름을 입력하세요 (한글 10자 이내)"
          maxLength={10}
          className={cn(errors.user_name && inputErrorClass)}
          {...register("user_name")}
        />
        {errors.user_name && (
          <p className="mt-1 text-xs text-red-600">
            {errors.user_name.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="guk_no"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          청년부 소속국(n국) *
        </label>
        <div className="relative">
          <Input
            id="guk_no"
            type="number"
            placeholder="숫자로 입력"
            min={1}
            max={5}
            className={cn("pr-9", errors.guk_no && inputErrorClass)}
            {...register("guk_no")}
          />
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
            aria-hidden
          >
            국
          </span>
        </div>
        {errors.guk_no && (
          <p className="mt-1 text-xs text-red-600">{errors.guk_no.message}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="birth_date"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          생년월일 *
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
          <p className="mt-1 text-xs text-red-600">
            {errors.birth_date.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="leader_name"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          리더 이름 *
        </label>
        <Input
          id="leader_name"
          type="text"
          placeholder="리더 이름을 입력하세요 (한글 10자 이내)"
          maxLength={10}
          className={cn(errors.leader_name && inputErrorClass)}
          {...register("leader_name")}
        />
        {errors.leader_name && (
          <p className="mt-1 text-xs text-red-600">
            {errors.leader_name.message}
          </p>
        )}
      </div>
      <div>
        <label
          htmlFor="enneagram_type"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          에니어그램 유형 *
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
                className={cn(errors.enneagram_type && inputErrorClass)}
              >
                <SelectValue placeholder="에니어그램 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {ENNEAGRAM_OPTIONS.filter((opt) => opt.value !== "").map(
                  (opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      textValue={opt.label}
                    >
                      {opt.label}
                    </SelectItem>
                  ),
                )}
              </SelectContent>
            </Select>
          )}
        />
        {errors.enneagram_type && (
          <p className="mt-1 text-xs text-red-600">
            {errors.enneagram_type.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 text-sm font-semibold text-white bg-black rounded-md hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? "가입 중..." : "가입하기"}
      </button>
    </form>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-fafafa flex items-center justify-center text-gray-500 text-sm">
          로딩 중...
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
