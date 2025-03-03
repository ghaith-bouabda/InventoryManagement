import { Injectable } from '@angular/core';
import {JwtHelperService} from "@auth0/angular-jwt";
import {jwtDecode} from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  set token(token: string) {
    localStorage.setItem('token', token);
  }

  get token() {
    return localStorage.getItem('token') as string;
  }

  isTokenValid() {
    const token = this.token;
    if (!token) {
      return false;
    }
    const jwtHelper = new JwtHelperService();
    const isTokenExpired = jwtHelper.isTokenExpired(token);
    if (isTokenExpired) {
      localStorage.clear();
      return false;
    }
    return true;
  }

  isTokenExpired() {
    return !this.isTokenValid();
  }
  decodeToken(): any {
    if (!this.token) return null;
    try {
      return jwtDecode(this.token);
    } catch (error) {
      console.error('Invalid token', error);
      return null;
    }
  }
}
