import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-edit-profile-page',
  templateUrl: './edit-profile-page.component.html',
  styleUrl: './edit-profile-page.component.css'
})
export class EditProfilePageComponent {

  isFormSubmitted: boolean = false
  public tooken: any; 
  public userData:any;
  selectedFile: File | null = null; // To hold the selected file
  currentImage: string = '';         // To store current profile image URL

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
       this.profileForm.setValue({
        UserName : res.UserName,
        PhoneNumber: res.PhoneNumber
       });
       this.currentImage = res.profileImageUrl || 'http://bootdey.com/img/Content/avatar/avatar1.png'; // Use a default image if not available
     })
     }
     else{
       this.router.navigate(["/login"]);
     }
   }

   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

   public Update(){
    const isFormValid = this.profileForm.valid;
    this.isFormSubmitted = !isFormValid;

    if (isFormValid) {
      const formData = new FormData();
      formData.append('UserName', this.profileForm.value.UserName);
      formData.append('PhoneNumber', this.profileForm.value.PhoneNumber);

      // Append the selected image if available
      if (this.selectedFile) {
        formData.append('profileImage', this.selectedFile, this.selectedFile.name);
      }

      console.log("formatedData",formatDate)
      this.tooken=this.cookie.get("token")
      console.log("tooken from home ",this.tooken)
      const headers = new HttpHeaders({
        'Authorization' : `Bearer ${this.tooken}`
      })
      this.http.put(environment.domin+"/user/update",formData,{headers}).subscribe((res: any)=>{
        console.log(res);
        this.router.navigate(["/home"])
        this.toastr.success("Successfully Updated!")
      },(error)=>{
        this.toastr.error("Internal server error")
      })
    }
   }
}
