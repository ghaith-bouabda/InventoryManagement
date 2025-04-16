import { Injectable } from '@angular/core';
import SockJS from 'sockjs-client';
import { Client, Stomp } from '@stomp/stompjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;

  constructor() {
    this.stompClient = new Client({
      webSocketFactory: () => {
        const token = localStorage.getItem("token");

        const socket = new SockJS('http://localhost:8080/ws');
        console.log(socket)
        socket.onopen = () => {
          socket.send(JSON.stringify({ Authorization: `Bearer ${token}` }));
        };
        return socket;
      },
      debug: (str) => {
        console.log('STOMP debug:', str);
      },
      reconnectDelay: 5000,
      onConnect: (frame) => {
        console.log('Connected: ', frame);
        this.stompClient.subscribe('/topic/lowStock', (message) => {
          if (message.body) {
            alert('📦 ' + message.body);
          }
        });
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      }
    });
  }

  connect(): void {
    this.stompClient.activate();
  }

  disconnect(): void {
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  checkLowStock(product: any): String {
    if (product.stockQuantity <= product.stockThreshold) {
      if (this.stompClient && this.stompClient.connected) {
        this.stompClient.publish({
          destination: '/app/check-low-stock',
          body: JSON.stringify(product) // Send product data for low stock check
        });

      } else {
        console.warn('STOMP client is not connected');

      }
    }
    return('Low stock detected:'+ product.name);
  }


}
