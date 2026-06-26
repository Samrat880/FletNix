import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Show } from '../../core/models/api.model';
import { WatchlistService } from '../../core/services/watchlist.service';
import { ToastService } from '../../core/services/toast.service';
import { ratingTone, showGradient } from '../utils/show-visual.util';

@Component({
  selector: 'app-show-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './show-card.component.html',
})
export class ShowCardComponent {
  @Input({ required: true }) show!: Show;

  private readonly watchlist = inject(WatchlistService);
  private readonly toast = inject(ToastService);

  gradientClasses(): string {
    return showGradient(this.show.title);
  }

  ratingClasses(): string {
    return ratingTone(this.show.rating);
  }

  isSaved(): boolean {
    return this.watchlist.isSaved(this.show._id);
  }

  toggleWatchlist(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const added = this.watchlist.toggle(this.show);
    if (added) {
      this.toast.success(`Added "${this.show.title}" to your watchlist`);
    } else {
      this.toast.info(`Removed "${this.show.title}" from your watchlist`);
    }
  }
}
