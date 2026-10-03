import { computed, inject, Injectable, signal } from '@angular/core';
import { Master } from './master';
import { Router } from '@angular/router';
import { Observable, switchMap, map, catchError, of , tap} from 'rxjs';

export interface UserSession {
  userId: string;
  userName: string;
  email?: string;
  fullName?:string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
private apiService = inject(Master);
private router = inject(Router);
private readonly STORAGE_KEY = 'currentUser';

currentUser = signal<UserSession | null>(this.getUserFromStorage());
isLoggedIn = computed(() => this.currentUser() !== null);

getUserFromStorage():UserSession | null{
  const raw  = localStorage.getItem(this.STORAGE_KEY);
  if(!raw) return null;

  try{
    return JSON.parse(raw);
  }
  catch{
    localStorage.removeItem(this.STORAGE_KEY);
    return null;  
  }
}

  login(credentials: any): Observable<any> {
    return this.apiService.login(credentials).pipe(
      switchMap((res: any) => {
        if (res.result && res.data?.role === 'Customer') {
          // If customer login returned a vendorId (clash bug in backend API), resolve the true customer userId
          return this.apiService.getAllUsers().pipe(
            map((usersRes: any) => {
              const users = usersRes?.data || [];
              const matched = users.find(
                (u: any) =>
                  (u.userName && u.userName.toLowerCase() === res.data.userName?.toLowerCase()) ||
                  (u.emailId && u.emailId.toLowerCase() === res.data.emailId?.toLowerCase())
              );
              if (matched?.userId) {
                res.data.userId = matched.userId;
              }
              localStorage.setItem(this.STORAGE_KEY, JSON.stringify(res.data));
              this.currentUser.set(res.data);
              return res;
            }),
            catchError(() => {
              localStorage.setItem(this.STORAGE_KEY, JSON.stringify(res.data));
              this.currentUser.set(res.data);
              return of(res);
            })
          );
        } else if (res.result) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(res.data));
          this.currentUser.set(res.data);
          return of(res);
        }
        return of(res);
      })
    );
  }

  register(data: any): Observable<any> {
    return this.apiService.addNewUser(data);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  createVendor(data:any):Observable<any>{
    return this.apiService.createVendor(data).pipe(
      tap((res: any) => {
        if (res.result){
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(res.data));
          this.currentUser.set(res.data )
        }
      })
    );
  }
}
