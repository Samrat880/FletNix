import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoginData, User } from '../models/api.model';

const TOKEN_KEY = 'fletnix_access_token';
const USER_KEY = 'fletnix_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = `${environment.apiUrl}/auth`;

  register(body: {
    email: string;
    password: string;
    age: number;
    name?: string;
  }): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(`${this.base}/register`, body);
  }

  login(email: string, password: string): Observable<ApiResponse<LoginData>> {
    return this.http
      .post<ApiResponse<LoginData>>(`${this.base}/login`, { email, password }, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => {
          this.setToken(res.data.accessToken);
          this.setUser(res.data.user);
        }),
      );
  }

  savePreferences(genres: string[]): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.base}/preferences`, { genres }).pipe(
      tap((res) => this.setUser(res.data)),
    );
  }

  hasCompletedPreferences(): boolean {
    return this.getUser()?.preferencesCompleted === true;
  }

  logout(): Observable<ApiResponse<unknown>> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.base}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearToken();
          this.clearUser();
          this.router.navigate(['/login']);
        }),
      );
  }

  refresh(): Observable<ApiResponse<{ accessToken: string }>> {
    return this.http
      .post<ApiResponse<{ accessToken: string }>>(
        `${this.base}/refresh-token`,
        {},
        { withCredentials: true },
      )
      .pipe(tap((res) => this.setToken(res.data.accessToken)));
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearUser(): void {
    localStorage.removeItem(USER_KEY);
  }

  getUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getUserAge(): number | null {
    const user = this.getUser();
    if (user?.age) return user.age;

    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.age ?? null;
    } catch {
      return null;
    }
  }

  getUserName(): string {
    const user = this.getUser();
    if (user?.name?.trim()) return user.name.trim();
    const email = user?.email || this.getUserEmail();
    if (!email) return 'User';
    return email.split('@')[0];
  }

  getUserInitials(): string {
    const name = this.getUserName();
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getFavoriteGenres(): string[] {
    return this.getUser()?.favoriteGenres || [];
  }

  getUserEmail(): string | null {
    const user = this.getUser();
    if (user?.email) return user.email;

    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email ?? null;
    } catch {
      return null;
    }
  }
}
