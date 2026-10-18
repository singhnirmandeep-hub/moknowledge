import Link from "next/link";
import type { KnowledgeBase } from "@/types/knowledge";

// Turns an ISO date like "2026-10-17T00:01:12.478Z" into "Oct 17, 2026"
function formatDate(iso: string): string {
  const date = new Date(iso);
  return isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function RecordTable({ records }: { records: KnowledgeBase[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Website</th>
            <th className="px-4 py-3 text-right">Offerings</th>
            <th className="px-4 py-3 text-right">People</th>
            <th className="px-4 py-3 text-right">FAQs</th>
            <th className="px-4 py-3 text-right">Social links</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {records.map((kb) => (
            <tr key={kb.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">
                <Link href={`/knowledge/view/${kb.id}`} className="text-blue-600 hover:underline">
                  {kb.foundation.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-600">{kb.foundation.website}</td>
              <td className="px-4 py-3 text-right">{kb.offerings.length}</td>
              <td className="px-4 py-3 text-right">{kb.keyPeople.length}</td>
              <td className="px-4 py-3 text-right">{kb.content.faqs.length}</td>
              <td className="px-4 py-3 text-right">{Object.keys(kb.online.socialLinks).length}</td>
              <td className="px-4 py-3 text-gray-600">{formatDate(kb.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}