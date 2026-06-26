import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WatchlistService } from '../../core/services/watchlist.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Show } from '../../core/models/api.model';
import { ShowCardComponent } from '../../shared/show-card/show-card.component';

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ShowCardComponent],
  templateUrl: './watchlist.component.html',
})
export class WatchlistComponent implements OnInit {
  private readonly watchlist = inject(WatchlistService);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  items: Show[] = [];

  ngOnInit(): void {
    this.watchlist.watchlist$.subscribe((items) => {
      this.items = items;
    });
  }

  clearAll(): void {
    if (!this.items.length) return;
    this.watchlist.clear();
    this.toast.info('Watchlist cleared');
  }

  userInitials(): string {
    return this.auth.getUserInitials();
  }

  logout(): void {
    this.auth.logout().subscribe();
  }
}
