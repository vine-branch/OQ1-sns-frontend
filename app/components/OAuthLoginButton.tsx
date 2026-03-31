type OAuthProvider = "kakao" | "apple";

const PROVIDER_CONFIG = {
  kakao: {
    label: "카카오로 로그인",
    shortLabel: "카카오로 시작하기",
    className:
      "bg-[#FEE500] hover:bg-[#FADA0A] active:bg-[#E6D000] text-[#191919]",
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.966C1.5 6.665 6.201 3 12 3Z" />
      </svg>
    ),
  },
  apple: {
    label: "Apple로 로그인",
    shortLabel: "Apple로 시작하기",
    className:
      "bg-black hover:bg-gray-800 active:bg-gray-900 text-white",
    icon: (
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
    ),
  },
} as const;

interface OAuthLoginButtonProps {
  provider: OAuthProvider;
  onClick: () => void;
  variant?: "login" | "signup";
}

export default function OAuthLoginButton({
  provider,
  onClick,
  variant = "login",
}: OAuthLoginButtonProps) {
  const config = PROVIDER_CONFIG[provider];
  const label = variant === "signup" ? config.shortLabel : config.label;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold rounded-md transition-colors ${config.className}`}
    >
      {config.icon}
      {label}
    </button>
  );
}
