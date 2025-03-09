import { Component } from '@angular/core';
import { AuthRequest } from "../services/models/auth-request";
import { AuthControllerService } from "../services/services/auth-controller.service";
import { Router } from "@angular/router";
import { TokenService } from "../token/token.service";
import {UserControllerService} from "../services/services/user-controller.service"
import {UserService} from "../user-service/user-service"

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
  ) {
    if (this.authService.isAuthenticated()) {
    this.router.navigate(["/"]);
  }
  }


  login() {
    this.errorMsg = [];
    const username = this.authReq.username;
    this.authService.authentication({ body: this.authReq }).subscribe({
      next: (res) => {
        this.tokenService.token = res.accessToken as string;
        var userDetails = this.authService.currentUserValue
        console.log(this.authService.isAdmin());
        localStorage.setItem('user', JSON.stringify(userDetails));
        this.router.navigate(['/']);
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
