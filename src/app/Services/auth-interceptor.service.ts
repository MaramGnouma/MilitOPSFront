import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService  {

  private loggedInUserSubject = new BehaviorSubject<any>(null);
  loggedInUser$ = this.loggedInUserSubject.asObservable();

  constructor() { }

  setLoggedInUser(user: any) {
    this.loggedInUserSubject.next(user);
  }
}
