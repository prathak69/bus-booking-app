import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth as AuthService } from '../../service/auth';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLogin = signal<boolean>(true);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  loginObj = {
    userName: '',
    password: '',
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
    refreshTokenExpiryTime: new Date(),
  };

  toggleMode(): void {
    this.isLogin.update((val) => !val);
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  onLogin(): void {
    if (!this.loginObj.userName || !this.loginObj.password) {
      this.errorMessage.set('Please enter both username and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.login(this.loginObj).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.result) {
          this.router.navigate(['/search']);
        } else {
          this.errorMessage.set(res.message || 'Login failed. Please check your credentials.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('An error occurred during login. Please try again.');
      },
    });
  }

  onRegister(): void {
    if (!this.registerObj.userName || !this.registerObj.password) {
      this.errorMessage.set('Username and password are required.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.register(this.registerObj).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res.result) {
          this.successMessage.set('Registration successful! Please log in.');
          this.isLogin.set(true);
          this.registerObj.password = '';
        } else {
          this.errorMessage.set(res.message || 'Registration failed. Username may already exist.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('An error occurred during registration. Please try again.');
      },
    });
  }

    createVendor(){
      if(!this.registerObj || !this.registerObj.password || !this.registerObj.emailId || !this.registerObj.fullName){
        alert("Please fill in all the details");
        return;
      }
      this.authService.createVendor(this.registerObj).subscribe({
        next: (res)=>{
          console.log("Vendor Created: ", res);
        },
        error: (err) =>{
          console.log("Vendor Creation Error: ", err);
        },
        complete: () =>{
          console.log("Vendor Created");
        }
      })
  }

}

/*

app.ts:46 Current User:  null
_debug_node-chunk.mjs:11046 Angular is running in development mode.
content.js:22 [SmartLens Content] Initializing...
content.js:438 [SmartLens] Content script loaded
auth.ts:108 Vendor Created:  Objectdata: nullmessage: "userName Already Exists"result: false[[Prototype]]: Object
auth.ts:114 Vendor Created
auth.ts:108 Vendor Created:  {message: 'Vendor Creation Success', result: true, data: {…}}data: createdDate: "2026-10-02T17:23:56.756Z"emailId: "test.test@gmail.com"fullName: "Test"password: "Test@12345"projectName: " BusBooking"refreshToken: ""refreshTokenExpiryTime: "2026-10-02T17:23:56.756Z"role: "Vendor"userId: 15408userName: "Test@69"[[Prototype]]: Objectmessage: "Vendor Creation Success"result: true[[Prototype]]: Object
auth.ts:114 Vendor Created

*/
