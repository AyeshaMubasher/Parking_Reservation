import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';
import { debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { startTimeGreaterThanCurrentTime } from './Validators';

@Component({
  selector: 'app-booking-page',
  templateUrl: './booking-page.component.html',
  styleUrl: './booking-page.component.css'
})
export class BookingPageComponent {
  isFormSubmitted: boolean = false
  public tooken: any;
  public minDateTime: string = "";
  public availableSlots: string[] = [];
  public calculatedPrice: number = 0;

  bookingForm: FormGroup = new FormGroup({
    vehicleNumber: new FormControl('', [Validators.required, Validators.pattern('^[A-Z0-9]{1,15}$')]),
    startTime: new FormControl('', [Validators.required, startTimeGreaterThanCurrentTime()]),
    endTime: new FormControl('', [Validators.required]),
    slot: new FormControl('', [Validators.required]),
    price: new FormControl('')
  });

  constructor(private router: Router, private http: HttpClient, private cookie: CookieService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.setMinDateTime();
    this.getSlotsOnBasesOfTimeSlected()
  }

  //#region Time calculations
  setMinDateTime() {
    const now = new Date();

    // Format the current date and time into the required "yyyy-mm-ddThh:mm" format
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    // Combine them into the "yyyy-mm-ddThh:mm" format
    this.minDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  public formatDateTime(inputDateTime: any) {
    const dateObj = new Date(inputDateTime);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  //#endregion


  public AddBooking() {
    console.log(this.bookingForm.value);
    const isFormValid = this.bookingForm.valid;
    console.log(!isFormValid)
    this.isFormSubmitted = !isFormValid;
    if (isFormValid) {
      const bookingdata = {
        SlotId: "",
        vehicleNumber: this.bookingForm.value.vehicleNumber,
        start_time: this.formatDateTime(this.bookingForm.value.startTime),
        end_time: this.formatDateTime(this.bookingForm.value.endTime)
      }

      const data = {
        SlotName: this.bookingForm.value.slot
      }
      this.http.post(environment.domin + "/getOneSlot", data).subscribe((res: any) => {
        console.log(res.SlotId);
        bookingdata.SlotId = res.SlotId;
        //this.toastr.success("Successfully Updated!")
        console.log("booking data", bookingdata)

        this.tooken = this.cookie.get("token")
        console.log("tooken from booking ", this.tooken)
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.tooken}`
        })
        this.http.post(environment.domin + "/addBooking", bookingdata, { headers }).subscribe((res: any) => {
          console.log(res);
          this.toastr.success("Successfully Booked!")
        }, (error) => {
          console.log(error);
          this.toastr.error("Internal server error")
        })
      }, (error) => {
        console.log(error)
        //this.toastr.error("Internal server error")
      })



    }
    console.log(this.bookingForm.value);

  }

  //#region Avaliable Slots Handling
  public getSlotsOnBasesOfTimeSlected() {
    // Listen for changes in startTime and endTime
    this.bookingForm.get('startTime')?.valueChanges.pipe(
      debounceTime(500),  // Wait for the user to finish typing (500ms delay)
      switchMap((startTime) => {
        this.calculatePrice();
        return of([]);  // Return an observable of an empty array when no valid time is selected
      })
    ).subscribe(slots => {
      this.availableSlots = slots;
    });

    this.bookingForm.get('endTime')?.valueChanges.pipe(
      debounceTime(500),
      switchMap((endTime) => {
        this.calculatePrice();
        return of([]);  // Return an observable of an empty array when no valid time is selected
      })
    ).subscribe(slots => {
      this.availableSlots = slots;
    });
  }

  public fetchAvailableSlots() {
    // returns an array of slot names
    const formattedStartDateTime = this.formatDateTime(this.bookingForm.value.startTime);
    console.log("Start Time", formattedStartDateTime);
    const formattedEndDateTime = this.formatDateTime(this.bookingForm.value.endTime);
    console.log("End Time", formattedEndDateTime);
    const data = {
      start_time: formattedStartDateTime + "",
      end_time: formattedEndDateTime + ""
      //start_time:"2023-01-31 10:00:00",
      //end_time:"2023-01-31 11:00:00"
    }

    if (data.start_time >= data.end_time) {
      this.toastr.error("Invalid End time")
    }
    else {
      console.log("formated start time", formattedStartDateTime)
      console.log("formated end time", formattedEndDateTime)

      console.log("data ", data)
      this.http.post(environment.domin + "/getAvaliableSlots", data,).subscribe((res: any) => {
        console.log(res);
        this.availableSlots = res;
        //this.toastr.success("Successfully Updated!")
      }, (error) => {
        console.log(error)
        //this.toastr.error("Internal server error")
      })

      //this.calculatePrice();
    }


  }
  //#endregion

  calculatePrice() {
    const startTime = this.bookingForm.get('startTime')?.value;
    const endTime = this.bookingForm.get('endTime')?.value;

    if (startTime && endTime) {
      const startDate = new Date(startTime);
      const endDate = new Date(endTime);

      // Calculate the difference in minutes
      const diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // Time difference in minutes

      if (diffInMinutes > 0) {
        this.calculatedPrice = diffInMinutes * 0.5; // Multiply by 0.5 Rs per minute
      } else {
        this.calculatedPrice = 0; // If the end time is before the start time, set the price to 0
      }
    } else {
      this.calculatedPrice = 0;
    }
  }

}
