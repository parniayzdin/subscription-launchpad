import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from "@angular/core";
import type { SavedPlan } from "../../lib/plans/types";
import type { PlanAnalysis, SubscriptionPlan } from "../../lib/subscription/types";
import { samplePlan } from "../../lib/subscription/types";
import { PlanBuilderComponent } from "./components/plan-builder.component";
import { ResultsPanelComponent } from "./components/results-panel.component";
import { SavedPlansComponent } from "./components/saved-plans.component";

@Component({
  selector: "app-root",
  imports: [PlanBuilderComponent, ResultsPanelComponent, SavedPlansComponent],
  templateUrl: "./app.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);

  readonly plan = signal<SubscriptionPlan>({ ...samplePlan });
  readonly analysis = signal<PlanAnalysis | null>(null);
  readonly error = signal("");
  readonly loading = signal(false);
  readonly savedPlans = signal<SavedPlan[]>([]);
  readonly loadingSavedPlans = signal(true);
  readonly storageAvailable = signal(true);
  readonly saving = signal(false);
  readonly saveMessage = signal("");

  ngOnInit(): void {
    this.loadSavedPlans();
  }

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

  saveCurrentPlan(): void {
    if (!this.analysis()) {
      return;
    }

    this.saving.set(true);
    this.saveMessage.set("");
    this.http.post<SavedPlan>("/api/plans", this.plan()).subscribe({
      next: (saved) => {
        this.savedPlans.update((plans) => [saved, ...plans].slice(0, 8));
        this.saveMessage.set("Plan saved. You can reopen it below.");
        this.saving.set(false);
      },
      error: () => {
        this.saveMessage.set("The plan could not be saved.");
        this.saving.set(false);
      }
    });
  }

  openSavedPlan(saved: SavedPlan): void {
    this.plan.set({ ...saved.plan });
    this.analysis.set(saved.analysis);
    this.error.set("");
    this.saveMessage.set("Saved plan opened.");
  }

  private loadSavedPlans(): void {
    this.http.get<{ plans: SavedPlan[] }>("/api/plans").subscribe({
      next: ({ plans }) => {
        this.savedPlans.set(plans);
        this.loadingSavedPlans.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.storageAvailable.set(error.status !== 503);
        this.loadingSavedPlans.set(false);
      }
    });
  }
}
