import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/Services/auth.service';
import { ModelService } from 'src/app/Services/model.service';
import Swal from 'sweetalert2';
import { ForgetComponent } from '../forget/forget.component';
import { AuthInterceptorService } from 'src/app/Services/auth-interceptor.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent  implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  userForm!: FormGroup;
  submitted = false;
  isEmailValid: boolean = true;
  isEmailEmptyTouched: boolean = false;
  ispassEmptyTouched: boolean = false;

myScriptElement!:HTMLScriptElement;
  role: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private modalService: ModelService,
    private modalService22: NgbModal,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private userserice2: AuthInterceptorService
  ) {

  }

  ngOnInit(): void {


  }

  //get f() { return this.userForm.controls; }

  ValidateEmail = (email: any) => {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]+$/;
    return validRegex.test(email);
  }
  hidePassword: boolean = true;

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  isEmailEmpty(email: string): boolean {
    return this.isEmailEmptyTouched && !email.trim();
  }
  ispasswordEmpty(email: string): boolean {
    return this.ispassEmptyTouched && !this.password.trim();
  }


  openAddSmartwatchModal() {
    const dialogRef = this.dialog.open(ForgetComponent, {
      // Set properties directly in the MatDialogConfig object
      width: '500px', // Set width as an example
      // Other properties if needed
    });  }

  forgotPassword(): void {
    this.modalService.openPasswordResetDialog();
  }

  login(): void {
    const userDetails = { email: this.email, password: this.password };
    this.authService.login(userDetails).subscribe(
      (response) => {
        if (response.message === 'success') {
          console.log("Login successful", response);
          localStorage.setItem('currentUser', JSON.stringify(response.user));

          // Check the status of the user
          if (response.user.status === 'En attente') {
            Swal.fire({
              icon: "warning",
              title: "Account Pending",
              text: "Your account is still pending approval. Please wait for approval before accessing the system.",
              footer: 'Contact support for assistance.'
            }).then(() => {
              this.email='';
              this.password='' // Réinitialiser le formulaire
            });
          } else {
            Swal.fire({
              position: "top-end",
              icon: "success",
              title: "You are now logged in as " + response.user.name,
              showConfirmButton: false,
              timer: 1500
            });
            if (response.user.role === 'Supervisor') {
              this.router.navigate(["/responsable/dash"]);
            } else if (response.user.role === 'Controller') {
              this.router.navigate(["/controleur"]);
            }
          }
        } else if (response.message === 'unauthenticated') {
          console.error('Unauthenticated:', response);
          Swal.fire({
            icon: "info",
            title: "Unauthenticated",
            text: "Your credentials are invalid or your session has expired.",
            footer: 'Please login again.'
          });
        } else {
          console.error("Invalid login response:", response);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "An error occurred during login.",
            footer: 'Please try again later.'
          });
        }
      },
      (error: any) => {
        console.error("Login failed:", error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please fill all the fields.",
          footer: 'Please try again later.'
        });
      }
    );
  }



}
