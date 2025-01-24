import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent  {
  
  public tooken: any;
  
  public UserName: any;
  public bookings: any;
  constructor(private router:Router,private http:HttpClient, private cookie:CookieService){}
  signOut(){
    this.cookie.delete("token")
    this.router.navigate(["/login"]);
  }

  ngOnInit(): void{
    this.getUserData();
  }

  

  public getUserData(){
    if(this.cookie.check("token")){
    this.tooken=this.cookie.get("token")
    console.log("tooken from home ",this.tooken)
    const headers = new HttpHeaders({
      'Authorization' : `Bearer ${this.tooken}`
    })
    this.http.get(environment.domin+"/user/getUser",{headers}).subscribe((res: any)=>{
      //console.log(res)
      this.UserName=res.UserName;
    })
    this.http.get(environment.domin+"/getUserBookings",{headers}).subscribe((data: any)=>{
      console.log("API responce: ",data);
      this.bookings=data;
    })
    }
    else{
      this.router.navigate(["/login"]);
    }

  }
}
