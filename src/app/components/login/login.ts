import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page-container">
      <!-- Left Column: Government Platform Branding -->
      <div class="login-left-panel">
        <div class="brand-box">
          <div class="emblem-circle">
            <i class="fa-solid fa-wheat-awn"></i>
          </div>
          <div class="brand-titles">
            <h1 class="brand-app-name">🌾 MandiConnect <span class="ai-pill">AI</span></h1>
            <p class="brand-tagline">Crop Price Prediction & Mandi Connect Platform</p>
          </div>
        </div>

        <div class="sih-details-card">
          <div class>

            <span></span>
          </div>
          <h3>Crop Price Prediction, Mandi Scheduling & Farmer Status Intelligence</h3>
          <p class="problem-code">College Final Project • <strong>BY FEEL THE DIFFERENCE</strong></p>
          <p class="ministry-name">Prototype built with Angular and Spring Boot architecture</p>
        </div>

        <div class="demo-environment-tag">
          <span class="pulse-dot">●</span>
          <span>DEMO BY • BY TAPAS,CHANDAN,ROSHON,OM</span>
        </div>

        <div class="left-footer-text">
          Decision-support platform for crop prices, mandi queues and farmer arrivals
        </div>
      </div>

      <!-- Right Column: Government Authentication Form -->
      <div class="login-right-panel">
        <div class="login-card">
          <div class="login-card-header">
            <span class="gov-role-badge">
              <i class="fa-solid fa-user-shield"></i> Government Administrator
            </span>
            <h2>Sign in to Government Portal</h2>
<!--            <p class="login-sub">Enter your authorized government officer credentials to access the master portal.</p>-->
          </div>

          <!-- Error Alert Banner -->
          <div *ngIf="errorMessage" class="error-banner">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Sign in Form -->
          <form (ngSubmit)="onLogin()" class="login-form">
            <div class="form-group">
              <label for="usernameInput">Email / Government ID</label>
              <div class="input-wrapper">
                <i class="fa-solid fa-id-card input-icon"></i>
                <input
                  id="usernameInput"
                  type="text"
                  [(ngModel)]="username"
                  name="username"
                  required
                  placeholder="e.g. govadmin"
                  [disabled]="isLoading"
                />
              </div>
            </div>

            <div class="form-group">
              <label for="passwordInput">Password</label>
              <div class="input-wrapper">
                <i class="fa-solid fa-lock input-icon"></i>
                <input
                  id="passwordInput"
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="Enter password"
                  [disabled]="isLoading"
                />
                <button
                  type="button"
                  class="toggle-pwd-btn"
                  (click)="showPassword = !showPassword"
                  title="Toggle Password Visibility"
                >
                  <i class="fa-solid" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>
                </button>
              </div>
            </div>

            <div class="form-row-between">
              <label class="remember-me">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                <span>Remember me</span>
              </label>

              <a href="javascript:void(0)" class="forgot-link" (click)="showForgotDemoMsg()">Forgot password?</a>
            </div>

            <button type="submit" class="btn-submit" [disabled]="isLoading">
              <span *ngIf="!isLoading">
                <i class="fa-solid fa-right-to-bracket"></i> SIGN IN TO PORTAL
              </span>
              <span *ngIf="isLoading" class="loading-state">
                <i class="fa-solid fa-spinner fa-spin"></i> Authenticating Officer...
              </span>
            </button>
          </form>

          <!-- Prototype Credentials Card -->
          <div class="demo-credentials-card">
            <div class="demo-cred-head">
              <i class="fa-solid fa-key text-gold"></i>
              <strong>Demo Credentials</strong>
            </div>
            <div class="cred-rows">
              <div class="cred-row">
                <span class="lbl">Government ID:</span>
                <code>govadmin</code>
<!--                <button type="button" class="copy-btn" (click)="fillDemoCredentials()"></button>-->
              </div>
              <div class="cred-row">
                <span class="lbl">Password:</span>
                <code>Agri&#64;2026</code>
              </div>
            </div>
          </div>

          <!-- Disclaimer Footnote -->
<!--          <div class="proto-disclaimer">-->
<!--            <i class="fa-solid fa-shield-halved"></i>-->

