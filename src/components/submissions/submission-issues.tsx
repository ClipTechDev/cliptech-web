import { AlertTriangle } from "lucide-react";

import { humanise } from "@/lib/format";
import { issueCopy, type SubmissionIssue } from "@/schemas/submission";

type Entry = { key: string; title: string; fix: string };

function entries(issues: SubmissionIssue[], invalidReason?: string | null): Entry[] {
  const list = issues.map((issue) => ({ key: issue.code, ...issueCopy(issue) }));

  if (invalidReason) {
    list.push({
      key: invalidReason,
      title: `Stopped earning: ${humanise(invalidReason).toLowerCase()}`,
      fix: "Fix it on the platform, or reconnect the account on the Profile tab, then re-check.",
    });
  }

  return list;
}

export function SubmissionIssues({
  issues,
  invalidReason,
  heading = "This clip isn't being tracked",
  children,
}: {
  issues: SubmissionIssue[];
  invalidReason?: string | null;
  heading?: string;
  children?: React.ReactNode;
}) {
  const list = entries(issues, invalidReason);
  if (list.length === 0) return null;

  return (
    <div className="space-y-inline p-card rounded-xl border border-destructive/30 bg-destructive/5">
      <p className="gap-tight flex items-center text-sm font-medium">
        <AlertTriangle className="size-4 shrink-0 text-destructive" />
        {heading}
      </p>

      <ul className="space-y-tight">
        {list.map((entry) => (
          <li key={entry.key} className="space-y-0.5">
            <p className="text-sm font-medium">{entry.title}</p>
            <p className="text-sm text-muted-foreground">{entry.fix}</p>
          </li>
        ))}
      </ul>

      {children}
    </div>
  );
}
