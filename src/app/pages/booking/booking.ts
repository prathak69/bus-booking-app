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
  bookedSeatArray = signal<Set<number>>(new Set());
  selectedSeatArray = signal<Set<number>>(new Set());

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
    this.apiService.getBookedSeats(this.scheduleId()).subscribe({
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
    return this.bookedSeatArray().has(seatNo);
  }

  checkSeatSelected(seatNo:any){
    return this.selectedSeatArray().has(seatNo);
  }

  selectSeat(seatNo:any){
    if(this.checkedBookedSeat(seatNo)) return;

    this.selectedSeatArray.update(currectSet => {
      const nextSet = new Set(currectSet);
      if(nextSet.has(seatNo)){
        nextSet.delete(seatNo);
      }else{
        nextSet.add(seatNo)
      }
      return nextSet;
  })

    // this.selectedSeatArray.update(seats => (
    //   seats.includes(seatNo) ?
    //   seats.filter(seat => seat != seatNo):
    //   [...seats, seatNo]
    // ))
  }

}

