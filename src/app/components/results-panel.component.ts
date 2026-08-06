import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import type { PlanAnalysis } from "../../../lib/subscription/types";

@Component({
  selector: "app-results-panel",
  templateUrl: "./results-panel.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsPanelComponent {
  @Input() analysis: PlanAnalysis | null = null;
  @Input() productName = "";
  @Input() error = "";

  formatMoney(cents: number): string {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0
    }).format(cents / 100);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-CA", {
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    }).format(new Date(`${value}T00:00:00.000Z`));
  }

  errorCount(analysis: PlanAnalysis): number {
    return analysis.issues.filter((issue) => issue.severity === "error").length;
  }
}
