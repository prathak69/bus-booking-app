import { Component, effect, inject, signal } from '@angular/core';
import { Master } from '../../service/master';
import { OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-search',
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements OnInit {
  apiService = inject(Master)
  locations = signal<any[]>([])
  loading = signal(true)
  busList = signal<any[]>([]);

  serachObj: any = {
    fromLocation: '',
    toLocation: '',
    travelDate: ''
  };

  ngOnInit(): void {
    this.getLocation()
  }



  getLocation() {
    this.apiService.getAllLocation().subscribe({
      next: (res: any) => {
        const clearedRes = res.filter((item: any) => item.locationId != null && (item.locationName.length > 0))
        this.locations.set(clearedRes)
        this.loading.set(false)
      },
      error: (err) => {
        console.log('Error fetching location: ', err)
        this.loading.set(false)
      },
      complete: () => {
        console.log('Locations fetched successfully')
      }
    })
  }

  onSearch(){
    this.loading.set(true)
    
    this.apiService.searchBus(this.serachObj).subscribe({
      next : (res:any) => {
        this.busList.set(res);
        this.loading.set(false);
      },
      error: (err) =>{
        console.log("Error fetching bus details", err);
      this.loading.set(false);
      },
      complete: ()=>{
        console.log("Bus details fetched successfully")
      }
    })
  }

  bookSeat(scheduleId: any){
    console.log(scheduleId)
  }

}