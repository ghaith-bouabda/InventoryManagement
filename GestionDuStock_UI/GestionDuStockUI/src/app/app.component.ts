import { Component } from '@angular/core';
import {MessageService} from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor() {}
  title = 'GestionDuStockUI';
  get isLoggedIn(): boolean {
    return localStorage.getItem("token") !== null

  }

}
