import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcurementService } from '../../services/procurement.service';
import { Farmer, ProcurementCentre } from '../../models/procurement.model';

@Component({
  selector: 'app-farmers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-wrapper">
      <!-- Header -->
      <div class="page-header-title">
        <div>
          <h1>
            <i class="fa-solid fa-users-gear text-primary"></i>
            Registered Farmers Directory
          </h1>
          <p class="page-header-subtitle">
            Farmer Accounts, Landholding Records, Mandi Reassignments & Digital Gate Passes
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="showRegisterModal = true">
            <i class="fa-solid fa-user-plus"></i> Register New Farmer
          </button>
        </div>
      </div>

      <!-- Search & Filters Bar -->
      <div class="filter-bar">
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input 
            type="text" 
            placeholder="Search Farmer Name, Reg No, Village, Phone, or Token..." 
            [(ngModel)]="searchQuery"
          />
        </div>

        <div class="filter-group">
          <label><i class="fa-solid fa-wheat-awn"></i> Crop:</label>
          <select [(ngModel)]="selectedCrop">
            <option value="ALL">All Crops</option>
            <option value="Paddy">Paddy</option>
            <option value="Wheat">Wheat</option>
            <option value="Mustard">Mustard</option>
            <option value="Cotton">Cotton</option>
            <option value="Chana">Chana</option>
          </select>
        </div>

        <div class="filter-group">
          <label><i class="fa-solid fa-location-dot"></i> District:</label>
          <select [(ngModel)]="selectedDistrict">
            <option value="ALL">All Districts</option>
            <option value="Karnal">Karnal</option>
            <option value="Panipat">Panipat</option>
            <option value="Kurukshetra">Kurukshetra</option>
            <option value="Ambala">Ambala</option>
            <option value="Sonipat">Sonipat</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="selectedStatus">
            <option value="ALL">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="WAITING">Waiting</option>
            <option value="IN_PROCESSING">In Processing</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <!-- Directory Table Card -->
      <div class="agri-card">
        <div class="agri-table-container">
          <table class="agri-table">
            <thead>
              <tr>
                <th>Farmer ID & Name</th>
                <th>Village & District</th>
                <th>Phone</th>
                <th>Crop & Quantity</th>
                <th>Assigned Mandi Centre</th>
                <th>Slot</th>
                <th>Token</th>
                <th>Status</th>
                <th>Master Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let farmer of filteredFarmers">
                <td>
                  <strong class="farmer-title">{{ farmer.name }}</strong>
                  <div class="text-xs text-muted">ID: {{ farmer.id }} • {{ farmer.regNo }}</div>
                </td>
                <td>
                  <div>{{ farmer.village }}</div>
                  <div class="text-xs text-muted">{{ farmer.district }}, {{ farmer.state }}</div>
                </td>
                <td>{{ farmer.mobile }}</td>
                <td>
                  <span class="crop-tag">{{ farmer.cropType }}</span>
                  <div class="text-xs text-muted mt-1">{{ farmer.quantityQuintals }} Qtl • {{ farmer.landAcres }} Acres</div>
                </td>
                <td>
                  <div class="font-semibold text-primary-700">{{ farmer.centreName }}</div>
                  <button class="reassign-link" (click)="openReassignModal(farmer)">
                    <i class="fa-solid fa-arrows-rotate"></i> Reassign Mandi
                  </button>
                </td>
                <td>
                  <i class="fa-regular fa-clock text-muted"></i> {{ farmer.scheduledSlot }}
                </td>
                <td>
                  <span class="token-pill">{{ farmer.tokenNo }}</span>
                </td>
                <td>
                  <span 
                    class="badge"
                    [class.badge-optimal]="farmer.status === 'COMPLETED'"
                    [class.badge-blue]="farmer.status === 'SCHEDULED' || farmer.status === 'IN_PROCESSING'"
                    [class.badge-moderate]="farmer.status === 'WAITING'"
                    [class.badge-critical]="farmer.status === 'CANCELLED'"
                  >
                    {{ farmer.status }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="btn btn-secondary btn-sm" (click)="openPassModal(farmer)">
                      <i class="fa-solid fa-id-card"></i> Gate Pass
                    </button>
                    <button class="btn btn-secondary btn-sm" (click)="openEditFarmerModal(farmer)">
                      <i class="fa-solid fa-pen"></i> Edit
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Farmer Token Pass Modal -->
      <div class="modal-overlay" *ngIf="selectedFarmerModal">
        <div class="modal-card token-pass-card">
          <div class="pass-header">
            <div class="pass-gov-logo">
              <i class="fa-solid fa-wheat-awn"></i>
            </div>
            <div>
              <h3>MandiConnect AI • Digital Mandi Pass</h3>
              <p>Ministry of Consumer Affairs, Food & Public Distribution</p>
            </div>
          </div>

          <div class="pass-body">
            <div class="token-large-badge">{{ selectedFarmerModal.tokenNo }}</div>

            <div class="pass-grid">
              <div class="pass-field">
                <span>Farmer ID</span>
                <strong>{{ selectedFarmerModal.id }}</strong>
              </div>
              <div class="pass-field">
                <span>Farmer Name</span>
                <strong>{{ selectedFarmerModal.name }}</strong>
              </div>
              <div class="pass-field">
                <span>Registration No</span>
                <strong>{{ selectedFarmerModal.regNo }}</strong>
              </div>
              <div class="pass-field">
                <span>Village / District</span>
                <strong>{{ selectedFarmerModal.village }}, {{ selectedFarmerModal.district }}</strong>
              </div>
              <div class="pass-field">
                <span>Phone Mobile</span>
                <strong>{{ selectedFarmerModal.mobile }}</strong>
              </div>
              <div class="pass-field">
                <span>Crop & Quantity</span>
                <strong>{{ selectedFarmerModal.cropType }} ({{ selectedFarmerModal.quantityQuintals }} Quintals)</strong>
              </div>
              <div class="pass-field">
                <span>Assigned Mandi</span>
                <strong>{{ selectedFarmerModal.centreName }}</strong>
              </div>
              <div class="pass-field">
                <span>Scheduled Slot</span>
                <strong>{{ selectedFarmerModal.scheduledSlot }}</strong>
              </div>
            </div>
          </div>

          <div class="modal-footer flex-between mt-4">
            <button class="btn btn-secondary" (click)="selectedFarmerModal = null">Close</button>
            <button class="btn btn-primary" (click)="printTokenPass()">
              <i class="fa-solid fa-print"></i> Print Gate Pass
            </button>
          </div>
        </div>
      </div>

      <!-- Reassign Mandi Centre Modal -->
      <div class="modal-overlay" *ngIf="reassignModalFarmer">
        <div class="modal-card">
          <div class="modal-header flex-between mb-4">
            <h2><i class="fa-solid fa-arrows-rotate text-gold"></i> Reassign Procurement Mandi Centre</h2>
            <button class="btn-close" (click)="reassignModalFarmer = null">&times;</button>
          </div>
          <div class="modal-body">
            <p>Reassigning procurement slot for farmer <strong>{{ reassignModalFarmer.name }}</strong> ({{ reassignModalFarmer.tokenNo }}).</p>

            <div class="info-box mt-3 mb-3">
              <div><strong>Current Mandi:</strong> {{ reassignModalFarmer.centreName }}</div>
              <div><strong>Crop:</strong> {{ reassignModalFarmer.cropType }} ({{ reassignModalFarmer.quantityQuintals }} Qtl)</div>
            </div>

            <div class="form-group">
              <label>Select Target Mandi Centre:</label>
              <select [(ngModel)]="targetReassignCentreId">
                <option *ngFor="let c of centres" [value]="c.id" [disabled]="c.id === reassignModalFarmer.centreId">
                  {{ c.name }} ({{ c.district }}) — {{ c.capacityUtilization }}% Utilized
                </option>
              </select>
            </div>
          </div>

          <div class="modal-footer flex-between mt-4">
            <button class="btn btn-secondary" (click)="reassignModalFarmer = null">Cancel</button>
            <button class="btn btn-accent" (click)="confirmReassignment()">
              <i class="fa-solid fa-check"></i> Confirm Reassignment
            </button>
          </div>
        </div>
      </div>

      <!-- Register Farmer Modal -->
      <div class="modal-overlay" *ngIf="showRegisterModal">
        <div class="modal-card">
          <div class="modal-header flex-between mb-4">
            <h2><i class="fa-solid fa-user-plus text-primary"></i> Register Farmer for Procurement Slot</h2>
            <button class="btn-close" (click)="showRegisterModal = false">&times;</button>
          </div>
          <form (ngSubmit)="submitNewFarmer()">
            <div class="form-grid">
              <div class="form-group">
                <label>Farmer Name</label>
                <input type="text" [(ngModel)]="newFarmer.name" name="name" required placeholder="e.g. Ramesh Kumar" />
              </div>
              <div class="form-group">
                <label>Phone Mobile</label>
                <input type="text" [(ngModel)]="newFarmer.mobile" name="mobile" required placeholder="+91 98000 00000" />
              </div>
              <div class="form-group">
                <label>Village</label>
                <input type="text" [(ngModel)]="newFarmer.village" name="village" required placeholder="e.g. Rampur" />
              </div>
              <div class="form-group">
                <label>District</label>
                <select [(ngModel)]="newFarmer.district" name="district" (change)="onDistrictChange()">
                  <option value="Karnal">Karnal</option>
                  <option value="Panipat">Panipat</option>
                  <option value="Kurukshetra">Kurukshetra</option>
                  <option value="Ambala">Ambala</option>
                  <option value="Sonipat">Sonipat</option>
                </select>
              </div>
              <div class="form-group">
                <label>Crop Category</label>
                <select [(ngModel)]="newFarmer.cropType" name="cropType">
                  <option value="Paddy">Paddy</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Chana">Chana</option>
                </select>
              </div>
              <div class="form-group">
                <label>Est. Quantity (Quintals)</label>
                <input type="number" [(ngModel)]="newFarmer.quantityQuintals" name="quantityQuintals" required placeholder="42.5" />
              </div>
              <div class="form-group col-span-2">
                <label>Preferred Procurement Centre</label>
                <select [(ngModel)]="newFarmer.centreId" name="centreId">
                  <option *ngFor="let c of centres" [value]="c.id">{{ c.name }} ({{ c.district }})</option>
                </select>
              </div>
            </div>

            <div class="modal-footer flex-between mt-4">
              <button type="button" class="btn btn-secondary" (click)="showRegisterModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-check"></i> Register & Issue Queue Token
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Edit Farmer Modal -->
      <div class="modal-overlay" *ngIf="editFarmerModal">
        <div class="modal-card">
          <div class="modal-header flex-between mb-4">
            <h2><i class="fa-solid fa-pen text-primary"></i> Edit Farmer Profile</h2>
            <button class="btn-close" (click)="editFarmerModal = null">&times;</button>
          </div>
          <form (ngSubmit)="saveFarmerEdit()">
            <div class="form-grid">
              <div class="form-group">
                <label>Farmer Name</label>
                <input type="text" [(ngModel)]="editFarmerData.name" name="editName" required />
              </div>
              <div class="form-group">
                <label>Mobile Number</label>
                <input type="text" [(ngModel)]="editFarmerData.mobile" name="editMobile" required />
              </div>
              <div class="form-group">
                <label>Village</label>
                <input type="text" [(ngModel)]="editFarmerData.village" name="editVillage" required />
              </div>
              <div class="form-group">
                <label>District</label>
                <input type="text" [(ngModel)]="editFarmerData.district" name="editDistrict" required />
              </div>
              <div class="form-group">
                <label>Crop Category</label>
                <input type="text" [(ngModel)]="editFarmerData.cropType" name="editCrop" required />
              </div>
              <div class="form-group">
                <label>Quantity (Quintals)</label>
                <input type="number" [(ngModel)]="editFarmerData.quantityQuintals" name="editQuantity" required />
              </div>
            </div>

            <div class="modal-footer flex-between mt-4">
              <button type="button" class="btn btn-secondary" (click)="editFarmerModal = null">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fa-solid fa-check"></i> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      gap: 14px;
      align-items: center;
      background: #ffffff;
      padding: 16px 20px;
      border: 1px solid var(--border-card);
      border-radius: var(--radius-lg);
      margin-bottom: 24px;
      box-shadow: var(--shadow-sm);
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8faf9;
      border: 1px solid var(--border-light);
      padding: 8px 14px;
      border-radius: 8px;
    }

    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 0.875rem;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    .filter-group select {
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-light);
      outline: none;
      background: #ffffff;
      font-size: 0.85rem;
    }

    .farmer-title {
      font-size: 0.925rem;
      color: var(--slate-900);
    }

    .crop-tag {
      background: var(--primary-50);
      color: var(--primary-700);
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.775rem;
      font-weight: 700;
    }

    .token-pill {
      background: #fef3c7;
      color: #b45309;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.8rem;
    }

    .reassign-link {
      background: none;
      border: none;
      color: var(--gold-600);
      font-size: 0.725rem;
      font-weight: 700;
      cursor: pointer;
      padding: 2px 0;
      display: block;
      margin-top: 2px;
    }

    .reassign-link:hover {
      text-decoration: underline;
      color: #b45309;
    }

    .table-actions {
      display: flex;
      gap: 6px;
    }

    .info-box {
      background: #f8faf9;
      border-left: 3px solid var(--primary-600);
      padding: 10px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
    }

    /* Token Pass Styling */
    .token-pass-card {
      border-top: 6px solid var(--primary-700);
    }

    .pass-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-light);
    }

    .pass-gov-logo {
      width: 42px;
      height: 42px;
      background: var(--primary-700);
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .pass-header h3 {
      font-size: 1.05rem;
      color: var(--slate-900);
    }

    .pass-header p {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .token-large-badge {
      text-align: center;
      font-size: 2.2rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: var(--primary-700);
      background: var(--primary-50);
      border: 2px dashed var(--primary-500);
      padding: 12px;
      border-radius: 12px;
      margin: 16px 0;
    }

    .pass-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      background: #f8faf9;
      padding: 16px;
      border-radius: 12px;
    }

    .pass-field {
      display: flex;
      flex-direction: column;
    }

    .pass-field span {
      font-size: 0.7rem;
      color: var(--text-muted);
      text-transform: uppercase;
    }

    .pass-field strong {
      font-size: 0.875rem;
      color: var(--text-main);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .col-span-2 {
      grid-column: span 2;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--slate-900);
    }

    .form-group input, .form-group select {
      padding: 9px 12px;
      border-radius: 8px;
      border: 1px solid var(--border-light);
      font-size: 0.875rem;
      outline: none;
    }

    .btn-close { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #64748b; }
    .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .mt-4 { margin-top: 16px; }
    .mt-3 { margin-top: 12px; }
    .mt-1 { margin-top: 4px; }
    .mb-4 { margin-bottom: 16px; }
    .mb-3 { margin-bottom: 12px; }
    .text-xs { font-size: 0.75rem; }
    .font-semibold { font-weight: 600; }
  `]
})
export class FarmersComponent implements OnInit {
  farmers: Farmer[] = [];
  centres: ProcurementCentre[] = [];
  searchQuery: string = '';
  selectedCrop: string = 'ALL';
  selectedDistrict: string = 'ALL';
  selectedStatus: string = 'ALL';

  selectedFarmerModal: Farmer | null = null;
  editFarmerModal: Farmer | null = null;
  reassignModalFarmer: Farmer | null = null;
  showRegisterModal: boolean = false;

  editFarmerData: Partial<Farmer> = {};
  targetReassignCentreId: string = '';

  newFarmer = {
    name: '',
    mobile: '',
    village: '',
    district: 'Karnal',
    landAcres: 8.5,
    cropType: 'Paddy',
    quantityQuintals: 42.5,
    centreId: 'CTR-001'
  };

  constructor(private procurementService: ProcurementService) {}

  ngOnInit() {
    this.procurementService.getFarmers().subscribe(data => this.farmers = data);
    this.procurementService.getCentres().subscribe(data => {
      this.centres = data;
      if (data.length > 0 && !this.newFarmer.centreId) {
        this.newFarmer.centreId = data[0].id;
      }
    });
  }

  get filteredFarmers(): Farmer[] {
    return this.farmers.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            f.regNo.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            f.id.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            f.village.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            f.mobile.includes(this.searchQuery) ||
                            f.tokenNo.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCrop = this.selectedCrop === 'ALL' || f.cropType === this.selectedCrop;
      const matchesDistrict = this.selectedDistrict === 'ALL' || f.district === this.selectedDistrict;
      const matchesStatus = this.selectedStatus === 'ALL' || f.status === this.selectedStatus;
      return matchesSearch && matchesCrop && matchesDistrict && matchesStatus;
    });
  }

  openPassModal(farmer: Farmer) {
    this.selectedFarmerModal = farmer;
  }

  openEditFarmerModal(farmer: Farmer) {
    this.editFarmerModal = farmer;
    this.editFarmerData = { ...farmer };
  }

  openReassignModal(farmer: Farmer) {
    this.reassignModalFarmer = farmer;
    const available = this.centres.find(c => c.id !== farmer.centreId);
    this.targetReassignCentreId = available ? available.id : this.centres[0]?.id;
  }

  confirmReassignment() {
    if (this.reassignModalFarmer && this.targetReassignCentreId) {
      this.procurementService.reassignFarmer(this.reassignModalFarmer.id, this.targetReassignCentreId);
      this.reassignModalFarmer = null;
    }
  }

  saveFarmerEdit() {
    if (this.editFarmerModal) {
      this.procurementService.updateFarmer(this.editFarmerModal.id, this.editFarmerData);
      this.editFarmerModal = null;
    }
  }

  printTokenPass() {
    window.print();
  }

  onDistrictChange() {
    const matchingCentre = this.centres.find(c => c.district === this.newFarmer.district);
    if (matchingCentre) {
      this.newFarmer.centreId = matchingCentre.id;
    }
  }

  submitNewFarmer() {
    const chosenCentre = this.centres.find(c => c.id === this.newFarmer.centreId) || this.centres[0];
    const statePrefix = chosenCentre.state === 'Haryana' ? 'HR' : 'PB';

    this.procurementService.addFarmer({
      regNo: `${statePrefix}-${chosenCentre.district.substring(0, 3).toUpperCase()}-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      name: this.newFarmer.name,
      village: this.newFarmer.village,
      district: this.newFarmer.district,
      state: chosenCentre.state || 'Haryana',
      mobile: this.newFarmer.mobile,
      landAcres: this.newFarmer.landAcres,
      cropType: this.newFarmer.cropType,
      quantityQuintals: this.newFarmer.quantityQuintals,
      scheduledSlot: 'Today, 02:30 PM',
      centreId: chosenCentre.id,
      centreName: chosenCentre.name
    });

    this.showRegisterModal = false;
    this.newFarmer.name = '';
    this.newFarmer.village = '';
    this.newFarmer.mobile = '';
  }
}
