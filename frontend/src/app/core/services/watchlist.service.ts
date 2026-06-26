import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Show } from '../models/api.model';
import { AuthService } from './auth.service';

const WATCHLIST_PREFIX = 'fletnix_watchlist';
const MAX_ITEMS = 50;

@Injectable({ providedIn: 'root' })
export class WatchlistService {
  private readonly auth = inject(AuthService);
  private readonly items$ = new BehaviorSubject<Show[]>(this.read());

  readonly watchlist$ = this.items$.asObservable();

  getItems(): Show[] {
    return this.items$.value;
  }

  count(): number {
    return this.items$.value.length;
  }

  isSaved(showId: string): boolean {
    return this.items$.value.some((s) => s._id === showId);
  }

  toggle(show: Show): boolean {
    if (this.isSaved(show._id)) {
      this.remove(show._id);
      return false;
    }
    this.add(show);
    return true;
  }

  add(show: Show): void {
    if (this.isSaved(show._id)) return;

    const next = [show, ...this.items$.value].slice(0, MAX_ITEMS);
    this.persist(next);
  }

  remove(showId: string): void {
    const next = this.items$.value.filter((s) => s._id !== showId);
    this.persist(next);
  }

  clear(): void {
    this.persist([]);
  }

  private persist(items: Show[]): void {
    localStorage.setItem(this.storageKey(), JSON.stringify(items));
    this.items$.next(items);
  }

  private read(): Show[] {
    try {
      const raw = localStorage.getItem(this.storageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Show[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private storageKey(): string {
    const userId = this.auth.getUser()?._id ?? 'guest';
    return `${WATCHLIST_PREFIX}_${userId}`;
  }
}
