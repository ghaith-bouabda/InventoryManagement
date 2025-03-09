import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GestionDuStockUI';
  get isLoggedIn(): boolean {
    return localStorage.getItem("token") !== null

  }
}
