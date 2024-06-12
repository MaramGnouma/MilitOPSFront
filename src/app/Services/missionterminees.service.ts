import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Missionterminees } from '../Models/missionterminees';

@Injectable({
  providedIn: 'root'
})
export class MissiontermineesService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getMissionsTerminnees(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missionsT`);
  }

  getMissionTermineeById(missionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missionsT/${missionId}`);
  }

  deleteMissionTerminee(missionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deletemissionsT/${missionId}`);
  }

  getMissionsTerminneesByUserId(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/missionsT/${userId}`);
  }

  updateMissionTerminee(missionId: string, missionData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/missionsT/${missionId}`, missionData);
  }

  getEquipementStatsForMission(missionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missionsT/eq/${missionId}`);
  }

  getIntervenantsFromMission(missionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missionsT/soldats/${missionId}`);
  }
}
