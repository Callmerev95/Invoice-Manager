import { Suspense } from "react";
import { Bell } from "lucide-react";
import { OverdueBell } from "./overdue-bell";
import { getOverdueItems } from "@/lib/overdue";

async function OverdueBellData() {
  const items = await getOverdueItems();
  return <OverdueBell items={items} />;
}

function OverdueBellFallback() {
  return (
    <span
      aria-hidden
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-2 text-ink-faint"
    >
      <Bell className="h-5 w-5" />
    </span>
  );
}

export function OverdueBellSlot() {
  return (
    <Suspense fallback={<OverdueBellFallback />}>
      <OverdueBellData />
    </Suspense>
  );
}
