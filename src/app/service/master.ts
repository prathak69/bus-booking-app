import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Master {

  baseUrl: string = 'https://projectapi.gerasim.in/api/BusBooking/';

  http = inject(HttpClient);

  getAllLocation() {
    return this.http.get(this.baseUrl + 'GetBusLocations')
  }

  searchBus(data:any) {
    const params = {
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      travelDate: data.travelDate,
    }
    return this.http.get(this.baseUrl + 'searchBus2', { params });
  }

  getBusScheduleById(id:any){
    const params= {
      id:id
    }
    return this.http.get(this.baseUrl+'GetBusScheduleById', {params})
  }

  getBookedSeats(scheduleId: any) {
    const params = {
      shceduleId: scheduleId
    };
    return this.http.get(this.baseUrl + 'getBookedSeats', { params });
  }

  addNewUser(registerObj:any){
    return this.http.post(this.baseUrl+'AddNewUser', registerObj)
  }

  login(loginObj:any){
    return this.http.post(this.baseUrl+'login', loginObj)
  }

  postBusBooking(bookingObj:any){
    return this.http.post(this.baseUrl+'PostBusBooking', bookingObj)
  }
}
