import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutService, PageMeta } from '../../../services/layout.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { AppNotification, AdminUser } from '../../../models/procurement.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <header class="top-header">
      <!-- Left: Mobile Menu Toggle & Page Meta / Breadcrumbs -->
      <div class="header-left">
        <button class="mobile-toggle-btn" (click)="toggleMobileMenu()" title="Open Navigation Menu">
          <i class="fa-solid fa-bars"></i>
        </button>

        <div class="page-meta">
          <h2 class="current-title">{{ pageMeta.title }}</h2>
          <div class="breadcrumb">
            <span class="home-crumb">MandiConnect AI</span>
            <i class="fa-solid fa-chevron-right crumb-sep"></i>
            <span class="active-crumb">{{ pageMeta.breadcrumb }}</span>
          </div>
        </div>
      </div>


      <!-- Right: Search, Date/Time, Notifs & Admin Profile -->
      <div class="header-actions">
        <!-- Global Search Input -->
        <div class="header-search">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="Search Farmer ID, Mandi, Token..."
            [(ngModel)]="searchQuery"
          />
        </div>

        <!-- Date & Time Ticker -->
        <div class="date-badge">
          <i class="fa-regular fa-clock text-primary"></i>
          <span>{{ currentDateStr }}</span>
        </div>

        <!-- Notification Dropdown -->
        <div class="notif-wrapper">
          <button class="notif-btn" (click)="toggleNotifDropdown()" title="System Notifications">
            <i class="fa-regular fa-bell"></i>
            <span class="notif-badge" *ngIf="unreadCount > 0">{{ unreadCount }}</span>
          </button>

          <!-- Notification Center Dropdown Panel -->
          <div class="notif-dropdown" *ngIf="showNotifs">
            <div class="notif-header">
              <div class="notif-title-box">
                <h4>Government Notification Center</h4>
                <span class="badge badge-critical" *ngIf="unreadCount > 0">{{ unreadCount }} Unread</span>
              </div>
              <button class="btn-mark-read" (click)="markAllAsRead()" *ngIf="unreadCount > 0">
                <i class="fa-solid fa-check-double"></i> Mark all read
              </button>
            </div>

            <div class="notif-body">
              <div
                *ngFor="let notif of notifications"
                class="notif-item"
                [class.unread]="!notif.read"
                (click)="onNotificationClick(notif)"
              >
                <div
                  class="notif-icon-box"
                  [class.icon-critical]="notif.severity === 'CRITICAL'"
                  [class.icon-warning]="notif.severity === 'WARNING'"
                  [class.icon-success]="notif.severity === 'SUCCESS'"
                  [class.icon-info]="notif.severity === 'INFO'"
                >
                  <i
                    class="fa-solid"
                    [class.fa-triangle-exclamation]="notif.severity === 'CRITICAL'"
                    [class.fa-circle-exclamation]="notif.severity === 'WARNING'"
                    [class.fa-circle-check]="notif.severity === 'SUCCESS'"
                    [class.fa-circle-info]="notif.severity === 'INFO'"
                  ></i>
                </div>

                <div class="notif-info">
                  <div class="notif-item-head">
                    <span class="notif-title">{{ notif.title }}</span>
                    <span class="unread-dot-indicator" *ngIf="!notif.read">●</span>
                  </div>
                  <p class="notif-msg">{{ notif.message }}</p>
                  <span class="notif-time">{{ notif.timestamp }}</span>
                </div>
              </div>

              <div *ngIf="notifications.length === 0" class="empty-notif">
                <p>No notifications available.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Admin Profile Menu -->
        <div class="admin-profile-wrapper">
          <div class="admin-profile" (click)="toggleProfileDropdown()">
            <div class="profile-avatar">
              <span>{{ currentAdmin?.avatarText || 'GU' }}</span>
            </div>
            <div class="profile-details">
              <span class="admin-name">{{ currentAdmin?.name || 'GUEST USER' }}</span>
              <span class="admin-role-tag">GOV-ADMIN</span>
            </div>
            <i class="fa-solid fa-chevron-down profile-arrow"></i>
          </div>

          <!-- Profile Dropdown Menu -->
          <div class="profile-dropdown" *ngIf="showProfileMenu">
            <div class="profile-card-head">
              <strong>{{ currentAdmin?.name }}</strong>
              <div class="text-xs text-muted">{{ currentAdmin?.email }}</div>
              <span class="badge badge-purple mt-1">{{ currentAdmin?.department }}</span>
            </div>
            <div class="profile-menu-items">
              <a href="javascript:void(0)" class="profile-menu-item" (click)="closeProfileMenu()">
                <i class="fa-solid fa-user text-muted"></i> Profile Details
              </a>
              <a href="javascript:void(0)" class="profile-menu-item" (click)="closeProfileMenu()">
                <i class="fa-solid fa-sliders text-muted"></i> Notification Preferences
              </a>
              <div class="menu-divider"></div>
              <button class="logout-btn" (click)="logout()">
                <i class="fa-solid fa-right-from-bracket"></i> Sign Out / Logout
              </button>
            </div>
          </div>
        </div>

      </div>
    </header>
  `,
  styles: [`
    .top-header {
      height: 72px;
      background-color: #ffffff;
      border-bottom: 1px solid var(--border-light);
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 900;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
      gap: 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .mobile-toggle-btn {
      display: none;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      align-items: center;
      justify-content: center;
      color: var(--slate-900);
      font-size: 1.1rem;
      cursor: pointer;
    }

    @media (max-width: 992px) {
      .mobile-toggle-btn {
        display: flex;
      }
    }

    .page-meta {
      display: flex;
      flex-direction: column;
    }

    .current-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--primary-700);
      line-height: 1.2;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.725rem;
      color: var(--text-muted);
    }

    .home-crumb {
      font-weight: 600;
      color: var(--slate-900);
    }

    .crumb-sep {
      font-size: 0.6rem;
      color: #94a3b8;
    }

    .active-crumb {
      color: var(--primary-700);
      font-weight: 600;
    }

    /* Demo Mode Banner Indicator */
    .demo-mode-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #FEF3C7;
      border: 1px solid #F59E0B;
      color: #B45309;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.03em;
      box-shadow: 0 2px 6px rgba(245, 158, 11, 0.15);
      white-space: nowrap;
    }

    .demo-dot {
      color: #EF4444;
      font-size: 0.85rem;
      animation: blink 1.5s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    @media (max-width: 1200px) {
      .demo-mode-indicator {
        display: none;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: #F8FAF9;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 6px 14px;
      width: 220px;
      transition: all 0.2s ease;
    }

    .header-search:focus-within {
      background-color: #ffffff;
      border-color: var(--primary-500);
      box-shadow: 0 0 0 3px rgba(13, 92, 58, 0.12);
    }

    .search-icon {
      color: #64748B;
      font-size: 0.85rem;
    }

    .header-search input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 0.825rem;
      color: var(--text-main);
    }

    @media (max-width: 768px) {
      .header-search {
        display: none;
      }
    }

    .date-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: var(--primary-50);
      border: 1px solid rgba(13, 92, 58, 0.2);
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--primary-700);
      white-space: nowrap;
    }

    @media (max-width: 600px) {
      .date-badge {
        display: none;
      }
    }

    .notif-wrapper {
      position: relative;
    }

    .notif-btn {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background-color: #F8FAF9;
      border: 1px solid #E2E8F0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #334155;
      font-size: 1.05rem;
      position: relative;
      transition: all 0.2s ease;
    }

    .notif-btn:hover {
      background-color: var(--primary-50);
      color: var(--primary-700);
    }

    .notif-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      background-color: #EF4444;
      color: #ffffff;
      font-size: 0.65rem;
      font-weight: 800;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #ffffff;
    }

    .notif-dropdown {
      position: absolute;
      top: 48px;
      right: 0;
      width: 360px;
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      z-index: 950;
      overflow: hidden;
    }

    .notif-header {
      padding: 14px 16px;
      background-color: #F8FAF9;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .notif-title-box h4 {
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--slate-900);
    }

    .btn-mark-read {
      background: none;
      border: none;
      color: var(--primary-700);
      font-size: 0.725rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-mark-read:hover {
      text-decoration: underline;
    }

    .notif-body {
      max-height: 320px;
      overflow-y: auto;
    }

    .notif-item {
      padding: 12px 16px;
      border-bottom: 1px solid #F1F5F9;
      display: flex;
      gap: 12px;
      cursor: pointer;
      transition: background 0.15s ease;
    }

    .notif-item.unread {
      background-color: #F0FDF6;
    }

    .notif-item:hover {
      background-color: #F8FAF9;
    }

    .notif-icon-box {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .icon-critical { background: #FEE2E2; color: #EF4444; }
    .icon-warning { background: #FEF3C7; color: #D97706; }
    .icon-success { background: #D1FAE5; color: #059669; }
    .icon-info { background: #DBEAFE; color: #2563EB; }

    .notif-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .notif-item-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .notif-title {
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .unread-dot-indicator {
      color: #EF4444;
      font-size: 0.7rem;
    }

    .notif-msg {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
      line-height: 1.3;
    }

    .notif-time {
      font-size: 0.65rem;
      color: #94A3B8;
      margin-top: 4px;
    }

    .empty-notif {
      padding: 24px;
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    /* Admin Profile Dropdown */
    .admin-profile-wrapper {
      position: relative;
    }

    .admin-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .admin-profile:hover {
      background-color: #F8FAF9;
    }

    .profile-avatar {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0D5C3A, #169B62);
      color: #ffffff;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      box-shadow: 0 2px 6px rgba(13, 92, 58, 0.25);
    }

    .profile-details {
      display: flex;
      flex-direction: column;
    }

    .admin-name {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--slate-900);
      line-height: 1.2;
    }

    .admin-role-tag {
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--primary-700);
    }

    .profile-arrow {
      font-size: 0.7rem;
      color: #94A3B8;
    }

    .profile-dropdown {
      position: absolute;
      top: 48px;
      right: 0;
      width: 240px;
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: 14px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      z-index: 950;
      overflow: hidden;
    }

    .profile-card-head {
      padding: 14px 16px;
      background-color: #F8FAF9;
      border-bottom: 1px solid var(--border-light);
    }

    .profile-card-head strong {
      font-size: 0.875rem;
      color: var(--slate-900);
      display: block;
    }

    .profile-menu-items {
      padding: 8px;
      display: flex;
      flex-direction: column;
    }

    .profile-menu-item {
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.825rem;
      color: var(--text-main);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.15s ease;
    }

    .profile-menu-item:hover {
      background-color: #F1F5F9;
    }

    .menu-divider {
      height: 1px;
      background-color: var(--border-light);
      margin: 6px 0;
    }

    .logout-btn {
      width: 100%;
      background: none;
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      color: #EF4444;
      font-size: 0.825rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: background 0.15s ease;
      text-align: left;
    }

    .logout-btn:hover {
      background-color: #FEE2E2;
    }

    @media (max-width: 480px) {
      .profile-details {
        display: none;
      }
    }

    .mt-1 { margin-top: 4px; }
    .text-xs { font-size: 0.75rem; }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageMeta: PageMeta = { title: 'Dashboard', breadcrumb: 'Command Centre' };
  searchQuery: string = '';
  showNotifs: boolean = false;
  showProfileMenu: boolean = false;
  currentDateStr: string = '';
  notifications: AppNotification[] = [];
  unreadCount: number = 0;
  currentAdmin: AdminUser | null = null;
  private clockInterval: any;

  constructor(
    private layoutService: LayoutService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.layoutService.pageMeta$.subscribe(meta => this.pageMeta = meta);
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);

    this.notificationService.notifications$.subscribe(n => this.notifications = n);
    this.notificationService.unreadCount$.subscribe(c => this.unreadCount = c);
    this.authService.currentAdmin$.subscribe(admin => this.currentAdmin = admin);
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  toggleMobileMenu() {
    this.layoutService.toggleMobileMenu();
  }

  updateClock() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    this.currentDateStr = now.toLocaleDateString('en-IN', options);
  }

  toggleNotifDropdown() {
    this.showNotifs = !this.showNotifs;
    if (this.showNotifs) this.showProfileMenu = false;
  }

  toggleProfileDropdown() {
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showProfileMenu) this.showNotifs = false;
  }

  closeProfileMenu() {
    this.showProfileMenu = false;
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  onNotificationClick(notif: AppNotification) {
    this.notificationService.markAsRead(notif.id);
    this.showNotifs = false;
    if (notif.relatedRoute) {
      this.router.navigateByUrl(notif.relatedRoute);
    }
  }

  logout() {
    this.showProfileMenu = false;
    this.authService.logout();
  }
}
