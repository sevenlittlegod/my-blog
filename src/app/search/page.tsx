import { Suspense } from "react";
import { SearchContent } from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
