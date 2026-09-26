import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Master } from '../../service/master';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements OnInit {

  scheduleId = signal<Number>(0);
  scheduleData = signal<any>({});
  seatArray = signal<Number[]>([]);
  bookedSeatArray = signal<Set<number>>(new Set());
  selectedSeatArray = signal<any[]>([]);
  bookingData = signal<any>(null);

  activatedRoute = inject(ActivatedRoute);
  apiService = inject(Master);
  fb = inject(FormBuilder);

  bookingForm: FormGroup = this.fb.group({
    bookingId: [0],
    custId: [0],
    bookingDate: [new Date()],
    scheduleId: [0],
    BusBookingPassengers: this.fb.array([])
  });

  get passengers(): FormArray {
    return this.bookingForm.get('BusBookingPassengers') as FormArray;
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((res: any) => {
      this.scheduleId.set(res.id);
      console.log("ID: ", this.scheduleId());
      this.getBusScheduleById();
      this.getBookedSeats();
    });
  }

  getBusScheduleById() {
    this.apiService.getBusScheduleById(this.scheduleId()).subscribe({
      next: (res: any) => {
        this.scheduleData.set(res);
        if (this.scheduleData().totalSeats > 0) {
          const seats: Number[] = [];

          for (let i = 1; i <= this.scheduleData().totalSeats; i++) {
            seats.push(i);
          }

          this.seatArray.set(seats);
        }
      },
      error: (err) => {
        console.log("Error fetching Bus schedule by id", err);
      },
      complete: () => {
        console.log("Fetched bus schedule by id successfully!");
      }
    });
  }

  getBookedSeats() {
    this.apiService.getBookedSeats(this.scheduleId()).subscribe({
      next: (res: any) => {
        const seatNumbers = Array.isArray(res) ? res.map(Number) : [];
        this.bookedSeatArray.set(new Set(seatNumbers));
      },
      error: (err) => {
        console.log("Error fetching booked seats", err);
      },
      complete: () => {
        console.log("Fetched booked seats properly");
      }
    });
  }

  checkedBookedSeat(seatNo: any) {
    return this.bookedSeatArray().has(seatNo);
  }

  checkSeatSelected(seatNo: any) {
    return this.selectedSeatArray().includes(seatNo);
  }

  selectSeat(seatNo: any) {
    if (this.checkedBookedSeat(seatNo)) return;

    const passengerIndex = this.passengers.controls.findIndex(
      (control) => control.get('seatNo')?.value === seatNo
    );

    if (passengerIndex !== -1) {
      this.passengers.removeAt(passengerIndex);
      this.selectedSeatArray.update((seats) => seats.filter((s) => s !== seatNo));
    } else {
      const passengerGroup = this.fb.group({
        passengerId: [0],
        bookingId: [0],
        passengerName: [''],
        age: [0],
        gender: [''],
        seatNo: [seatNo]
      });
      this.passengers.push(passengerGroup);
      this.selectedSeatArray.update((seats) => [...seats, seatNo]);
    }
  }

  postBusBooking() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const loginData = JSON.parse(currentUser);
      const bookingObj = {
        bookingId: 0,
        custId: loginData.userId,
        bookingDate: new Date(),
        scheduleId: this.scheduleId(),
        BusBookingPassengers: this.bookingForm.value.BusBookingPassengers
      };
      this.apiService.postBusBooking(bookingObj).subscribe({
        next: (res) => {
          this.bookingData.set(res);
          this.getBookedSeats();
          this.passengers.clear();
          this.selectedSeatArray.set([]);
        },
        error: (err) => {
          console.log("Error: ", err);
        },
        complete: () => {
          console.log("Booking scheduled");
        }
      });
    }
  }
}
