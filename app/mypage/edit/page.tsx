"use client";

import { useAlert } from "@/app/components/AlertProvider";
import { MobileHeader } from "@/app/components/MobileHeader";
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
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import UserAvatar from "@/app/components/UserAvatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { useProfile } from "../hooks/useProfile";

const ENNEAGRAM_OPTIONS = [
  { value: "", label: "에니어그램 유형 선택" },
  { value: "1w9", label: "1w9 - 모세 (이상주의자)" }, // 완벽주의자 + 중재자 날개
  { value: "1w2", label: "1w2 - 모세 (옹호자)" }, // 완벽주의자 + 돕는 사람 날개
  { value: "2w1", label: "2w1 - 룻 (봉사자)" }, // 돕는 사람 + 완벽주의자 날개
  { value: "2w3", label: "2w3 - 룻 (후원자)" }, // 돕는 사람 + 성취자 날개
  { value: "3w2", label: "3w2 - 사무엘 (매력가)" }, // 성취자 + 돕는 사람 날개
  { value: "3w4", label: "3w4 - 사무엘 (전문가)" }, // 성취자 + 개인주의자 날개
  { value: "4w3", label: "4w3 - 세례 요한 (귀족)" }, // 개인주의자 + 성취자 날개
  { value: "4w5", label: "4w5 - 세례 요한 (보헤미안)" }, // 개인주의자 + 탐구자 날개
  { value: "5w4", label: "5w4 - 요셉 (상징주의자)" }, // 탐구자 + 개인주의자 날개
  { value: "5w6", label: "5w6 - 요셉 (문제해결자)" }, // 탐구자 + 충성가 날개
  { value: "6w5", label: "6w5 - 이삭 (수호자)" }, // 충성가 + 탐구자 날개
  { value: "6w7", label: "6w7 - 이삭 (동반자)" }, // 충성가 + 열정가 날개
  { value: "7w6", label: "7w6 - 솔로몬 (연예인)" }, // 열정가 + 충성가 날개
  { value: "7w8", label: "7w8 - 솔로몬 (현실주의자)" }, // 열정가 + 도전자 날개
  { value: "8w7", label: "8w7 - 다윗 (독립가)" }, // 도전자 + 열정가 날개
  { value: "8w9", label: "8w9 - 다윗 (곰)" }, // 도전자 + 중재자 날개
  { value: "9w8", label: "9w8 - 아브라함 (심판관)" }, // 중재자 + 도전자 날개
  { value: "9w1", label: "9w1 - 아브라함 (꿈꾸는 자)" }, // 중재자 + 완벽주의자 날개
];

const inputErrorClass =
  "border-red-300 focus:ring-red-400 focus:border-red-400";

const fadeRise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" as const, delay },
});

export default function MyPageEdit() {
  const router = useRouter();
  const showAlert = useAlert();
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
      user_name: "",
      guk_no: undefined,
      birth_date: "",
      enneagram_type: undefined,
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      user_name: profile.user_name,
      guk_no: profile.guk_no,
      birth_date: profile.birth_date,
      enneagram_type: profile.enneagram_type ?? undefined,
    });
  }, [profile, reset]);

  const onSubmit = async (data: SignupFormData) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    const { error: updateError } = await supabase
      .from("oq_users")
      .update({
        user_name: data.user_name,
        guk_no: data.guk_no,
        birth_date: data.birth_date,
        enneagram_type: data.enneagram_type,
      })
      .eq("id", user.id);

    if (updateError) {
      showAlert("저장에 실패했습니다. 다시 시도해 주세요.");
      return;
    }
    router.push("/mypage");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20 md:pb-8 animate-pulse">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <div className="h-4 w-10 bg-gray-100 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
          <div className="h-4 w-10 bg-gray-100 rounded" />
        </div>
        <div className="px-4 py-6 max-w-xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 bg-gray-100 rounded" />
              <div className="h-3 w-44 bg-gray-100 rounded" />
            </div>
          </div>
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-gray-100 rounded" />
                <div className="h-10 w-full bg-gray-50 rounded-md border border-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-20 text-center text-gray-500">
        <p className="text-sm text-red-600 mb-4">
          {error ?? "로그인이 필요해요."}
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
    <div className="pb-20 md:py-8">
      <MobileHeader
        showLogo={false}
        leftContent={
          <Link
            href="/mypage"
            className="flex items-center gap-0.5 text-gray-700 hover:opacity-70 -ml-1"
            aria-label="뒤로"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </Link>
        }
        rightContent={
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || !isDirty}
            className="text-sm font-semibold text-blue-500 hover:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "저장 중..." : "완료"}
          </button>
        }
      />

      <div className="mt-2 md:mt-0 px-4 md:px-0 space-y-6 max-w-xl mx-auto">
        {/* 프로필 사진 카드 */}
        <motion.div
          {...fadeRise(0)}
          className="bg-white p-5 rounded-lg border border-gray-200"
        >
          <div className="flex items-center gap-5">
            <UserAvatar
              src={profile.avatar_url ?? undefined}
              alt={profile.user_name}
              size="xl"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{profile.user_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                소셜 계정 프로필 사진이 표시됩니다.
              </p>
            </div>
          </div>
        </motion.div>

        {/* 기본 정보 카드 */}
        <motion.div
          {...fadeRise(0.1)}
          className="bg-white p-5 rounded-lg border border-gray-200"
        >
          <h2 className="font-bold text-gray-900 text-sm mb-4">기본 정보</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="user_name"
                className="text-xs font-medium text-gray-500"
              >
                이름
              </label>
              <Input
                id="user_name"
                type="text"
                placeholder="이름 (한글 10자 이내)"
                maxLength={10}
                className={cn(
                  "bg-gray-50",
                  errors.user_name && inputErrorClass,
                )}
                {...register("user_name")}
              />
              {errors.user_name && (
                <p className="text-xs text-red-600">
                  {errors.user_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="guk_no"
                className="text-xs font-medium text-gray-500"
              >
                청년부 소속국
              </label>
              <div className="relative">
                <Input
                  id="guk_no"
                  type="number"
                  placeholder="1~5"
                  min={1}
                  max={5}
                  className={cn(
                    "bg-gray-50 pr-9",
                    errors.guk_no && inputErrorClass,
                  )}
                  {...register("guk_no")}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  국
                </span>
              </div>
              {errors.guk_no && (
                <p className="text-xs text-red-600">{errors.guk_no.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="birth_date"
                className="text-xs font-medium text-gray-500"
              >
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
                <p className="text-xs text-red-600">
                  {errors.birth_date.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="enneagram_type"
                className="text-xs font-medium text-gray-500"
              >
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
                      className={cn(
                        "bg-gray-50",
                        errors.enneagram_type && inputErrorClass,
                      )}
                    >
                      <SelectValue placeholder="에니어그램 유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {ENNEAGRAM_OPTIONS.filter((o) => o.value !== "").map(
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
                <p className="text-xs text-red-600">
                  {errors.enneagram_type.message}
                </p>
              )}
            </div>
          </form>
        </motion.div>

        {/* 회원탈퇴 카드 */}
        <motion.div
          {...fadeRise(0.2)}
          className="bg-white p-5 rounded-lg border border-gray-200"
        >
          <Link
            href="/mypage/delete"
            className="block text-center text-sm text-red-600 hover:text-red-700 font-medium"
          >
            회원탈퇴
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
