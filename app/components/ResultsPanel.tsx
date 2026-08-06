import type { PlanAnalysis } from "@/lib/subscription/types";

interface ResultsPanelProps {
  analysis: PlanAnalysis | null;
  productName: string;
  error: string;
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00.000Z`));
}

export function ResultsPanel({
  analysis,
  productName,
  error,
}: ResultsPanelProps) {
  if (!analysis) {
    return (
      <aside className="preview-card empty-preview" aria-live="polite">
        <div className="preview-orbit" aria-hidden="true">
          <span>90</span>
          <small>days</small>
        </div>
        <p className="panel-kicker">Live preview</p>
        <h2>One check before you launch.</h2>
        <p>
          Launchpad checks the four details that commonly create confusing
          subscription experiences.
        </p>
        <ul className="check-list">
          <li><span>01</span> Pricing after discounts</li>
          <li><span>02</span> Free-shipping eligibility</li>
          <li><span>03</span> Billing and delivery timing</li>
          <li><span>04</span> Inventory for expected demand</li>
        </ul>
        {error ? <p className="form-error">{error}</p> : null}
      </aside>
    );
  }

  const errorCount = analysis.issues.filter(
    (issue) => issue.severity === "error",
  ).length;

  return (
    <aside className="preview-card result-preview" aria-live="polite">
      <div className="result-heading">
        <div>
          <p className="panel-kicker">90-day launch report</p>
          <h2>{productName}</h2>
        </div>
        <span
          className={analysis.readyToLaunch ? "status ready" : "status review"}
        >
          {analysis.readyToLaunch ? "Ready" : `${errorCount} change${errorCount === 1 ? "" : "s"}`}
        </span>
      </div>

      <div className="metric-grid">
        <div className="metric">
          <span>Subscriber price</span>
          <strong>{formatMoney(analysis.discountedPriceCents)}</strong>
        </div>
        <div className="metric">
          <span>Projected revenue</span>
          <strong>{formatMoney(analysis.projectedRevenueCents)}</strong>
        </div>
        <div className="metric">
          <span>Units required</span>
          <strong>{analysis.projectedUnits}</strong>
        </div>
      </div>

      <section className="report-section" aria-labelledby="findings-heading">
        <div className="section-heading">
          <h3 id="findings-heading">Plan findings</h3>
          <span>{analysis.issues.length}</span>
        </div>

        {analysis.issues.length ? (
          <div className="issue-list">
            {analysis.issues.map((issue) => (
              <article className={`issue ${issue.severity}`} key={issue.id}>
                <span className="issue-mark" aria-hidden="true">
                  {issue.severity === "error" ? "!" : "i"}
                </span>
                <div>
                  <h4>{issue.title}</h4>
                  <p>{issue.message}</p>
                  <small>{issue.suggestion}</small>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="all-clear">
            <span aria-hidden="true">✓</span>
            <div>
              <h4>No conflicts found</h4>
              <p>The plan passed all four launch checks.</p>
            </div>
          </div>
        )}
      </section>

      <section className="report-section" aria-labelledby="timeline-heading">
        <div className="section-heading">
          <h3 id="timeline-heading">Upcoming activity</h3>
          <span>First 6</span>
        </div>
        <ol className="timeline">
          {analysis.schedule.slice(0, 6).map((event, index) => (
            <li key={`${event.type}-${event.date}-${index}`}>
              <time dateTime={event.date}>{formatDate(event.date)}</time>
              <span className={`event-dot ${event.type}`} aria-hidden="true" />
              <div>
                <strong>{event.type === "billing" ? "Customer billing" : "Product delivery"}</strong>
                <small>
                  {event.type === "billing"
                    ? formatMoney(event.amountCents ?? 0)
                    : `${event.units ?? 0} units`}
                </small>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
