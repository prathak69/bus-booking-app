import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Master } from '../../service/master';

@Component({
  selector: 'app-booking',
  imports: [],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements OnInit {
  scheduleId = signal<Number>(0)
  scheduleData = signal<any>({})
  seatArray  = signal<Number[]>([])
  bookedSeatArray = signal<Number[]>([]);

  activatedRoute = inject(ActivatedRoute)
  apiService = inject(Master)

ngOnInit(): void {
  this.activatedRoute.params.subscribe((res:any)=>{
    this.scheduleId.set(res.id)
    console.log("ID: ", this.scheduleId())
    this.getBusScheduleById()
  })
}

  getBusScheduleById(){
    this.apiService.getBusScheduleById(this.scheduleId()).subscribe({
      next: (res:any)=>{
        this.scheduleData.set(res)
        if(this.scheduleData().totalSeats > 0){
          const seats: Number[] = [];

          for(let i = 1; i<= this.scheduleData().totalSeats; i++){
            seats.push(i);
          }

          this.seatArray.set(seats)
        }
      },
      error: (err)=>{
        console.log("Error fetching Bus schedule by id", err);
      },
      complete: ()=>{
        console.log("Fetched bus schedule by id successfully!");
      }
    })
  }

  getBookedSeats(){
    this.apiService.getBookedSeats(this.scheduleId).subscribe({
      next: (res:any)=>{
        this.bookedSeatArray.set(res)
      },
      error: (err)=>{
        console.log("Error fetching booked seats", err);
      },
      complete: ()=>{
        console.log("Fetched booked seats properly");
      }
    })
  }

  checkedBookedSeat(seatNo:any){
    return this.bookedSeatArray().includes(seatNo);
  }

}

