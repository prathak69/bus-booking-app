import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Master } from '../../service/master';
import { Auth } from '../../service/auth';
import { CommonModule } from '@angular/common';
import { timer, switchMap, catchError, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.scss',
})
export class Bookings implements OnInit {
  apiService = inject(Master);
  authService = inject(Auth);
  private destroyRef = inject(DestroyRef);

  bookings = signal<any[]>([]);
  isLoading = signal(false);
  isRefreshing = signal(false);
  errorMessage = signal('');
  currentUser: any = null;

  ngOnInit(): void {
    const raw = this.authService.currentUser();
    if (raw) {
      this.currentUser = raw;
      this.startPolling();
    }
  }

  startPolling() {
    if (!this.currentUser.userId) {
      return;
    }

    if (this.bookings().length === 0) {
      this.isLoading.set(true);
    }

    timer(0, 5000)
      .pipe(
        switchMap(() =>
          this.apiService.getAllBusBookings(this.currentUser.userId).pipe(
            catchError((err) => {
              console.log('Error while loading bus schedule');
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        if (res !== null) {
          this.bookings.set(res || []);
          this.errorMessage.set('');
        } else if (this.bookings().length === 0) {
          this.errorMessage.set('Failed to load bookings');
        }
        this.isLoading.set(false);
        this.isRefreshing.set(false);
      });
  }

  // Manual refresh option
  getAllBusBookings() {
    if (!this.currentUser?.userId) {
      return;
    }
    this.isRefreshing.set(true);
    this.apiService.getAllBusBookings(this.currentUser.userId).subscribe({
      next: (res: any) => {
        this.bookings.set(res || []);
        this.errorMessage.set('');
        this.isRefreshing.set(false);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error while fetching bus bookings', err);
        this.errorMessage.set('Failed to load bookings');
        this.isRefreshing.set(false);
        this.isLoading.set(false);
      },
    });
  }
}
