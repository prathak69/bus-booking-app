import { computed, inject, Injectable, signal } from '@angular/core';
import { Master } from './master';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

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

login(credentials: any ): Observable<any> {
    return this.apiService.login(credentials).pipe(
      tap((res: any) => {
        if (res.result) {
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(res.data));
          this.currentUser.set(res.data);
        }
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
}