<!--          </div>-->

        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page-container {
      display: flex;
      min-height: 100vh;
      width: 100vw;
      background-color: #f4f7f5;
    }

    /* Left Panel Styling */
    .login-left-panel {
      flex: 1.1;
      background: linear-gradient(145deg, #1B2A32, #0D5C3A);
      color: #ffffff;
      padding: 60px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    .brand-box {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .emblem-circle {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #E5A93C, #0D5C3A);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(13, 92, 58, 0.4);
    }

    .brand-app-name {
      font-family: 'Outfit', sans-serif;
      font-size: 2.1rem;
      font-weight: 800;
      color: #ffffff;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ai-pill {
      background: linear-gradient(135deg, #E5A93C, #D97706);
      font-size: 0.85rem;
      padding: 2px 8px;
      border-radius: 6px;
      color: #ffffff;
    }

    .brand-tagline {
      font-size: 0.95rem;
      color: #CBD5E1;
      margin-top: 2px;
    }

    .sih-details-card {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 32px;
      border-radius: 20px;
      margin: 40px 0;
    }

    .sih-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(229, 169, 60, 0.2);
      border: 1px solid rgba(229, 169, 60, 0.4);
      color: #E5A93C;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .sih-details-card h3 {
      font-size: 1.35rem;
      color: #ffffff;
      line-height: 1.3;
      margin-bottom: 12px;
    }

    .problem-code {
      font-size: 0.9rem;
      color: #E5A93C;
    }

    .ministry-name {
      font-size: 0.825rem;
      color: #94A3B8;
      margin-top: 6px;
    }

    .demo-environment-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #FCA5A5;
      padding: 8px 16px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 700;
      width: fit-content;
    }

    .pulse-dot {
      color: #EF4444;
      font-size: 0.9rem;
      animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .left-footer-text {
      font-size: 0.775rem;
      color: #94A3B8;
    }

    /* Right Panel Styling */
    .login-right-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
    }

    .login-card {
      background: #ffffff;
      border: 1px solid var(--border-card);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 40px rgba(27, 42, 50, 0.08);
    }

    .login-card-header {
      margin-bottom: 24px;
    }

    .gov-role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-50);
      color: var(--primary-700);
      padding: 5px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      margin-bottom: 12px;
    }

    .login-card-header h2 {
      font-size: 1.6rem;
      color: var(--slate-900);
    }

    .login-sub {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 4px;
    }

    .error-banner {
      background: #FEE2E2;
      border: 1px solid #EF4444;
      color: #DC2626;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--slate-900);
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      color: #94A3B8;
      font-size: 0.95rem;
    }

    .input-wrapper input {
      width: 100%;
      padding: 12px 14px 12px 42px;
      border: 1px solid var(--border-light);
      border-radius: 10px;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.2s ease;
      background: #F8FAF9;
    }

    .input-wrapper input:focus {
      background: #ffffff;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(13, 92, 58, 0.12);
    }

    .toggle-pwd-btn {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #64748B;
      cursor: pointer;
      font-size: 0.95rem;
    }

    .form-row-between {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.825rem;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: var(--text-main);
    }

    .forgot-link {
      color: var(--primary-700);
      font-weight: 600;
      text-decoration: none;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    .btn-submit {
      background: var(--primary-700);
      color: #ffffff;
      border: none;
      padding: 14px;
      border-radius: 12px;
      font-size: 0.925rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 6px;
    }

    .btn-submit:hover:not(:disabled) {
      background: var(--primary-800);
      box-shadow: 0 4px 12px rgba(13, 92, 58, 0.3);
    }

    .btn-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .demo-credentials-card {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      border-radius: 12px;
      padding: 14px 16px;
      margin-top: 24px;
      color: #92400E;
    }

    .demo-cred-head {
      font-size: 0.825rem;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .cred-rows {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 0.8rem;
    }

    .cred-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .cred-row code {
      background: #ffffff;
      padding: 2px 8px;
      border-radius: 4px;
      font-weight: 800;
      color: #B45309;
    }

    .copy-btn {
      background: #ffffff;
      border: 1px solid #F59E0B;
      color: #B45309;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      cursor: pointer;
      margin-left: auto;
    }

    .cred-sub {
      font-size: 0.725rem;
    }

    .proto-disclaimer {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.725rem;
      color: var(--text-muted);
      margin-top: 18px;
      padding-top: 12px;
      border-top: 1px solid var(--border-light);
    }

    @media (max-width: 992px) {
      .login-left-panel {
        display: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  username: string = 'govadmin';
  password: string = 'Agri@2026';
  showPassword: boolean = false;
  rememberMe: boolean = true;
  isLoading: boolean = false;
  errorMessage: string = '';
  returnUrl: string = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.authService.isLoggedIn()) {
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  fillDemoCredentials() {
    this.username = 'govadmin';
    this.password = 'Agri@2026';
  }

  showForgotDemoMsg() {
    alert('For prototype demonstration, use the demo credentials: govadmin / Agri@2026');
  }

  onLogin() {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both Government ID and Password.';
      return;
    }

    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.errorMessage = result.message || 'Invalid credentials.';
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An unexpected error occurred during authentication.';
        this.cdr.detectChanges();
      }
    });
  }
}
