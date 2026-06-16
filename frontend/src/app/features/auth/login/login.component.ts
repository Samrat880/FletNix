import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  error = '';
  success = '';
  loading = false;
  showPassword = false;

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('registered') === '1') {
      this.success = 'Account created. Sign in with your email and password.';
    }
  }

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        this.loading = false;
        const destination = res.data.user.preferencesCompleted ? '/browse' : '/preferences';
        this.router.navigate([destination]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed';
      },
    });
  }
}
