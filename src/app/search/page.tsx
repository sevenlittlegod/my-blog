import { Suspense } from "react";
import { SearchContent } from "./SearchContent";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-sm text-stone-500">正在加载搜索...</div>}>
      <SearchContent />
    </Suspense>
  );
}
