import {inject, Injectable} from '@angular/core';
import {CanActivateFn, Router} from "@angular/router";
import {TokenService} from "../token/token.service";


export const AuthguardService : CanActivateFn = () => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  if (tokenService.isTokenExpired()) {
    router.navigate(['login']);
    return false;
  }
  return true;
};
