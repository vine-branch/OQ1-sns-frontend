import { getNow, parseDate, sanitizeText, subtractYears } from "@/lib/utils";
import { z } from "zod";

export const signupSchema = z.object({
  user_name: z
    .string()
    .min(1, "이름을 입력해 주세요.")
    .transform((s: string) => sanitizeText(s))
    .refine((s) => /^[가-힣\s]+$/.test(s), "이름은 한글만 입력할 수 있습니다.")
    .refine((s) => s.length <= 10, "이름은 10자 이내로 입력해 주세요."),
  guk_no: z.coerce
    .number()
    .int("소속국은 정수로 입력해 주세요.")
    .min(1, "소속국은 1~5 사이로 입력해 주세요.")
    .max(5, "소속국은 1~5 사이로 입력해 주세요."),
  birth_date: z
    .string()
    .min(1, "생년월일을 선택해 주세요.")
    .refine((val) => {
      const birth = parseDate(val);
      const cutoff = subtractYears(getNow(), 18);
      return birth <= cutoff;
    }, "청년들만 가입할 수 있습니다."),
  enneagram_type: z
    .string({ required_error: "에니어그램 유형을 선택해 주세요." })
    .min(1, "에니어그램 유형을 선택해 주세요.")
    .refine(
      (v: string) => /^[1-9]w[1-9]$/.test(v),
      { message: "에니어그램 유형을 선택해 주세요." },
    ),
});

export type SignupFormData = z.infer<typeof signupSchema>;
