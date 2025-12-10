import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-sign-up-page',
  templateUrl: './sign-up-page.component.html',
  styleUrl: './sign-up-page.component.css',
})

export class SignUpPageComponent  {

  isFormSubmitted: boolean = false
  signUpForm: FormGroup; 
   constructor(private router:Router,private http:HttpClient,private toastr: ToastrService,private cookie:CookieService){
    this.signUpForm = new FormGroup({
      UserName: new FormControl("",[Validators.required]),
      PhoneNumber: new FormControl("",[Validators.pattern(/^\+?\d{10,15}$/)]),
      email: new FormControl("",[Validators.required,Validators.email]),
      password: new FormControl("",[Validators.required])
    });
   }

   ngOnInit():void{
    if(this.cookie.check("token")){
      this.router.navigate(["/home"])
    }
  }

  onSubmit(){
    const isFormValid = this.signUpForm.valid;
    console.log(!isFormValid)
    this.isFormSubmitted = !isFormValid;
    if(isFormValid)
      {
        this.post();
        //this.router.navigate(["\login"]);
      }
    //console.log("form data",this.formData);
    console.log("Values: ",this.signUpForm.value);
  }
  public post(){
    this.http.post(environment.domin+'/addUser',this.signUpForm.value).subscribe((data)=>{
      console.log(data);
      this.toastr.success("Successfully Registered!")
      this.router.navigate(["\login"]);

    },(error)=>{
      if(error.status==501){
        this.toastr.error("User already exist");
      }
      else{
        this.toastr.error("Internal server error please try again latter")
      }
    });
  }
}
