import StaticPageLayout from "../components/StaticPageLayout";

export default function TermsPage() {
  return (
    <StaticPageLayout title="이용약관" updatedAt="2026년 3월 31일">
      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          1. 서비스 소개
        </h2>
        <p>
          OQ1(이하 &quot;서비스&quot;)은 매일 성경 QT(Quiet Time) 묵상을
          기록하고 공유하는 커뮤니티 플랫폼입니다. 사용자는 묵상 내용을 작성하고,
          다른 사용자의 묵상에 좋아요와 댓글을 남길 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          2. 회원 가입 및 탈퇴
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            카카오 또는 Apple 계정을 통해 가입할 수 있으며, 가입 시 이름,
            생년월일, 소속국, 에니어그램 유형을 입력해야 합니다.
          </li>
          <li>만 18세 이상만 가입할 수 있습니다.</li>
          <li>
            회원 탈퇴는 마이페이지에서 직접 진행할 수 있으며, 탈퇴 후 30일간
            계정 복구가 가능합니다.
          </li>
          <li>
            30일 경과 후 모든 데이터는 영구적으로 삭제되며 복구할 수 없습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          3. 금지 행위
        </h2>
        <p className="mb-2">
          사용자는 서비스 이용 시 다음 행위를 해서는 안 됩니다.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>타인을 사칭하거나 허위 정보를 등록하는 행위</li>
          <li>욕설, 비방, 혐오 표현 등 부적절한 콘텐츠를 게시하는 행위</li>
          <li>스팸, 광고, 홍보 목적의 콘텐츠를 반복 게시하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>타인의 개인정보를 무단으로 수집하거나 유포하는 행위</li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          4. 콘텐츠 권리
        </h2>
        <p>
          사용자가 작성한 QT 묵상, 댓글 등의 콘텐츠에 대한 저작권은 작성자에게
          있습니다. 다만 서비스 내 표시 및 커뮤니티 기능 제공을 위해 필요한
          범위에서 이용을 허락한 것으로 봅니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          5. 서비스 변경 및 중단
        </h2>
        <p>
          운영자는 서비스의 전부 또는 일부를 사전 공지 후 변경하거나 중단할 수
          있습니다. 긴급한 시스템 점검, 장애 대응 등 불가피한 사유가 있는 경우
          사전 공지 없이 서비스를 일시 중단할 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          6. 면책조항
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            사용자 간 분쟁에 대해 운영자는 개입하지 않으며 책임을 지지 않습니다.
          </li>
          <li>
            사용자가 게시한 콘텐츠의 정확성, 신뢰성에 대해 운영자는 보증하지
            않습니다.
          </li>
          <li>
            천재지변, 시스템 장애 등 불가항력으로 인한 서비스 중단에 대해 책임을
            지지 않습니다.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          7. 약관 변경
        </h2>
        <p>
          본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지를 통해
          안내합니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고
          회원 탈퇴할 수 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          8. 문의
        </h2>
        <p>
          이용약관 관련 문의:{" "}
          <span className="font-medium text-gray-900">contact@oq1.app</span>
        </p>
      </section>
    </StaticPageLayout>
  );
}
