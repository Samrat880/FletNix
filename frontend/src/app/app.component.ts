import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-fletnix-ink text-white">
      <main class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
  `,
})
export class AppComponent {}
