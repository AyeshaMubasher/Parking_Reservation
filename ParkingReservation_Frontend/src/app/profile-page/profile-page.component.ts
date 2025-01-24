import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
 
  isFormSubmitted: boolean = false
  public tooken: any; 

  profileForm : FormGroup = new FormGroup({
    FirstName: new FormControl('',[Validators.required]),
    LastName: new FormControl('',[Validators.required]),
    Address: new FormControl(''),
    PhoneNumber: new FormControl('',[Validators.pattern(/^\+?\d{10,15}$/)])
  });

   constructor(private router:Router,private http:HttpClient, private cookie:CookieService, private toastr:ToastrService){
    this.getUserData();
   }


   signOut(){
     this.cookie.delete("token")
     this.router.navigate(["/login"]);
   }
 
   ngOnInit(): void{
     
   }
 
   public getUserData(){
     if(this.cookie.check("token")){
     this.tooken=this.cookie.get("token")
     console.log("tooken from home ",this.tooken)
     const headers = new HttpHeaders({
       'Authorization' : `Bearer ${this.tooken}`
     })
     this.http.get(environment.domin+"/user/getUser",{headers}).subscribe((res: any)=>{
       console.log(res)
       this.profileForm.setValue({
        FirstName : res.FirstName,
        LastName: res.LastName,
        Address: res.Address,
        PhoneNumber: res.PhoneNumber
       });
     })
     }
     else{
       this.router.navigate(["/login"]);
     }
   }

   public Update(){
    const isFormValid = this.profileForm.valid;
    console.log(!isFormValid)
    this.isFormSubmitted = !isFormValid;
    console.log(this.profileForm.value);
    this.tooken=this.cookie.get("token")
    console.log("tooken from home ",this.tooken)
    const headers = new HttpHeaders({
      'Authorization' : `Bearer ${this.tooken}`
    })
    this.http.put(environment.domin+"/user/update",this.profileForm.value,{headers}).subscribe((res: any)=>{
      console.log(res);
      this.toastr.success("Successfully Updated!")
    },(error)=>{
      this.toastr.error("Internal server error")
    })
   }
}
