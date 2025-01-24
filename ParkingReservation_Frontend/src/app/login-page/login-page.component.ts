import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css' 
})
export class LoginPageComponent  {

  isFormSubmitted: boolean = false
  loginForm : FormGroup;
  constructor(private router:Router, private http: HttpClient, private toastr: ToastrService,private cookie: CookieService){
    this.loginForm=new FormGroup({
      email: new FormControl("",[Validators.required,Validators.email]),
      password: new FormControl("",[Validators.required])
    })
  }

  ngOnInit():void{
    if(this.cookie.check("token")){
      this.router.navigate(["/home"])
    }
  }

  Login(){
    const isFormValid = this.loginForm.valid;
    console.log(!isFormValid)
    this.isFormSubmitted = !isFormValid;
    console.log("Login Form Submited");
    if(isFormValid)
      { 
        //this.router.navigate(["/home"])//remove
        this.post();//uncomment
      }

  }
  Register(){
    console.log("Call Register");
    this.router.navigate(["/signUp"])
  }

  public post(){
    this.http.post(environment.domin+'/user/check',this.loginForm.value).subscribe((res: any)=>{
      this.cookie.set("token",res.token)
      console.log("token: ",res.token);
      this.toastr.success("Successfully Login!")
      this.router.navigate(["/home"])
    }
    ,(error)=>{
      if(error.status==401){
        this.toastr.error("Incorrect Password");
      }
      else if(error.status==404){
        this.toastr.error("User not found")
      }
      else{
        this.toastr.error("Internal server error please try again latter")
      }
    });
  }
}
