import { Component, ElementRef, viewChild, signal, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Master } from './service/master';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{
  protected readonly title = signal('bus-booking-app');
  apiService = inject(Master);
  isLoginForm = signal(true);
  loggedUserdata = signal<any>(null);

  // Modern Angular signal query for the dialog element
  private readonly authModal = viewChild.required<ElementRef<HTMLDialogElement>>('authDialog');

  loginObj = {
    userName: '',
    password: ''
  };

  registerObj = {
    userId: 0,
    userName: '',
    emailId: '',
    fullName: '',
    role: 'Customer',
    createdDate: new Date(),
    password: '',
    projectName: 'BusBooking',
    refreshToken: '',
    refreshTokenExpiryTime: new Date()
  };

  ngOnInit(){
    const currentUser = localStorage.getItem('currentUser');
    if(currentUser){
      this.loggedUserdata.set(JSON.parse(currentUser));
    }

    console.log("Current User: ", this.loggedUserdata())
  }

  openModel(width: string = '750px', minHeight: string = '550px'): void {
    const dialog = this.authModal().nativeElement;
    
    // Set dimensions directly from TS
    dialog.style.width = width;
    dialog.style.maxWidth = '5 00px';
    dialog.style.margin = 'auto'; // keeps it centered

    dialog.showModal();
  }

  closeModel(): void {
    this.authModal().nativeElement.close(); 
  }

  // Closes dialog if user clicks outside the modal content on the backdrop
  onBackdropClick(event: MouseEvent): void {
    const dialog = this.authModal().nativeElement;
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= event.clientY &&
      event.clientY <= rect.top + rect.height &&
      rect.left <= event.clientX &&
      event.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      dialog.close();
    }
  }

  registerUser(): void {
    if (!this.registerObj.userName || !this.registerObj.password) {
      alert('Please fill in all required fields.');
      return;
    }

    // Refresh timestamps for the backend
    this.registerObj.createdDate = new Date();
    this.registerObj.refreshTokenExpiryTime = new Date();

    this.apiService.addNewUser(this.registerObj).subscribe({
      next: (res: any) => {
        if (res.result) {
          alert('Registration successful!');
          this.closeModel();
        } else {
          alert(res.message || 'Registration failed. The username may already be taken.');
        }
      },
      error: (err) => {
        console.error('Registration error:', err);
      }
    });
  }

  login(){
    this.apiService.login(this.loginObj).subscribe({
      next: (res: any) => {
        if (res.result) {
          alert('Login successful!');
          localStorage.setItem('currentUser', JSON.stringify(res.data));
          this.loggedUserdata.set(res.data)
          this.closeModel();
        } else {
          alert(res.message || 'Login failed. The username or password may be incorrect.');
        }
      },
      error: (err) => {
        console.error('Login error:', err);
      }
    });
  }

  logOut(){
    localStorage.removeItem('currentUser');
    this.loggedUserdata.set(null);
  }

}