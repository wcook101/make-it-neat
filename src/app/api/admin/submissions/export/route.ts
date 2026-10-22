import { assertAdmin } from "@/server/admin/guard";
import { listSubmissions, submissionsToCsv } from "@/server/admin/records";
import { addDays, todayIso } from "@/server/admin/validate";
import { getDb } from "@/server/db/index";

export async function GET(request: Request) {
  const denied = await assertAdmin(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const today = todayIso();
  const rows = await listSubmissions(await getDb(), {
    search: url.searchParams.get("q") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
    outletId: url.searchParams.get("outlet") ?? undefined,
    due: url.searchParams.get("due") ?? undefined,
    sort: url.searchParams.get("sort") ?? "updated_at",
    dir: url.searchParams.get("dir") ?? "desc",
    today,
    until: addDays(today, 14),
  });
  return new Response(submissionsToCsv(rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=\"make-it-neat-submissions.csv\"",
      "cache-control": "no-store",
    },
  });
}
