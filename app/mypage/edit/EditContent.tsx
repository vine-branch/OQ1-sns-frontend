"use client";

import { useAlert } from "@/app/components/AlertProvider";
import { MobileHeader } from "@/app/components/MobileHeader";
import { profileSchema, type ProfileFormData } from "@/app/signup/schema";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ENNEAGRAM_OPTIONS, INPUT_ERROR_CLASS } from "@/lib/constants";
import { fadeRise } from "@/lib/animations";
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


interface EditContentProps {
  userId: string;
}

export default function EditContent({ userId }: EditContentProps) {
  const router = useRouter();
  const showAlert = useAlert();
  const { profile, loading, error } = useProfile();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- zodResolver Zod version compatibility
    resolver: zodResolver(profileSchema as any),
    defaultValues: {
      user_name: "",
      guk_no: undefined,
      birth_date: "",
      enneagram_type: "",
    },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      user_name: profile.user_name,
      guk_no: profile.guk_no,
      birth_date: profile.birth_date,
      enneagram_type: profile.enneagram_type ?? "",
    });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("oq_users")
      .update({
        user_name: data.user_name,
        guk_no: data.guk_no,
        birth_date: data.birth_date,
        enneagram_type: data.enneagram_type,
      })
      .eq("id", userId);

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
                    errors.user_name && INPUT_ERROR_CLASS,
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
                      errors.guk_no && INPUT_ERROR_CLASS,
                    )}
                    {...register("guk_no")}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    국
                  </span>
                </div>
                {errors.guk_no && (
                  <p className="text-xs text-red-600">
                    {errors.guk_no.message}
                  </p>
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
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="enneagram_type"
                        className={cn(
                          "bg-gray-50",
                          errors.enneagram_type && INPUT_ERROR_CLASS,
                        )}
                      >
                        <SelectValue placeholder="에니어그램 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {ENNEAGRAM_OPTIONS.map((opt) => (
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
                  <p className="text-xs text-red-600">
                    {errors.enneagram_type.message}
                  </p>
                )}
              </div>
              <button
              type="submit"
              disabled={isSubmitting || !isDirty}
              className="hidden md:block w-full py-2.5 text-sm font-semibold text-white bg-black rounded-md hover:opacity-90 active:opacity-80 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? "저장 중..." : "수정 완료"}
            </button>
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
