import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Master } from '../../service/master';
import { Auth } from '../../service/auth';

export interface BusLocation {
  locationId: number;
  locationName: string;
  code?: string;
}

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './schedule.html',
  styleUrl: './schedule.scss',
})
export class Schedule implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(Master);
  private authService = inject(Auth);
  private fb = inject(FormBuilder);

  currentUser: any;
  scheduledBusDetails = signal<any>(null)

  busScheduleForm = this.fb.group({
    scheduleId: 0,
    vendorId: 0,
    busName: ['', Validators.required],
    busVehicleNo: ['', Validators.required],
    fromLocation: ['', Validators.required],
    toLocation: ['', Validators.required],
    departureTime: ['', Validators.required],
    arrivalTime: ['', Validators.required],
    scheduleDate: ['', Validators.required],
    price: ['', Validators.required],
    totalSeats: ['', Validators.required],
  });

  locations = signal<BusLocation[]>([]);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser = user;
      this.busScheduleForm.patchValue({
        vendorId: Number(user.userId) || 0,
      });
    }
    this.getLocations();
  }

  getLocations() {
    this.apiService.getAllLocation().subscribe({
      next: (res: any) => {
        const filteredLocations = res.filter(
          (item: any) =>
            item.locationName &&
            item.locationName.trim() !== '' &&
            item.locationName.trim().toLowerCase() !== 'string',
        );
        this.locations.set(filteredLocations);
      },
      error: (err) => {
        console.log('Error while loding locations');
      },
      complete: () => {
        console.log('Completed loading location');
      },
    });
  }

  submitBusForm(): void {
    this.apiService.postBusSchedule(this.busScheduleForm.value).subscribe({
      next: (res: any) => {
        this.scheduledBusDetails.set(res)
        console.log('res: ', this.scheduledBusDetails());
      },
      error: (err) => {
        console.log('Error while adding bus schedule', err);
      },
      complete: () => {
        console.log('Bus Schedule Posted');
        this.busScheduleForm.reset();
      },
    });
  }
}
