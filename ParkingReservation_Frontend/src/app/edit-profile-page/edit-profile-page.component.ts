import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-edit-profile-page',
  templateUrl: './edit-profile-page.component.html',
  styleUrl: './edit-profile-page.component.css'
})
export class EditProfilePageComponent {

  isFormSubmitted: boolean = false
  public tooken: any; 
  public userData:any;

  profileForm : FormGroup = new FormGroup({
    UserName: new FormControl('',[Validators.required]),
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
       this.userData=res;
       this.profileForm.setValue({
        UserName : res.UserName,
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
    this.userData={
      RoleId:this.userData.RoleId,
      UserName: this.profileForm.value.UserName,
      email: this.userData.email,
      password: this.userData.password,
      PhoneNumber: this.profileForm.value.PhoneNumber
    }
    console.log("data to update",this.userData)
    this.tooken=this.cookie.get("token")
    console.log("tooken from home ",this.tooken)
    const headers = new HttpHeaders({
      'Authorization' : `Bearer ${this.tooken}`
    })
    this.http.put(environment.domin+"/user/update",this.userData,{headers}).subscribe((res: any)=>{
      console.log(res);
      this.router.navigate(["/home"])
      this.toastr.success("Successfully Updated!")
    },(error)=>{
      this.toastr.error("Internal server error")
    })
   }
}
