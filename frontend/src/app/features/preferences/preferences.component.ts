import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ShowsService } from '../../core/services/shows.service';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preferences.component.html',
})
export class PreferencesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly showsService = inject(ShowsService);
  private readonly router = inject(Router);

  genres: string[] = [];
  selected = new Set<string>();
  loading = false;
  saving = false;
  error = '';

  ngOnInit(): void {
    if (this.auth.hasCompletedPreferences()) {
      this.router.navigate(['/browse']);
      return;
    }

    this.loading = true;
    this.showsService.getFilterMeta().subscribe({
      next: (res) => {
        this.genres = res.data.genres || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load genres. Please try again.';
        this.loading = false;
      },
    });
  }

  toggleGenre(genre: string): void {
    if (this.selected.has(genre)) {
      this.selected.delete(genre);
    } else if (this.selected.size < 10) {
      this.selected.add(genre);
    }
  }

  isSelected(genre: string): boolean {
    return this.selected.has(genre);
  }

  submit(): void {
    if (this.selected.size === 0) return;

    this.saving = true;
    this.error = '';
    const genres = Array.from(this.selected);

    this.auth.savePreferences(genres).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/browse']);
      },
      error: (err) => {
        this.saving = false;
        this.error = err.error?.message || 'Could not save preferences';
      },
    });
  }
}
