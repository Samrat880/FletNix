import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShowsService } from '../../core/services/shows.service';
import { AuthService } from '../../core/services/auth.service';
import { Show } from '../../core/models/api.model';
import { showGradient, truncateText } from '../../shared/utils/show-visual.util';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detail.component.html',
})
export class DetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly showsService = inject(ShowsService);
  private readonly auth = inject(AuthService);

  show: Show | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid show id';
      this.loading = false;
      return;
    }

    this.showsService.getShowById(id).subscribe({
      next: (res) => {
        this.show = res.data;
        this.showsService.addRecentViewed(res.data);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Show not found';
        this.loading = false;
      },
    });
  }

  fields(): { label: string; value: string | number }[] {
    if (!this.show) return [];

    // Hero already shows type, rating, duration, year, country, and synopsis.
    return [
      { label: 'Director', value: this.show.director },
      { label: 'Cast', value: this.show.cast },
      { label: 'Listed In', value: this.show.listed_in },
      { label: 'Date Added', value: this.show.date_added },
      { label: 'Show ID', value: this.show.show_id },
    ].filter((field) => {
      if (field.value === null || field.value === undefined) return false;
      if (typeof field.value === 'string' && field.value.trim().length === 0) return false;
      return true;
    }) as { label: string; value: string | number }[];
  }

  heroGradient(): string {
    return showGradient(this.show?.title);
  }

  synopsis(): string {
    return truncateText(this.show?.description, 320);
  }

  userInitials(): string {
    return this.auth.getUserInitials();
  }

  logout(): void {
    this.auth.logout().subscribe();
  }

  scrollToDetails(): void {
    document.getElementById('show-details')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
