import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users/getuser'; // Adjust if needed

  constructor(private http: HttpClient) {
  }

  getUserDetails(username: string): Observable<{ id: number, username: string }> {
    return this.http.get<User>(`${this.apiUrl}?Username=${username}`).pipe(
      map(user => ({id: user.id, username: user.username})) // Return both id and username
    );
  }
}
