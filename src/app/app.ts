import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import type { PlanAnalysis, SubscriptionPlan } from "../../lib/subscription/types";
import { samplePlan } from "../../lib/subscription/types";
import { PlanBuilderComponent } from "./components/plan-builder.component";
import { ResultsPanelComponent } from "./components/results-panel.component";

@Component({
  selector: "app-root",
  imports: [PlanBuilderComponent, ResultsPanelComponent],
  templateUrl: "./app.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App {
  private readonly http = inject(HttpClient);

  readonly plan = signal<SubscriptionPlan>({ ...samplePlan });
  readonly analysis = signal<PlanAnalysis | null>(null);
  readonly error = signal("");
  readonly loading = signal(false);

  updatePlan(plan: SubscriptionPlan): void {
    this.plan.set(plan);
    this.analysis.set(null);
  }

  runAnalysis(): void {
    this.loading.set(true);
    this.error.set("");

    this.http.post<PlanAnalysis>("/api/analyze", this.plan()).subscribe({
      next: (analysis) => {
        this.analysis.set(analysis);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        const message =
          typeof error.error?.message === "string"
            ? error.error.message
            : "The preview could not be created.";
        this.error.set(message);
        this.loading.set(false);
      }
    });
  }
}
