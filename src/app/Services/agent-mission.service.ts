import { Injectable } from '@angular/core';
 import { HttpClient } from '@angular/common/http';
 import { Observable } from 'rxjs';
import { AgentMission } from '../Models/agent-mission';
@Injectable({
  providedIn: 'root'
})
export class AgentMissionService {

  private apiUrl = 'http://localhost:5000/agents';

  constructor(private http: HttpClient) {}

  createUser(agent: AgentMission): Observable<AgentMission> {
    return this.http.post<AgentMission>(`${this.apiUrl}`, agent);
  }

  acceptUser(id: string): Observable<AgentMission> {
    return this.http.patch<AgentMission>(`${this.apiUrl}/${id}/accept`, {});
  }

  getAllUsers(): Observable<AgentMission[]> {
    return this.http.get<AgentMission[]>(this.apiUrl);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: any, agent: AgentMission): Observable<AgentMission> {
    return this.http.put<AgentMission>(`${this.apiUrl}/${id}`, agent);
  }

  getUserById(id: any): Observable<AgentMission> {
    return this.http.get<AgentMission>(`${this.apiUrl}/${id}`);
  }

  getUsersByRole(role: string): Observable<AgentMission[]> {
    return this.http.get<AgentMission[]>(`${this.apiUrl}/role/${role}`);
  }

  getUserByName(name: string): Observable<AgentMission[]> {
    return this.http.get<AgentMission[]>(`${this.apiUrl}/name/${name}`);
  }

  getUserNotifications(userId: string) {
    return this.http.get<any>(`${this.apiUrl}/notifications/${userId}`);
  }

  getMissionsByUser(id: any): Observable<any[]> { // Assumant que les missions sont de type 'any[]'
    return this.http.get<any[]>(`${this.apiUrl}/${id}/missions`);
  }

}
