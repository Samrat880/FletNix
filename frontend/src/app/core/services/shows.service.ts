import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Show, ShowFilterMeta, ShowsPage } from '../models/api.model';

const RECENT_KEY = 'fletnix_recent_viewed';

@Injectable({ providedIn: 'root' })
export class ShowsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/shows`;

  getShows(options: {
    page?: number;
    limit?: number;
    type?: string;
    search?: string;
    country?: string;
    year?: number | null;
    language?: string;
    rating?: string;
    sort?: string;
  }): Observable<ApiResponse<ShowsPage>> {
    let params = new HttpParams();
    if (options.page) params = params.set('page', options.page);
    if (options.limit) params = params.set('limit', options.limit);
    if (options.type && options.type !== 'All') params = params.set('type', options.type);
    if (options.search?.trim()) params = params.set('search', options.search.trim());
    if (options.country?.trim()) params = params.set('country', options.country.trim());
    if (options.year) params = params.set('year', options.year);
    if (options.language?.trim()) params = params.set('language', options.language.trim());
    if (options.rating?.trim()) params = params.set('rating', options.rating.trim());
    if (options.sort?.trim()) params = params.set('sort', options.sort.trim());

    return this.http.get<ApiResponse<ShowsPage>>(this.base, { params });
  }

  getFilterMeta(): Observable<ApiResponse<ShowFilterMeta>> {
    return this.http.get<ApiResponse<ShowFilterMeta>>(`${this.base}/meta`);
  }

  getShowById(id: string): Observable<ApiResponse<Show>> {
    return this.http.get<ApiResponse<Show>>(`${this.base}/${id}`);
  }

  getRecentViewed(): Show[] {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Show[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  addRecentViewed(show: Show): void {
    const recent = this.getRecentViewed().filter((s) => s._id !== show._id);
    recent.unshift(show);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 6)));
  }
}
