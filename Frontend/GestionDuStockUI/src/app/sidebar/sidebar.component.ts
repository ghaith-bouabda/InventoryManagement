import { Component, type OnInit } from "@angular/core"
import { AuthControllerService } from "../services/services/auth-controller.service"
import {Router} from '@angular/router';
import {TokenService} from '../token/token.service';

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  isAdmin = false
  isLoggedIn = false;
  constructor(private router: Router ,private authService: AuthControllerService,private tokenService:TokenService) {
  }


  ngOnInit(): void {
    this.authService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
    });

        this.tokenService.isLoggedIn$.subscribe(status => {
          this.isLoggedIn = status;
        });




  }


  logout() {
  this.authService.logout().subscribe({
    next: () => {
      localStorage.clear();
      this.router.navigate(['/login']); // Redirect to login page
    }});

  }
}


