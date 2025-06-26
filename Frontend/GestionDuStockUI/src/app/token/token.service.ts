import { Injectable } from '@angular/core';
import {JwtHelperService} from "@auth0/angular-jwt";
import {jwtDecode} from "jwt-decode";
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isTokenValid());
    isLoggedIn$ = this.isLoggedInSubject.asObservable();

  set token(token: string) {
    localStorage.setItem('token', token);
    this.isLoggedInSubject.next(true);
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedInSubject.next(false);
  }

  get token() {
    return localStorage.getItem('token') as string;
  }
  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.sub || decoded.username : null;
  }

  getRole(): string | null {
    const decoded = this.decodeToken();
    return decoded ? decoded.role : null;
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
