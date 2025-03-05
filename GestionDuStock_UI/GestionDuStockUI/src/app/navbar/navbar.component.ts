import { Component, type OnInit } from "@angular/core"
import  { Router } from "@angular/router"
import{ AuthControllerService } from "../services/services/auth-controller.service"
import { User } from "../services/models/user"

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null
  isAdmin = false

  constructor(
    private router: Router,
    private authService: AuthControllerService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user: User | null) => {
      this.currentUser = user
      this.isAdmin = this.authService.isAdmin()
    })
  }

  logout(): void {
    }

}

