import Link from "next/link";

export default function StaticPageLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-fafafa py-10 px-4">
      <div className="max-w-[640px] mx-auto">
        <Link
          href="/"
          className="inline-block text-xs text-gray-400 hover:text-gray-600 mb-6"
        >
          ← 뒤로
        </Link>

        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{title}</h1>
          <p className="text-xs text-gray-400 mb-8">
            최종 수정일: {updatedAt}
          </p>

          <div className="space-y-8 text-sm text-gray-700 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
