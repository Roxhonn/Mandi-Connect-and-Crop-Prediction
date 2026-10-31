import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/layout/sidebar/sidebar';
import { HeaderComponent } from './components/layout/header/header';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <!-- Authenticated Layout Shell: Displays Sidebar, Header & Protected Components -->
    <div class="app-container" *ngIf="isLoggedIn">
      <app-sidebar></app-sidebar>

      <div class="main-content">
        <app-header></app-header>
        <router-outlet></router-outlet>
      </div>
    </div>

    <!-- Unauthenticated Fullscreen Layout: Displays ONLY the Login Page -->
    <div class="login-wrapper" *ngIf="!isLoggedIn">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    .login-wrapper {
      width: 100vw;
      min-height: 100vh;
      background-color: #f4f7f5;
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'MandiConnect AI';
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.isAuthenticated$.subscribe(status => {
      this.isLoggedIn = status;
    });
  }
}
