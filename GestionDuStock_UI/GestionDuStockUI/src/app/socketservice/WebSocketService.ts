import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client | null = null;
  private subscription: StompSubscription | null = null;
  private isConnected = false;

  constructor(private toast: ToastrService) {}

  connect(): void {
    if (this.isConnected) return;

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      reconnectDelay: 5000,
      onConnect: () => {
        this.isConnected = true;
        // Clear any existing subscription
        if (this.subscription) {
          this.subscription.unsubscribe();
        }
        // Create new subscription
        this.subscription = this.stompClient!.subscribe('/topic/lowStock', (message) => {
          this.toast.warning(message.body, 'Low Stock Alert', {
            timeOut: 1000,
            progressBar: true
          });
        });
      },
      onDisconnect: () => {
        this.isConnected = false;
      }
    });

    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient && this.isConnected) {
      this.stompClient.deactivate().then(() => {
        this.isConnected = false;
        this.subscription = null;
      });
    }
  }
}
