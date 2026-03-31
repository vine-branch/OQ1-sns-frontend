"use client";

import { useAlert } from "@/app/components/AlertProvider";
import OAuthLoginButton from "@/app/components/OAuthLoginButton";
import UserAvatar from "@/app/components/UserAvatar";
import {
  useKakaoProfile,
  useSignupFormDefaults,
  useSignupSubmit,
} from "@/app/signup/hooks";
import { signupSchema, type SignupFormData } from "@/app/signup/schema";
import abrahamImg from "@/assets/images/abraham.png";
import davidImg from "@/assets/images/david.png";
import isaacImg from "@/assets/images/isaac.png";
import johnImg from "@/assets/images/john.png";
import josephImg from "@/assets/images/joseph.png";
import mosesImg from "@/assets/images/moses.png";
import ruthImg from "@/assets/images/ruth.png";
import samuelImg from "@/assets/images/samuel.png";
import solomonImg from "@/assets/images/solomon.png";
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
import { useOAuthLogin } from "@/app/hooks/useOAuthLogin";
import { ENNEAGRAM_OPTIONS, INPUT_ERROR_CLASS } from "@/lib/constants";
import { fadeRise } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

const ENNEAGRAM_INFO: Record<
  string,
  { name: string; description: string; image: StaticImageData }
> = {
  "1": {
    name: "모세",
    description: "완벽을 추구하는 이상주의자",
    image: mosesImg,
  },
  "2": { name: "룻", description: "사랑으로 섬기는 돕는 사람", image: ruthImg },
  "3": {
    name: "사무엘",
    description: "목표를 향해 달려가는 성취자",
    image: samuelImg,
  },
  "4": {
    name: "세례 요한",
    description: "진정성을 추구하는 개인주의자",
    image: johnImg,
  },
  "5": {
    name: "요셉",
    description: "지혜롭게 관찰하는 탐구자",
    image: josephImg,
  },
  "6": { name: "이삭", description: "신실하게 따르는 충성가", image: isaacImg },
  "7": {
    name: "솔로몬",
    description: "기쁨을 나누는 열정가",
    image: solomonImg,
  },
  "8": {
    name: "다윗",
    description: "담대하게 도전하는 지도자",
    image: davidImg,
  },
  "9": {
    name: "아브라함",
    description: "평화를 이루는 중재자",
    image: abrahamImg,
  },
};

const SIGNUP_FORM_ID = "signup-form";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromKakao = searchParams.get("from") === "kakao";
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
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

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
      // 가입 완료된 사용자는 홈으로 리다이렉트
      const { data: profile } = await supabase
        .from("oq_users")
        .select("birth_date")
        .eq("id", user.id)
        .single();
      if (profile?.birth_date) {
        // router.replace("/");
        // return;
      }
      setIsAuthenticated(true);
    };
    checkAuth();
  }, [router]);

  const { login: oauthLogin } = useOAuthLogin();

  const handleSignupLogin = () => {
    const enneagramType = searchParams.get("enneagram-type");
    oauthLogin(
      "kakao",
      enneagramType ? { "enneagram-type": enneagramType } : undefined,
    );
  };

  // 세션 확인 중
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12 animate-pulse">
        <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4">
          <div className="h-7 w-16 bg-gray-100 rounded mx-auto mb-2" />
          <div className="h-3 w-28 bg-gray-100 rounded mx-auto mb-8" />
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-12 bg-gray-100 rounded" />
                <div className="h-10 w-full bg-gray-50 rounded-md border border-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 미인증: 카카오 로그인 유도
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          {...fadeRise(0)}
          className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4"
        >
          <h1 className="text-2xl font-bold italic font-serif tracking-tight text-center text-gray-900">
            OQ1
          </h1>
          <p className="text-center text-sm font-medium text-gray-600 mt-1">
            오늘 큐티 완료
          </p>
          <p className="text-center text-xs text-gray-500 mt-2 mb-8">
            회원가입을 위해 먼저 카카오 로그인이 필요합니다.
          </p>
          <OAuthLoginButton provider="kakao" onClick={handleSignupLogin} variant="signup" />
          <p className="text-center text-xs text-gray-500 mt-4">
            카카오 계정 하나로 로그인·가입됩니다.
          </p>
        </motion.div>
      </div>
    );
  }

  // 인증됨: 회원가입 폼
  const enneagramType =
    searchParams.get("enneagram-type") ||
    localStorage.getItem("oauth:enneagram-type") ||
    undefined;
  const hasPresetType = !!enneagramType;

  return (
    <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12">
      {hasPresetType && <EnneagramHero typeValue={enneagramType} />}

      <motion.div
        {...fadeRise(hasPresetType ? 0.15 : 0)}
        className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4"
      >
        {!hasPresetType && (
          <>
            <h1 className="text-2xl font-bold italic font-serif tracking-tight text-center text-gray-900">
              OQ1
            </h1>
            <p className="text-center text-sm font-medium text-gray-600 mt-1">
              오늘 큐티 완료
            </p>
            <p className="text-center text-xs text-gray-500 mt-2 mb-6">
              매일 QT를 나누고 사람을 연결하는 플랫폼
            </p>
          </>
        )}
        <p className="text-sm text-gray-700 text-center bg-gray-50 rounded-md py-3 px-3 mb-6">
          {hasPresetType
            ? "아래 정보만 입력하면 가입이 완료됩니다."
            : "한 단계만 남았어요. 아래 항목을 입력하면 가입이 완료됩니다."}
        </p>

        <SignupForm
          kakaoAvatarUrl={kakaoAvatarUrl}
          key={formKey}
          formDefaultUserName={formDefaultUserName}
          fromKakao={true}
          defaultEnneagramType={enneagramType}
        />
      </motion.div>
    </div>
  );
}

