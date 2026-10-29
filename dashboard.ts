import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProcurementService } from '../../services/procurement.service';
import { 
  DashboardStats, 
  ProcurementCentre, 
  QueueToken, 
  AIAlert,
  CropDistribution
} from '../../models/procurement.model';

import { ReplaceUnderscorePipe } from '../../pipes/replace-underscore.pipe';

interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  time: string;
  type: 'checkin' | 'completed' | 'capacity' | 'payment' | 'reassign';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ReplaceUnderscorePipe],
  template: `
    <div class="page-wrapper">
      <!-- Title & Action Bar -->
      <div class="page-header-title">
        <div>
          <h1>
            <i class="fa-solid fa-gauge-high text-primary"></i>
            Mandi Operations & Crop Price Command Centre
          </h1>
          <p class="page-header-subtitle">
            Master Administrative Control System: Mandi Queues, Farmer Arrivals, Crop Analytics & AI Congestion Load Balancer
          </p>
        </div>
        <div class="header-actions-group">
          <button class="btn btn-secondary" (click)="refreshData()">
            <i class="fa-solid fa-rotate"></i> Refresh State
          </button>

          <a routerLink="/audit" class="btn btn-secondary">
            <i class="fa-solid fa-clipboard-list"></i> Audit Logs
          </a>

          <a routerLink="/ai-intelligence" class="btn btn-primary">
            <i class="fa-solid fa-brain"></i> AI Reroute Hub
          </a>
        </div>
      </div>

      <!-- AI Banner Notification -->
      <div class="ai-banner" *ngIf="criticalAlert">
        <div class="ai-banner-content">
          <div class="ai-banner-badge">
            <i class="fa-solid fa-robot"></i> HIGH CONGESTION PREDICTED
          </div>
          <div class="ai-banner-text">
            <strong>{{ criticalAlert.title }}</strong>: {{ criticalAlert.message }}
          </div>
        </div>
        <div class="ai-banner-actions">
          <button 
            *ngIf="!criticalAlert.executed" 
            class="btn btn-accent btn-sm" 
            (click)="executeReroute(criticalAlert.id)"
          >
            <i class="fa-solid fa-route"></i> {{ criticalAlert.recommendedAction ? 'Redirect 25 Scheduled Farmers' : 'Take Action' }}
          </button>
          <span *ngIf="criticalAlert.executed" class="executed-badge">
            <i class="fa-solid fa-circle-check"></i> Reroute Order Dispatched & Audit Logged!
          </span>
        </div>
      </div>

      <!-- 8 KPI Summary Cards -->
      <div class="kpi-grid">
        <!-- 1. Total Registered Farmers -->
        <div class="kpi-card border-left-emerald">
          <div class="kpi-icon icon-emerald">
            <i class="fa-solid fa-users"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Registered Farmers</span>
            <span class="kpi-value">{{ stats.totalRegisteredFarmers | number }}</span>
            <span class="kpi-trend trend-up"><i class="fa-solid fa-arrow-trend-up"></i> +12% this season</span>
          </div>
        </div>

        <!-- 2. Today's Scheduled Farmers -->
        <div class="kpi-card border-left-blue">
          <div class="kpi-icon icon-blue">
            <i class="fa-regular fa-calendar-check"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Today's Scheduled</span>
            <span class="kpi-value">{{ stats.todayScheduledFarmers | number }}</span>
            <span class="kpi-sub text-blue font-semibold">5 Active Mandis</span>
          </div>
        </div>

        <!-- 3. Currently Waiting -->
        <div class="kpi-card border-left-amber">
          <div class="kpi-icon icon-amber">
            <i class="fa-solid fa-user-clock"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Currently Waiting</span>
            <span class="kpi-value text-amber">{{ stats.currentlyWaitingFarmers | number }}</span>
            <span class="kpi-sub">Gate Entry Queues</span>
          </div>
        </div>

        <!-- 4. Completed Procurement -->
        <div class="kpi-card border-left-emerald">
          <div class="kpi-icon icon-emerald">
            <i class="fa-solid fa-clipboard-check"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Completed</span>
            <span class="kpi-value">{{ stats.completedProcurements | number }}</span>
            <span class="kpi-sub text-emerald font-semibold">Tonnage Verified</span>
          </div>
        </div>

        <!-- 5. Pending Payments -->
        <div class="kpi-card border-left-purple">
          <div class="kpi-icon icon-purple">
            <i class="fa-solid fa-indian-rupee-sign"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Pending Payments</span>
            <span class="kpi-value">₹ 42.5 L</span>
            <span class="kpi-sub text-purple">{{ stats.pendingPaymentsCount }} Payouts via PFMS</span>
          </div>
        </div>

        <!-- 6. Average Waiting Time -->
        <div class="kpi-card border-left-saffron">
          <div class="kpi-icon icon-saffron">
            <i class="fa-regular fa-clock"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Avg Waiting Time</span>
            <span class="kpi-value">{{ stats.avgWaitingTimeMinutes }} <small>min</small></span>
            <span class="kpi-trend trend-down"><i class="fa-solid fa-arrow-trend-down"></i> -12m after AI balance</span>
          </div>
        </div>

        <!-- 7. Overall Centre Utilization -->
        <div class="kpi-card border-left-blue">
          <div class="kpi-icon icon-blue">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Centre Utilization</span>
            <span class="kpi-value">{{ stats.overallUtilizationPercent }}%</span>
            <div class="progress-bar-bg mt-2">
              <div class="progress-bar-fill bg-blue" [style.width.%]="stats.overallUtilizationPercent"></div>
            </div>
          </div>
        </div>

        <!-- 8. Predicted Congestion -->
        <div class="kpi-card border-left-red">
          <div class="kpi-icon icon-red">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <div class="kpi-content">
            <span class="kpi-label">Predicted Congestion</span>
            <span class="kpi-value text-red">{{ stats.predictedCongestionCentresCount }} Centres</span>
            <span class="badge badge-congested mt-1">High Load Bottleneck</span>
          </div>
        </div>
      </div>

      <!-- Dashboard Main Grid Layout -->
      <div class="dashboard-main-grid mt-6">
        
        <!-- Left Column: Mandi Overview Table, Trends & Crop Breakdown -->
        <div class="grid-col-left">
          
          <!-- Procurement Trend Chart (SVG) -->
          <div class="agri-card mb-6">
            <div class="agri-card-header">
              <div class="agri-card-title">
                <i class="fa-solid fa-chart-column text-primary"></i>
                Procurement Trend (Hourly Farmer Arrivals vs Tonnage Procured)
              </div>
              <div class="chart-legend">
                <span class="legend-item"><span class="legend-dot bg-emerald"></span> Farmer Arrivals</span>
                <span class="legend-item"><span class="legend-dot bg-gold"></span> Procurement (Quintals)</span>
              </div>
            </div>

            <div class="chart-container">
              <svg viewBox="0 0 700 220" class="svg-chart">
                <line x1="40" y1="30" x2="680" y2="30" stroke="#e2e8f0" stroke-dasharray="4"/>
                <line x1="40" y1="80" x2="680" y2="80" stroke="#e2e8f0" stroke-dasharray="4"/>
                <line x1="40" y1="130" x2="680" y2="130" stroke="#e2e8f0" stroke-dasharray="4"/>
                <line x1="40" y1="180" x2="680" y2="180" stroke="#cbd5e1" stroke-width="2"/>

                <text x="30" y="35" font-size="10" fill="#64748b" text-anchor="end">400 Qtl</text>
                <text x="30" y="85" font-size="10" fill="#64748b" text-anchor="end">250 Qtl</text>
                <text x="30" y="135" font-size="10" fill="#64748b" text-anchor="end">100 Qtl</text>
                <text x="30" y="185" font-size="10" fill="#64748b" text-anchor="end">0</text>

                <rect x="75" y="110" width="26" height="70" rx="4" fill="#0D5C3A" opacity="0.85"/>
                <rect x="105" y="130" width="26" height="50" rx="4" fill="#E5A93C" opacity="0.85"/>
                <text x="94" y="200" font-size="11" fill="#475569" text-anchor="middle">08:00 AM</text>

                <rect x="175" y="60" width="26" height="120" rx="4" fill="#0D5C3A"/>
                <rect x="205" y="85" width="26" height="95" rx="4" fill="#E5A93C"/>
                <text x="194" y="200" font-size="11" fill="#475569" text-anchor="middle">10:00 AM</text>

                <rect x="275" y="40" width="26" height="140" rx="4" fill="#EF4444"/>
                <rect x="305" y="65" width="26" height="115" rx="4" fill="#E5A93C"/>
                <text x="294" y="200" font-size="11" fill="#475569" text-anchor="middle">12:00 PM</text>

                <rect x="375" y="70" width="26" height="110" rx="4" fill="#0D5C3A"/>
                <rect x="405" y="90" width="26" height="90" rx="4" fill="#E5A93C"/>
                <text x="394" y="200" font-size="11" fill="#475569" text-anchor="middle">02:00 PM</text>

                <rect x="475" y="100" width="26" height="80" rx="4" fill="#0D5C3A"/>
                <rect x="505" y="120" width="26" height="60" rx="4" fill="#E5A93C"/>
                <text x="494" y="200" font-size="11" fill="#475569" text-anchor="middle">04:00 PM</text>

                <rect x="575" y="140" width="26" height="40" rx="4" fill="#94A3B8" opacity="0.5"/>
                <rect x="605" y="150" width="26" height="30" rx="4" fill="#CBD5E1" opacity="0.5"/>
                <text x="594" y="200" font-size="11" fill="#475569" text-anchor="middle">06:00 PM</text>
              </svg>
            </div>
          </div>

          <!-- Crop Distribution Analytics -->
          <div class="agri-card mb-6">
            <div class="agri-card-header">
              <div class="agri-card-title">
                <i class="fa-solid fa-wheat-awn text-primary"></i>
                Crop Procurement Tonnage Breakdown
              </div>
              <span class="badge badge-optimal">18,450 Quintals Total</span>
            </div>

            <div class="crop-grid">
              <div *ngFor="let crop of crops" class="crop-card">
                <div class="flex-between">
                  <strong class="crop-name">{{ crop.crop }}</strong>
                  <span class="crop-pct">{{ crop.percentage }}%</span>
                </div>
                <div class="progress-bar-bg mt-2 mb-1">
                  <div class="progress-bar-fill bg-emerald" [style.width.%]="crop.percentage"></div>
                </div>
                <span class="text-xs text-muted">{{ crop.tonnageQuintals | number }} Quintals</span>
              </div>
            </div>
          </div>

          <!-- Live Queue Preview Table -->
          <div class="agri-card">
            <div class="agri-card-header">
              <div class="agri-card-title">
                <i class="fa-solid fa-stream text-primary"></i>
                Live Queue Overview & Token Preview
              </div>
              <a routerLink="/queue" class="btn btn-secondary btn-sm">Manage Live Queue</a>
            </div>

            <div class="agri-table-container">
              <table class="agri-table">
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Farmer</th>
                    <th>Centre</th>
                    <th>Crop</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Waiting Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let q of liveQueue">
                    <td><strong class="token-tag">{{ q.tokenNo }}</strong></td>
                    <td>
                      <div class="font-bold text-main">{{ q.farmerName }}</div>
                      <div class="text-xs text-muted">{{ q.farmerRegNo }}</div>
                    </td>
                    <td>{{ q.centreName }}</td>
                    <td><span class="crop-pill">{{ q.cropType }}</span></td>
                    <td><strong>{{ q.quantityQuintals }} Qtl</strong></td>
                    <td>
                      <span 
                        class="badge" 
                        [class.badge-optimal]="q.status === 'COMPLETED'"
                        [class.badge-blue]="q.status === 'CHECKED_IN' || q.status === 'PROCESSING'"
                        [class.badge-moderate]="q.status === 'WAITING'"
                        [class.badge-critical]="q.status === 'CANCELLED'"
                      >
                        {{ q.status | replaceUnderscore }}
                      </span>
                    </td>
                    <td><i class="fa-regular fa-clock text-muted"></i> {{ q.estimatedWaitingTimeMinutes }} mins</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Right Column: AI Alerts & Recent Activity -->
        <div class="grid-col-right">

          <!-- AI Congestion Rerouting Highlights -->
          <div class="agri-card ai-card-glow mb-6">
            <div class="agri-card-header">
              <div class="agri-card-title text-primary">
                <i class="fa-solid fa-brain"></i>
                AI Congestion Rerouting
              </div>
              <span class="badge badge-purple">ML Engine</span>
            </div>

            <div class="ai-alert-list">
              <div *ngFor="let alert of alerts" class="ai-alert-item">
                <div class="ai-alert-head">
                  <span 
                    class="badge" 
                    [class.badge-critical]="alert.severity === 'CRITICAL'"
                    [class.badge-congested]="alert.severity === 'WARNING'"
                    [class.badge-blue]="alert.severity === 'INFO'"
                  >
                    {{ alert.severity }}
                  </span>
                  <span class="ai-alert-time">{{ alert.timestamp }}</span>
                </div>
                <h4 class="ai-alert-title">{{ alert.title }}</h4>
                <p class="ai-alert-msg">{{ alert.message }}</p>

                <div *ngIf="alert.recommendedAction" class="ai-rec-box">
                  <span class="rec-label"><i class="fa-solid fa-lightbulb"></i> Recommended Action:</span>
                  <p class="rec-text">{{ alert.recommendedAction }}</p>

                  <button 
                    *ngIf="!alert.executed" 
                    class="btn btn-primary btn-sm mt-2" 
                    (click)="executeReroute(alert.id)"
                  >
                    <i class="fa-solid fa-share"></i> Dispatch Reroute Order
                  </button>

                  <div *ngIf="alert.executed" class="text-xs text-emerald font-bold mt-2">
                    <i class="fa-solid fa-check-circle"></i> Redirect Order Dispatched to Farmers!
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Government Operations Activity Feed -->
          <div class="agri-card">
            <div class="agri-card-header">
              <div class="agri-card-title">
                <i class="fa-solid fa-list-ul text-primary"></i>
                Recent Government Operations
              </div>
              <a routerLink="/audit" class="text-xs font-semibold text-primary-700">View Audit Log</a>
            </div>

            <div class="activity-timeline">
              <div *ngFor="let act of recentActivities" class="timeline-item">
                <div class="activity-icon" [class.icon-green]="act.type === 'checkin' || act.type === 'completed'" [class.icon-gold]="act.type === 'capacity' || act.type === 'reassign'" [class.icon-purple]="act.type === 'payment'">
                  <i [class]="act.icon"></i>
                </div>
                <div class="activity-details">
                  <span class="activity-title">{{ act.title }}</span>
                  <span class="activity-time">{{ act.time }}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `,
  styles: [`
    .header-actions-group {
      display: flex;
      gap: 10px;
    }

    .ai-banner {
      background: linear-gradient(135deg, #0D5C3A, #082618);
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: var(--radius-lg);
      padding: 16px 24px;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
      box-shadow: 0 8px 20px rgba(13, 92, 58, 0.25);
      flex-wrap: wrap;
      gap: 12px;
    }

    .ai-banner-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .ai-banner-badge {
      background: linear-gradient(135deg, #E5A93C, #D97706);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.04em;
    }

    .ai-banner-text {
      font-size: 0.925rem;
    }

    .executed-badge {
      color: #10B981;
      font-weight: 700;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(16, 185, 129, 0.15);
      padding: 6px 12px;
      border-radius: 8px;
    }

    /* KPI Grid 8 Columns Responsive */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }

    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 600px) {
      .kpi-grid { grid-template-columns: 1fr; }
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      padding: 16px 18px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .border-left-emerald { border-left: 5px solid #10B981; }
    .border-left-blue { border-left: 5px solid #3B82F6; }
    .border-left-amber { border-left: 5px solid #E5A93C; }
    .border-left-saffron { border-left: 5px solid #EA580C; }
    .border-left-purple { border-left: 5px solid #8B5CF6; }
    .border-left-red { border-left: 5px solid #EF4444; }

    .kpi-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }

    .icon-emerald { background: #D1FAE5; color: #059669; }
    .icon-blue { background: #DBEAFE; color: #2563EB; }
    .icon-amber { background: #FEF3C7; color: #D97706; }
    .icon-saffron { background: #FFEDD5; color: #EA580C; }
    .icon-purple { background: #EDE9FE; color: #7C3AED; }
    .icon-red { background: #FEE2E2; color: #DC2626; }

    .kpi-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .kpi-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    .kpi-value {
      font-family: 'Outfit', sans-serif;
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--slate-900);
      line-height: 1.2;
      margin-top: 2px;
    }

    .kpi-trend {
      font-size: 0.725rem;
      font-weight: 600;
      margin-top: 3px;
    }

    .trend-up { color: #10B981; }
    .trend-down { color: #059669; }
    .kpi-sub { font-size: 0.725rem; color: var(--text-muted); margin-top: 3px; }

    /* Dashboard Main Grid Layout */
    .dashboard-main-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 24px;
    }

    @media (max-width: 1024px) {
      .dashboard-main-grid { grid-template-columns: 1fr; }
    }

    .chart-legend {
      display: flex;
      gap: 16px;
    }

    .legend-item {
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }

    .bg-emerald { background-color: #0D5C3A; }
    .bg-gold { background-color: #E5A93C; }

    .svg-chart {
      width: 100%;
      height: 220px;
    }

    .crop-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
    }

    @media (max-width: 768px) {
      .crop-grid { grid-template-columns: repeat(2, 1fr); }
    }

    .crop-card {
      background: #f8faf9;
      padding: 10px 12px;
      border-radius: 10px;
      border: 1px solid var(--border-light);
    }

    .crop-name {
      font-size: 0.85rem;
      color: var(--slate-900);
    }

    .crop-pct {
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--primary-700);
    }

    .token-tag {
      font-size: 0.78rem;
      font-weight: 800;
      color: var(--primary-700);
      background: var(--primary-50);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .crop-pill {
      background: #F1F5F9;
      color: var(--slate-900);
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .ai-card-glow {
      border: 1px solid rgba(13, 92, 58, 0.3);
      background: linear-gradient(180deg, #ffffff, #F0FDF6);
    }

    .ai-alert-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .ai-alert-item {
      background: #ffffff;
      border: 1px solid var(--border-light);
      border-radius: 12px;
      padding: 14px 16px;
    }

    .ai-alert-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .ai-alert-time {
      font-size: 0.7rem;
      color: #94A3B8;
    }

    .ai-alert-title {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--slate-900);
    }

    .ai-alert-msg {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
      line-height: 1.4;
    }

    .ai-rec-box {
      margin-top: 10px;
      padding: 10px 12px;
      background-color: #F8FAF9;
      border-left: 3px solid var(--primary-500);
      border-radius: 6px;
    }

    .rec-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--primary-700);
    }

    .rec-text {
      font-size: 0.775rem;
      color: var(--text-main);
      margin-top: 2px;
    }

    .activity-timeline {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .timeline-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 10px;
      border-bottom: 1px dashed var(--border-light);
    }

    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      flex-shrink: 0;
    }

    .icon-green { background: #D1FAE5; color: #059669; }
    .icon-gold { background: #FEF3C7; color: #D97706; }
    .icon-purple { background: #EDE9FE; color: #7C3AED; }

    .activity-details {
      display: flex;
      flex-direction: column;
    }

    .activity-title {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-main);
    }

    .activity-time {
      font-size: 0.7rem;
      color: #94A3B8;
    }

    .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .mb-6 { margin-bottom: 24px; }
    .mt-6 { margin-top: 24px; }
    .mt-2 { margin-top: 8px; }
    .mb-1 { margin-bottom: 4px; }
    .mt-1 { margin-top: 4px; }
    .text-xs { font-size: 0.75rem; }
    .text-red { color: #EF4444; }
    .text-amber { color: #D97706; }
    .text-emerald { color: #059669; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats = {
    totalRegisteredFarmers: 1248,
    todayScheduledFarmers: 286,
    currentlyWaitingFarmers: 73,
    completedProcurements: 164,
    pendingPaymentsCount: 42,
    pendingPaymentsAmount: 4250000,
    avgWaitingTimeMinutes: 42,
    overallUtilizationPercent: 74,
    predictedCongestionCentresCount: 3,
    predictedCongestionLevel: 'HIGH'
  };

  centres: ProcurementCentre[] = [];
  liveQueue: QueueToken[] = [];
  alerts: AIAlert[] = [];
  crops: CropDistribution[] = [];
  criticalAlert: AIAlert | null = null;

  recentActivities: ActivityItem[] = [
    { id: '1', icon: 'fa-solid fa-user-check', title: 'Farmer FRM-10245 registered & assigned to Karnal', time: '10:15 AM', type: 'checkin' },
    { id: '2', icon: 'fa-solid fa-arrows-rotate', title: 'Farmer FRM-10248 Mandi reassigned to Kurukshetra', time: '10:30 AM', type: 'reassign' },
    { id: '3', icon: 'fa-solid fa-circle-check', title: 'Token PNP-102 completed at Panipat Centre', time: '10:45 AM', type: 'completed' },
    { id: '4', icon: 'fa-solid fa-sliders', title: 'Karnal Central Procurement capacity updated (150 Cap)', time: '11:00 AM', type: 'capacity' },
    { id: '5', icon: 'fa-solid fa-indian-rupee-sign', title: 'PFMS DBT payment batch released for 42 farmers', time: '11:35 AM', type: 'payment' }
  ];

  constructor(private procurementService: ProcurementService) {}

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.procurementService.getStats().subscribe(s => this.stats = s);
    this.procurementService.getCentres().subscribe(c => this.centres = c);
    this.procurementService.getQueue().subscribe(q => this.liveQueue = q.slice(0, 5));
    this.procurementService.getCropDistribution().subscribe(c => this.crops = c);
    this.procurementService.getAIAlerts().subscribe(a => {
      this.alerts = a;
      this.criticalAlert = a.find(item => item.severity === 'CRITICAL') || null;
    });
  }

  executeReroute(alertId: string) {
    this.procurementService.executeRerouteAction(alertId);
    this.refreshData();
  }
}
