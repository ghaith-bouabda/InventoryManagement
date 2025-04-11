import { Component, type OnInit } from "@angular/core"
import { AuthControllerService } from "../services/services/auth-controller.service"
import {Router} from '@angular/router';

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  isAdmin = false

  constructor(private router: Router ,private authService: AuthControllerService) {
  }

  ngOnInit(): void {


    this.isAdmin = this.authService.isAdmin()
  }

  logout() {
  this.authService.logout().subscribe({
    next: () => {
      localStorage.clear();
      this.router.navigate(['/login']); // Redirect to login page
    }});

  }
}


