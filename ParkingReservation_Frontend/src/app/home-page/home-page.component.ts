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
export class HomePageComponent {

  public tooken: any;

  public UserName: any;
  public Role: any;
  public RoleId: any;
  public bookings: any[] = [];
  public users: any[] = [];
  public slots: any[] = [];
  public currentView: 'bookings' | 'users' | 'slots' = 'bookings'; // Default view is 'bookings'

  constructor(private router: Router, private http: HttpClient, private toastr: ToastrService, private cookie: CookieService) { }
  signOut() {
    console.log("sign out is called")
    this.cookie.delete("token")
    this.router.navigate(["/login"]);
  }

  ngOnInit(): void {
    this.getBookingData();
  }

  //#region Bookings
  public getBookingData() {
    if (this.cookie.check("token")) {
      this.tooken = this.cookie.get("token")
      console.log("tooken from home ", this.tooken)
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.tooken}`
      })
      this.http.get(environment.domin + "/user/getUser", { headers }).subscribe((res: any) => {
        console.log("get user responce", res)
        this.UserName = res.UserName;
        this.RoleId = res.RoleId;
        console.log("Role Id", this.RoleId)
        const RoleData = {
          RoleId: this.RoleId
        }
        this.http.post(environment.domin + "/getOneRole", RoleData).subscribe((res: any) => {
          //console.log(res)
          this.Role = res.RoleName;

          if (this.Role === 'super admin' || this.Role === 'admin') {
            // Fetch initial data for bookings, users, and slots on init
            this.getAllUserdata();
            this.getSlotsData();
          }
        })
      })
      this.http.get(environment.domin + "/getUserBookings", { headers }).subscribe((data: any) => {
        console.log("API responce: ", data.body);
        console.log("API data status", data.status)
        this.bookings = data;
        this.addExpirationStatus();
      })

    }
    else {
      this.router.navigate(["/login"]);
    }

  }


  addExpirationStatus() {
    this.bookings = this.bookings.map(booking => {
      const bookingStartTime = new Date(booking.start_time);
      const currentTime = new Date();
      booking.isExpired = bookingStartTime < currentTime;  // Add the 'isExpired' status
      return booking;
    });
  }

  public editBooking(bookingId: number) {
    console.log("edit button click by booking id", bookingId)
    this.router.navigate(['/edit-booking', bookingId]);
  }

  public deleteBooking(bookingId: number) {
    console.log("delete button click by booking id", bookingId)

    const data = {
      BookingId: bookingId
    }
    if (this.cookie.check("token")) {
      this.tooken = this.cookie.get("token")
      console.log("tooken from home ", this.tooken)
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.tooken}`
      })
      this.http.post(environment.domin + "/deleteBooking", data, { headers }).subscribe((res: any) => {
        this.getBookingData();
        this.toastr.success("Successfully Deleted!")
      })
    }
    else {
      this.router.navigate(["/login"]);
    }
  }
  //#endregion

  //#region Users
  public getAllUserdata() {
    if (this.cookie.check("token")) {
      this.tooken = this.cookie.get("token")
      console.log("tooken from home ", this.tooken)
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${this.tooken}`
      })
      this.http.get(environment.domin + "/getAll", { headers }).subscribe((res: any) => {
        this.users = res;
      })
    }
  }

  public editUser(UserId: number) {
    console.log("edit button click by user id", UserId)
    this.router.navigate(['/edit-user', UserId]);
  }

  //#endregion

  //#region Slots
  public getSlotsData() {
    console.log("getslot is called")
    this.http.get(environment.domin + "/getAllSlots").subscribe((data: any) => {
      console.log("responce of getSlotsData", data)
      this.slots = data;
    }, (error) => {
      console.log(error)
      this.slots = []
    })
  }

  public editSlot(SlotId: number) {
    console.log("edit button click by slot id", SlotId)
    this.router.navigate(['/edit-slot', SlotId]);
  }

  public deleteSlot(SlotId: number) {
    console.log("delete slot method call by SlotId")
    const data = {
      SlotId: SlotId
    }
    this.http.post(environment.domin + "/deleteSlot", data).subscribe((res: any) => {
      this.getSlotsData();
      this.toastr.success("Slot Deleted Successfully!")
    }, (error) => {
      if (error.status == 401) {
        this.toastr.error("You cannot delete slot with bookings!");
      }
      else {
        this.toastr.error("Internal server error please try again latter")
      }
    })
  }
  //#endregion

  // Function to show Bookings table
  showBookingsTable() {
    this.currentView = 'bookings'; // Set the view to bookings table
  }

  // Function to show Users table
  showUsersTable() {
    this.getAllUserdata();
    this.currentView = 'users'; // Set the view to users table
  }

  // Function to show Slots table
  showSlotsTable() {
    this.getSlotsData();
    this.currentView = 'slots'; // Set the view to slots table
  }
}
