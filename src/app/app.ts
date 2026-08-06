import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-root",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<main><h1>Subscription Launchpad</h1></main>`
})
export class App {}
