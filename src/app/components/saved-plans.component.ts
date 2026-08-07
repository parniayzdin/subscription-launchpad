import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import type { SavedPlan } from "../../../lib/plans/types";

@Component({
  selector: "app-saved-plans",
  templateUrl: "./saved-plans.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavedPlansComponent {
  @Input() plans: SavedPlan[] = [];
  @Input() loading = false;
  @Input() storageAvailable = true;
  @Output() readonly openPlan = new EventEmitter<SavedPlan>();

  formatDate(value: string): string {
    return new Intl.DateTimeFormat("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(value));
  }
}
