import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal
} from "@angular/core";
import type { SubscriptionPlan } from "../../../lib/subscription/types";

type TextField = "productName" | "startDate";
type NumberField = Exclude<keyof SubscriptionPlan, TextField>;

@Component({
  selector: "app-plan-builder",
  templateUrl: "./plan-builder.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanBuilderComponent {
  @Input({ required: true }) plan!: SubscriptionPlan;
  @Input() loading = false;
  @Output() readonly planChange = new EventEmitter<SubscriptionPlan>();
  @Output() readonly analyze = new EventEmitter<void>();

  readonly steps = ["Offer", "Schedule", "Readiness"];
  readonly step = signal(0);

  setStep(step: number): void {
    this.step.set(step);
  }

  previousStep(): void {
    this.step.update((step) => Math.max(0, step - 1));
  }

  submit(): void {
    if (this.step() < this.steps.length - 1) {
      this.step.update((step) => step + 1);
      return;
    }
    this.analyze.emit();
  }

  updateText(field: TextField, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.planChange.emit({ ...this.plan, [field]: value });
  }

  updateNumber(field: NumberField, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.planChange.emit({ ...this.plan, [field]: value });
  }

  updateMoney(field: "priceCents" | "freeShippingThresholdCents", event: Event): void {
    const value = Math.round(Number((event.target as HTMLInputElement).value) * 100);
    this.planChange.emit({ ...this.plan, [field]: value });
  }
}
