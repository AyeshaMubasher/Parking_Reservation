import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-change-password-page',
  templateUrl: './change-password-page.component.html',
  styleUrl: './change-password-page.component.css'
})
export class ChangePasswordPageComponent {
  isFormSubmitted: boolean = false
  public tooken: any; 
  public userData:any;

  changePasswordForm : FormGroup = new FormGroup({
    oldPassword: new FormControl('',[Validators.required]),
    newPassword: new FormControl('',[Validators.required]),
    confirmPassword: new FormControl('',[Validators.required])
  });

   constructor(private router:Router,private http:HttpClient, private cookie:CookieService, private toastr:ToastrService){
   }


   signOut(){
     this.cookie.delete("token")
     this.router.navigate(["/login"]);
   }
 
   ngOnInit(): void{
     
   }
 
   public Update(){
    if(this.changePasswordForm.value.newPassword==this.changePasswordForm.value.confirmPassword){
      const isFormValid = this.changePasswordForm.valid;
      console.log(!isFormValid)
      this.isFormSubmitted = !isFormValid;
      console.log(this.changePasswordForm.value);
      this.tooken=this.cookie.get("token")
      console.log("tooken from home ",this.tooken)
      const headers = new HttpHeaders({
        'Authorization' : `Bearer ${this.tooken}`
      })
      this.http.put(environment.domin+"/updatePassword",this.changePasswordForm.value,{headers}).subscribe((res: any)=>{
        console.log(res);
        this.router.navigate(["/home"])
        this.toastr.success("Password Successfully Updated!")
      },(error)=>{
        if (error.status == 402) {
          this.toastr.error("Incorrect old password")
        }
        else{
          this.toastr.error("Internal server error")
        }
      })
    }
    else{
      this.toastr.error("Incorrect confirm password")
    }
   }
}
