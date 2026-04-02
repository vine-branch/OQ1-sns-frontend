/**
 * 카카오 프로필에 값이 있으면 폼 기본값으로 사용. (있으면 무조건 채움)
 */
export function useSignupFormDefaults(
  fromKakao: boolean,
  isLoaded: boolean,
  kakaoUserName: string | null,
) {
  const formDefaultUserName = fromKakao && isLoaded ? (kakaoUserName ?? "") : "";
  const formKey = `signup-${fromKakao}-${isLoaded}-${formDefaultUserName}`;
  return { formKey, formDefaultUserName };
}
