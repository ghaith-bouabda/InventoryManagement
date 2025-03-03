import { Component } from '@angular/core';
import { AuthRequest } from "../services/models/auth-request";
import { AuthControllerService } from "../services/services/auth-controller.service";
import { Router } from "@angular/router";
import { TokenService } from "../token/token.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: false
})
export class LoginComponent {
  authReq: AuthRequest = { password: '', username: '' };
  errorMsg: Array<any> = [];

  constructor(
    private authService: AuthControllerService,
    private router: Router,
    private tokenService: TokenService,
    private userService: UserService,
  ) {}

  login() {
    this.errorMsg = [];
    const username = this.authReq.username;
    this.authService.authentication({ body: this.authReq }).subscribe({
      next: (res) => {
        this.tokenService.token = res.accessToken as string;
        this.userService.getUserDetails(<string>username).subscribe({
          next: (userDetails: any) => {
            localStorage.setItem('user', JSON.stringify(userDetails));
            this.router.navigate(['dashboard']);
          },
          error: (err: { error: { message: any; }; }) => {
            this.errorMsg.push(err.error?.message || 'Error loading user details');
          }
        });
      },
      error: (err) => {
        this.errorMsg.push(err.error?.message || 'Authentication failed');
      }
    });
  }

  register() {
    this.router.navigate(['register']);
  }
}