function EnneagramHero({ typeValue }: { typeValue?: string }) {
  const mainType = typeValue?.[0];
  const info = mainType ? ENNEAGRAM_INFO[mainType] : undefined;

  if (!info) return null;

  const imageSrc = info.image;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-6 mb-4 text-center"
    >
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
        Your Type
      </p>
      <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
        <Image
          src={imageSrc}
          alt={info.name}
          fill
          className="object-contain"
          placeholder="blur"
        />
      </div>
      <h2 className="text-xl font-bold text-gray-900">{info.name}</h2>
      <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{typeValue}</p>
      <p className="text-sm text-gray-600 mt-2">{info.description}</p>
    </motion.div>
  );
}

function EnneagramPreview({ typeValue }: { typeValue?: string }) {
  const mainType = typeValue?.[0];
  const info = mainType ? ENNEAGRAM_INFO[mainType] : undefined;
  const imageSrc = info?.image ?? null;

  return (
    <AnimatePresence mode="wait">
      {info && imageSrc && (
        <motion.div
          key={mainType}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
        >
          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 shrink-0">
            <Image
              src={imageSrc}
              alt={info.name}
              fill
              className="object-contain"
              placeholder="blur"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{info.name} 타입</p>
            <p className="text-xs text-gray-500 mt-0.5">{info.description}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// useWatch로 watch() 대체 — React Compiler 호환
function EnneagramPreviewConnected({
  control,
}: {
  control: import("react-hook-form").Control<SignupFormData>;
}) {
  const enneagramType = useWatch({ control, name: "enneagram_type" });
  return <EnneagramPreview typeValue={enneagramType} />;
}

type SignupFormProps = {
  formDefaultUserName: string;
  fromKakao: boolean;
  defaultEnneagramType?: string;
  kakaoAvatarUrl?: string | null;
};

function SignupForm({
  formDefaultUserName,
  fromKakao,
  defaultEnneagramType,
  kakaoAvatarUrl,
}: SignupFormProps) {
  const showAlert = useAlert();
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
      enneagram_type: defaultEnneagramType,
      agree_terms: undefined,
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
      showAlert("가입 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <form
      id={SIGNUP_FORM_ID}
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-4"
    >
      {!defaultEnneagramType && <EnneagramPreviewConnected control={control} />}
      <div>
        <label
          htmlFor="user_name"
          className="block text-xs font-medium text-gray-600 mb-1"
        >
          이름 *
        </label>
        <div className="flex items-center gap-2">
          {kakaoAvatarUrl && (
            <UserAvatar src={kakaoAvatarUrl} alt="나" size="sm" />
          )}
          <Input
            id="user_name"
            type="text"
            placeholder="이름을 입력하세요 (한글 10자 이내)"
            maxLength={10}
            className={cn(errors.user_name && INPUT_ERROR_CLASS)}
            {...register("user_name")}
          />
        </div>
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
            className={cn("pr-9", errors.guk_no && INPUT_ERROR_CLASS)}
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
        {!defaultEnneagramType && (
          <>
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
                    className={cn(errors.enneagram_type && INPUT_ERROR_CLASS)}
                  >
                    <SelectValue placeholder="에니어그램 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENNEAGRAM_OPTIONS.map(
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
          </>
        )}
      </div>

      <div>
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className={cn(
              "mt-0.5 h-4 w-4 rounded border-gray-300 text-black focus:ring-gray-900 cursor-pointer",
              errors.agree_terms && "border-red-300",
            )}
            {...register("agree_terms")}
          />
          <span className="text-xs text-gray-600 leading-relaxed">
            <Link
              href="/terms"
              target="_blank"
              className="underline hover:text-gray-900"
            >
              이용약관
            </Link>
            {" 및 "}
            <Link
              href="/privacy"
              target="_blank"
              className="underline hover:text-gray-900"
            >
              개인정보 처리방침
            </Link>
            에 동의합니다.
          </span>
        </label>
        {errors.agree_terms && (
          <p className="mt-1 text-xs text-red-600">
            {errors.agree_terms.message}
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
        <div className="min-h-screen bg-fafafa flex flex-col items-center justify-center px-4 py-12 animate-pulse">
          <div className="w-full max-w-[360px] bg-white border border-gray-200 rounded-lg p-8 mb-4">
            <div className="h-7 w-16 bg-gray-100 rounded mx-auto mb-2" />
            <div className="h-3 w-28 bg-gray-100 rounded mx-auto mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="h-3 w-12 bg-gray-100 rounded" />
                  <div className="h-10 w-full bg-gray-50 rounded-md border border-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
