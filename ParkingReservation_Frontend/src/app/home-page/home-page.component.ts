import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environments/environment.development';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})
export class HomePageComponent  {
  
  public tooken: any;
  
  public UserName: any;
  public bookings: any; 
  constructor(private router:Router,private http:HttpClient,private toastr: ToastrService, private cookie:CookieService){}
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
      if(data!=null){
        this.bookings=data;
      }
    },(error)=>{
      console.log("error: ",error)
    })
    
    }
    else{
      this.router.navigate(["/login"]);
    }

  }

  public editBooking(bookingId: number){
    console.log("edit button click by booking id",bookingId)
    this.router.navigate(['/edit-booking', bookingId]);
  }

  public deleteBooking(bookingId: number){
    console.log("delete button click by booking id",bookingId)

    const data={
      BookingId:bookingId
    }
    if(this.cookie.check("token")){
      this.tooken=this.cookie.get("token")
      console.log("tooken from home ",this.tooken)
      const headers = new HttpHeaders({
        'Authorization' : `Bearer ${this.tooken}`
      })
      this.http.post(environment.domin+"/deleteBooking",data,{headers}).subscribe((res: any)=>{
        this.getUserData();
        this.toastr.success("Successfully Deleted!")
      })
      }
      else{
        this.router.navigate(["/login"]);
      }
  }
}
