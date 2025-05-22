import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Stomp } from '@stomp/stompjs';
import { ToastrService } from 'ngx-toastr';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;
  private isConnected = false;
  private notificationCooldown = new Map<string, number>();
  private readonly COOLDOWN_PERIOD = 3600000; // 1 hour

  constructor(private toast: ToastrService) {
    this.stompClient = new Client({
      webSocketFactory: () => {
        const token = localStorage.getItem('token');
        const socket = new SockJS('http://localhost:8080/ws');
        socket.onopen = () => {
          socket.send(JSON.stringify({ Authorization: `Bearer ${token}` }));
        };
        return socket;
      },
      debug: (str) => console.log('STOMP debug:', str),
      reconnectDelay: 5000,
      onConnect: (frame) => {
        this.isConnected = true;
        this.stompClient.subscribe('/topic/lowStock', (message) => {
          this.handleLowStockNotification(message.body);
        });
      }
    });
  }

  private handleLowStockNotification(message: string): void {
    const now = Date.now();
    const lastNotificationTime = this.notificationCooldown.get(message) || 0;

    if (now - lastNotificationTime > this.COOLDOWN_PERIOD) {
      this.toast.warning(message, 'Low Stock Alert', {
        timeOut: 10000,
        progressBar: true,
        positionClass: 'toast-top-right'
      });
      this.notificationCooldown.set(message, now);
    }
  }

  connect(): void {
    if (!this.isConnected) {
      this.stompClient.activate();
    }
  }

  disconnect(): void {
    if (this.isConnected) {
      this.stompClient.deactivate();
    }
  }
}
