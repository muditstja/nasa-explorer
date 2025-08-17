import { useQuery } from "@tanstack/react-query";
import { fetchDonki } from "../lib/api";

export default function Donki() {
  const q = useQuery({
    queryKey: ["donki"],
    queryFn: async () => await fetchDonki(),
  });
  return (
    <section className="card">
      <h3 style={{ margin: 0 }}>DONKI Alerts</h3>
      <p className="sub">
        Space Weather Database Of Notifications, Knowledge, Information of last 7 days (DONKI)
      </p>
      {q.isLoading && <div className="skeleton" style={{ height: 180 }} />}
      {q.isError && <div className="muted">Failed to load.</div>}
      <div className="grid g2">
        {(q.data || []).slice(0, 6).map((n: any) => (
          <div key={n.messageID} className="card" style={{ padding: 12 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span className="muted" style={{ fontSize: 12 }}>
                {new Date(n.messageIssueTime).toLocaleString()}
              </span>
              {n.messageURL && (
                <a
                  className="muted"
                  style={{ fontSize: 12 }}
                  href={n.messageURL}
                  target="_blank"
                >
                  Source ↗
                </a>
              )}
            </div>
            <strong>{n.messageType}</strong>
            <p className="muted">{(n.messageBody || "").slice(0, 160)}…</p>
          </div>
        ))}
      </div>
    </section>
  );
}
