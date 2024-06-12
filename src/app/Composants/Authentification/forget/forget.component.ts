import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'src/app/Services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forget',
  templateUrl: './forget.component.html',
  styleUrls: ['./forget.component.css']
})
export class ForgetComponent implements OnInit{
  email: string = '';

 constructor(private authService:AuthService,private dialogRef: MatDialogRef<ForgetComponent>) {}
  ngOnInit(): void {
  }

 closeDialog(): void {
   this.dialogRef.close();
 }

 resetPassword() {
   // Vérifier si le champ email est vide
   if (!this.email) {
     Swal.fire({
       text: "Please enter your email address.",
       icon: "warning"
     });
     return;
   }

   // Vérifier si l'email est au format correct en utilisant une expression régulière
   const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   if (!emailPattern.test(this.email)) {
     Swal.fire({
       text: "Please enter a valid email address.",
       icon: "error"
     });
     return;
   }

   // Logique pour réinitialiser le mot de passe
   this.authService.forgotPassword(this.email).subscribe(
     (response) => {
       console.log(response); // Gérer la réponse du backend ici
     },
     (error) => {
       console.error(error); // Gérer les erreurs ici
       alert('Error sending password reset link.');
     }
   );

   Swal.fire({
     title: 'Check email for reset link',
     text:
       'An email has been sent to your registered email address. Please check your email account and click on the reset link provided.',
     icon: 'success', // Utilisation de l'icône de succès pour une apparence positive
   });

   // Fermer la boîte de dialogue après avoir envoyé l'e-mail de réinitialisation
   this.closeDialog();
   console.log('Resetting password...');
 }
 }

