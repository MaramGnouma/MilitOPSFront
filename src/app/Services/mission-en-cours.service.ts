import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Camera } from '../Models/camera';

@Injectable({
  providedIn: 'root'
})
export class MissionEnCoursService {

  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  createMission(missionData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/missions`, missionData);
  }

  getMissions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missions`);
  }

  getAllEquipmentsForMission(missionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missions/equipement/${missionId}`);
  }

  getMissionById(missionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missions/${missionId}`);
  }

  deleteMission(missionId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/deletemissions/${missionId}`);
  }
  updateMission(missionId: string, missiondata:any): Observable<any> {
    // Construction de l'URL avec le missionId fourni
    const url = `${this.apiUrl}/missions/${missionId}`;

    // Envoi de la requête PUT avec le résultat et la cause (si fournie)
    return this.http.put(url,missiondata);
  }

  getCountMissionTypes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mission-types/count`);
  }

  getCompletedMissions(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/missionsT`);
  }
  updateMissionResult(missionId: string, result: string,  rate: number,cause?: string): Observable<any> {
    // Construction de l'URL avec le missionId fourni
    const url = `${this.apiUrl}/missions/${missionId}/result`;

    // Envoi de la requête PUT avec le résultat et la cause (si fournie)
    return this.http.put(url, { result, cause, rate });
  }

  getMissionsByUserId(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/missions/${userId}`);
  }

  getIntervenantsByMissionId(missionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${missionId}/intervenants`);
  }
  getCamerasByMissionId(missionId: string): Observable<Camera> {
    const url = `${this.apiUrl}/missions/camera/${missionId}`;
    return this.http.get<Camera>(url);
  }

}
