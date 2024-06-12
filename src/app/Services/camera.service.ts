import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Camera } from '../Models/camera';

@Injectable({
  providedIn: 'root'
})
export class CameraService {
  private baseUrl = 'http://localhost:5000'; // Update with your backend API base URL

  constructor(private http: HttpClient) { }

  createCamera(cameraData: Camera): Observable<Camera> {
    return this.http.post<Camera>(`${this.baseUrl}/cameras`, cameraData);
  }

  getCameras(): Observable<Camera[]> {
    return this.http.get<Camera[]>(`${this.baseUrl}/cameras`);
  }

  getCameraById(cameraId: string): Observable<Camera> {
    return this.http.get<Camera>(`${this.baseUrl}/cameras/${cameraId}`);
  }

  updateCamera(cameraId: string, updatedCameraData: Camera): Observable<Camera> {
    return this.http.put<Camera>(`${this.baseUrl}/cameras/${cameraId}`, updatedCameraData);
  }

  deleteCamera(cameraId: string): Observable<Camera> {
    return this.http.delete<Camera>(`${this.baseUrl}/cameras/${cameraId}`);
  }
}
