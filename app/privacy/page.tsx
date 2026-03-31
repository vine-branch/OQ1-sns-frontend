import StaticPageLayout from "../components/StaticPageLayout";

export default function PrivacyPage() {
  return (
    <StaticPageLayout title="개인정보 처리방침" updatedAt="2026년 3월 31일">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          1. 수집하는 개인정보
        </h2>
        <p className="mb-2">
          OQ1은 서비스 제공을 위해 다음 정보를 수집합니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>이름 (한글, 10자 이내)</li>
          <li>생년월일</li>
          <li>청년부 소속국 (1~5)</li>
          <li>에니어그램 유형</li>
          <li>카카오/Apple 계정 프로필 사진 (소셜 로그인 시 자동 수집)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          2. 수집 목적
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>서비스 회원 식별 및 인증</li>
          <li>QT 묵상 공유 커뮤니티 기능 제공</li>
          <li>프로필 표시 및 사용자 간 소통 지원</li>
          <li>서비스 이용 통계 및 개선</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          3. 보관 및 파기
        </h2>
        <p>
          회원 탈퇴 요청 시 30일의 유예기간을 두며, 유예기간 내 복구하지 않을
          경우 모든 개인정보를 영구적으로 삭제합니다. 삭제 대상에는 프로필 정보,
          QT 묵상 기록, 좋아요, 댓글, 활동 기록이 포함됩니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          4. 제3자 제공
        </h2>
        <p>
          OQ1은 수집한 개인정보를 제3자에게 제공하지 않습니다. 다만 소셜
          로그인(카카오, Apple) 과정에서 해당 플랫폼의 개인정보 처리방침이 별도로
          적용됩니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          5. 이용자의 권리
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>프로필 정보는 마이페이지에서 언제든 수정할 수 있습니다.</li>
          <li>
            회원 탈퇴는 마이페이지 &gt; 프로필 편집에서 직접 진행할 수 있습니다.
          </li>
          <li>
            개인정보 관련 문의는 아래 연락처로 요청할 수 있습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          6. 연락처
        </h2>
        <p>
          개인정보 관련 문의:{" "}
          <span className="font-medium text-gray-900">contact@oq1.app</span>
        </p>
      </section>
    </StaticPageLayout>
  );
}
