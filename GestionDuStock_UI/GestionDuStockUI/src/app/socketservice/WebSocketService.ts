import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Stomp } from '@stomp/stompjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;

  constructor(private toast: ToastrService) {
    this.stompClient = new Client({
      webSocketFactory: () => {
        const token = localStorage.getItem("token");

        const socket = new SockJS('http://localhost:8080/ws');  // WebSocket URL
        console.log(socket);

        socket.onopen = () => {
          socket.send(JSON.stringify({ Authorization: `Bearer ${token}` })); // Token sent here
        };

        return socket;
      },
      debug: (str) => {
        console.log('STOMP debug:', str);
      },
      reconnectDelay: 5000,  // Retry after 5 seconds if disconnected
      onConnect: (frame) => {
        console.log('Connected:', frame);
        // Subscribe to the topic for low stock notifications
        this.stompClient.subscribe('/topic/lowStock', (message) => {
          if (message.body) {
            this.showwarning(message.body); // Display the low stock message
          }
        });
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      }
    });
  }

  connect(): void {
    this.stompClient.activate();  // Activate the connection to the WebSocket
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();  // Deactivate the WebSocket connection
    }
  }

  showwarning(msg: string) {
    this.toast.warning(msg);  // Show a warning toast
  }


}
