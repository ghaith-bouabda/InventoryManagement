import { Component, type OnInit } from "@angular/core"
import { AuthControllerService } from "../services/services/auth-controller.service"

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  isAdmin = false

  constructor(private authService: AuthControllerService) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin()
  }
}

