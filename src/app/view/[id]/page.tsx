import { getSpoiler } from "@/lib/redis";
import { notFound } from "next/navigation";
import SpoilerViewer from "@/components/SpoilerViewer";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewPage({ params }: PageProps) {
  const { id } = await params;
  const doc = await getSpoiler(id);

  if (!doc) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            NSpoiler
          </Link>
          <Link
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            自分も作る →
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* 警告 */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            ⚠️ ネタバレ注意
          </p>
          <p className="text-yellow-700 text-sm mt-1">
            この投稿にはネタバレが含まれています。伏字をタップすると内容が表示されます。
          </p>
        </div>

        {/* ビューワー */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <SpoilerViewer content={doc.content} spoilers={doc.spoilers} />
        </section>

        {/* フッター */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            自分もネタバレを伏字にする
          </Link>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;

  return {
    title: "ネタバレ注意！ - NSpoiler",
    description: "この投稿にはネタバレが含まれています。タップして内容を確認してください。",
    openGraph: {
      title: "ネタバレ注意！ - NSpoiler",
      description: "この投稿にはネタバレが含まれています。",
      url: `/view/${id}`,
    },
    twitter: {
      card: "summary",
      title: "ネタバレ注意！ - NSpoiler",
      description: "この投稿にはネタバレが含まれています。",
    },
  };
}
