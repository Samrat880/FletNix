import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ShowsService } from '../../core/services/shows.service';
import { Show, ShowFilterMeta } from '../../core/models/api.model';
import { ShowCardComponent } from '../../shared/show-card/show-card.component';
import { PaginationComponent } from '../../shared/pagination/pagination.component';
import { showGradient, truncateText } from '../../shared/utils/show-visual.util';
import { debounceTime, Subject } from 'rxjs';

type TypeFilter = 'All' | 'Movie' | 'TV Show';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ShowCardComponent, PaginationComponent],
  templateUrl: './browse.component.html',
})
export class BrowseComponent implements OnInit, OnDestroy {
  private readonly showsService = inject(ShowsService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  shows: Show[] = [];
  heroShows: Show[] = [];
  heroIndex = 0;
  heroPaused = false;

  page = 1;
  totalPages = 1;
  total = 0;
  typeFilter: TypeFilter = 'All';
  search = '';
  loading = false;
  error = '';

  sort = 'newest';

  countries: string[] = [];
  years: number[] = [];
  ratings: string[] = [];
  languages: string[] = [];

  selectedCountry = '';
  selectedYear: number | null = null;
  selectedRating = '';
  selectedLanguage = '';

  recentViewed: Show[] = [];

  readonly navItems: { label: string; action: 'browse' | 'movie' | 'tv' | 'newest' | 'rating' }[] = [
    { label: 'Browse', action: 'browse' },
    { label: 'Movies', action: 'movie' },
    { label: 'TV Shows', action: 'tv' },
    { label: 'Trending', action: 'newest' },
    { label: 'Top Rated', action: 'rating' },
  ];
  activeNav = 'Browse';
  mobileSidebarOpen = false;
  private readonly search$ = new Subject<string>();
  private heroTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.search$.pipe(debounceTime(350)).subscribe(() => {
      this.page = 1;
      this.load();
    });

    const typeParam = this.route.snapshot.queryParamMap.get('type');
    if (typeParam === 'Movie' || typeParam === 'TV Show') {
      this.typeFilter = typeParam;
      this.activeNav = typeParam === 'Movie' ? 'Movies' : 'TV Shows';
    }

    this.loadMeta();
    this.loadRecentViewed();
    this.loadHero();
    this.load();
  }

  refreshRecentViewed(): void {
    this.recentViewed = this.showsService.getRecentViewed();
  }

  ngOnDestroy(): void {
    this.stopHeroRotation();
  }

  private loadMeta(): void {
    this.showsService.getFilterMeta().subscribe({
      next: (res) => {
        const meta: ShowFilterMeta = res.data;
        this.countries = meta.countries;
        this.years = meta.years;
        this.ratings = meta.ratings;
        this.languages = meta.languages;
      },
    });
  }

  private loadRecentViewed(): void {
    this.recentViewed = this.showsService.getRecentViewed();
  }

  private loadHero(): void {
    this.showsService.getShows({ page: 1, limit: 5, sort: 'newest' }).subscribe({
      next: (res) => {
        this.heroShows = res.data.shows;
        this.heroIndex = 0;
        this.startHeroRotation();
      },
    });
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.showsService
      .getShows({
        page: this.page,
        limit: 15,
        type: this.typeFilter,
        search: this.search,
        country: this.selectedCountry,
        year: this.selectedYear,
        language: this.selectedLanguage,
        rating: this.selectedRating,
        sort: this.sort,
      })
      .subscribe({
        next: (res) => {
          this.shows = res.data.shows;
          this.total = res.data.total;
          this.totalPages = res.data.totalPages;
          this.page = res.data.page;
          this.loading = false;
          this.refreshRecentViewed();
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to load shows';
          this.loading = false;
        },
      });
  }

  onSearchChange(value: string): void {
    this.search = value;
    this.search$.next(value);
  }

  setType(type: TypeFilter): void {
    this.typeFilter = type;
    this.activeNav = type === 'All' ? 'Browse' : type === 'Movie' ? 'Movies' : 'TV Shows';
    this.page = 1;
    this.load();
  }

  setSort(value: string): void {
    this.sort = value;
    this.page = 1;
    this.load();
  }

  onNavClick(item: { label: string; action: 'browse' | 'movie' | 'tv' | 'newest' | 'rating' }): void {
    this.activeNav = item.label;
    this.mobileSidebarOpen = false;
    this.page = 1;
    this.search = '';

    if (item.action === 'browse') {
      this.typeFilter = 'All';
      this.sort = 'newest';
      this.clearFilters();
      return;
    }

    if (item.action === 'movie') {
      this.typeFilter = 'Movie';
      this.load();
      return;
    }

    if (item.action === 'tv') {
      this.typeFilter = 'TV Show';
      this.load();
      return;
    }

    this.typeFilter = 'All';
    this.sort = item.action === 'rating' ? 'rating' : 'newest';
    this.load();
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  applyFilters(): void {
    this.page = 1;
    this.load();
  }

  clearFilters(): void {
    this.selectedCountry = '';
    this.selectedYear = null;
    this.selectedRating = '';
    this.selectedLanguage = '';
    this.page = 1;
    this.load();
  }

  onPageChange(p: number): void {
    this.page = p;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout(): void {
    this.auth.logout().subscribe();
  }

  userInitials(): string {
    return this.auth.getUserInitials();
  }

  userName(): string {
    return this.auth.getUserName();
  }

  userAge(): number | null {
    return this.auth.getUserAge();
  }

  activeHero(): Show | null {
    if (!this.heroShows.length) return null;
    return this.heroShows[this.heroIndex] ?? this.heroShows[0];
  }

  heroGradient(show: Show | null): string {
    return showGradient(show?.title);
  }

  heroDescription(show: Show | null): string {
    if (!show) return 'Stream top trending titles curated for you this week.';
    return truncateText(show.description, 200) || 'Stream top trending titles curated for you this week.';
  }

  setHeroIndex(index: number): void {
    if (!this.heroShows.length) return;
    this.heroIndex = ((index % this.heroShows.length) + this.heroShows.length) % this.heroShows.length;
  }

  nextHero(): void {
    this.setHeroIndex(this.heroIndex + 1);
  }

  prevHero(): void {
    this.setHeroIndex(this.heroIndex - 1);
  }

  pauseHero(): void {
    this.heroPaused = true;
    this.stopHeroRotation();
  }

  resumeHero(): void {
    this.heroPaused = false;
    this.startHeroRotation();
  }

  private startHeroRotation(): void {
    this.stopHeroRotation();
    if (this.heroPaused || this.heroShows.length <= 1) return;

    this.heroTimer = setInterval(() => {
      this.nextHero();
    }, 6000);
  }

  private stopHeroRotation(): void {
    if (this.heroTimer) {
      clearInterval(this.heroTimer);
      this.heroTimer = null;
    }
  }
}
