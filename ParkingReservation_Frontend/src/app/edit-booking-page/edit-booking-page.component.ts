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
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-edit-booking-page',
  templateUrl: './edit-booking-page.component.html',
  styleUrl: './edit-booking-page.component.css'
})
export class EditBookingPageComponent {
  isFormSubmitted: boolean = false
  public tooken: any;
  public minDateTime: string = "";
  public availableSlots: string[] = [];
  public calculatedPrice: number = 0;
  public slot: string = "";
  public selectedSlotPrice: number = 0;
  public bookingId: number = 0;
  isFormLoadExistingDataStartTime: boolean = true
  isFormLoadExistingDataEndTime: boolean = true

  editBookingForm: FormGroup = new FormGroup({
    vehicleNumber: new FormControl('', [Validators.required, Validators.pattern('^[A-Z0-9]{1,15}$')]),
    startTime: new FormControl('', [Validators.required, startTimeGreaterThanCurrentTime()]),
    endTime: new FormControl('', [Validators.required]),
    slot: new FormControl('', [Validators.required]),
    price: new FormControl('')
  });

  constructor(private router: Router, private http: HttpClient, private cookie: CookieService, private toastr: ToastrService, private route: ActivatedRoute) {
    this.bookingId = +this.route.snapshot.paramMap.get('id')!; // get the Booking Id from the booking class which call this edit 
    console.log("booking id =", this.bookingId)
    this.getBooking();
  }

  ngOnInit(): void {
    if(!(this.cookie.check("token"))){
      this.router.navigate(["/login"])
    }
    
    this.setMinDateTime();
    this.getSlotsOnBasesOfTimeSlected()
  }

  public getBooking() {

    const data = {
      BookingId: this.bookingId
    }
    this.tooken = this.cookie.get("token")
    console.log("tooken from booking ", this.tooken)
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.tooken}`
    })
    this.http.post(environment.domin + "/getOneBooking", data, { headers }).subscribe((res: any) => {
      console.log(res);


      //#region get all avaliable slots 
      const data2 = {
        start_time: res.start_time + "",
        end_time: res.end_time + "",
        BookingId: this.bookingId
      }
      this.http.post(environment.domin + "/getAvaliableSlotsInEdit", data2,).subscribe((res2: any) => {
        console.log("recived slots", res2);
        this.availableSlots = res2;
        //this.toastr.success("Successfully Updated!")
      }, (error) => {
        console.log(error)
        //this.toastr.error("Internal server error")
      })
      //#endregion


      this.editBookingForm.patchValue({
        vehicleNumber: res.vehicleNumber,
        startTime: this.formatDateForDisplay(res.start_time),
        endTime: this.formatDateForDisplay(res.end_time),
        slot: res.slotName
      })

      this.calculatePrice();

      //this.toastr.success("Successfully Updated!")
    }, (error) => {
      console.log(error)
      //this.toastr.error("Internal server error")
    })


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

  formatDateForDisplay(date: string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  //#endregion


  public UpdateBooking() {
    if (this.calculatedPrice == 0) {
      this.toastr.error("Please Select the slot befor booking")
    }
    else {
      console.log("Form", this.editBookingForm.value);
      const isFormValid = this.editBookingForm.valid;
      this.isFormSubmitted = !isFormValid;
      console.log("is Form Valid variable: ", isFormValid)
      if (isFormValid) {
        const bookingdata = {
          BookingId: this.bookingId,
          SlotName: this.editBookingForm.value.slot,
          vehicleNumber: this.editBookingForm.value.vehicleNumber,
          start_time: this.formatDateTime(this.editBookingForm.value.startTime),
          end_time: this.formatDateTime(this.editBookingForm.value.endTime),
          totalPrice: this.calculatedPrice
        }
        console.log("Booking Data", bookingdata)

        this.tooken = this.cookie.get("token")
        console.log("tooken from booking ", this.tooken)
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.tooken}`
        })
        this.http.put(environment.domin + "/updateBooking", bookingdata, { headers }).subscribe((res: any) => {
          console.log(res);
          this.toastr.success("Successfully Updated!")
          this.router.navigate(["/home"])
        }, (error) => {
          console.log(error);
          this.toastr.error("Internal server error")
        })

      }
    }
    //console.log(this.bookingForm.value);
  }

  //#region Avaliable Slots Handling
  public getSlotsOnBasesOfTimeSlected() {
    // Listen for changes in startTime and endTime
    this.editBookingForm.get('startTime')?.valueChanges.pipe(
      debounceTime(500),  // Wait for the user to finish typing (500ms delay)
      switchMap((startTime) => {
        //this.calculatePrice();
        return of([]);  // Return an observable of an empty array when no valid time is selected
      })
    ).subscribe(slots => {
      if (this.isFormLoadExistingDataStartTime == false) {
        this.availableSlots = slots;
        this.calculatedPrice = 0;
        this.selectedSlotPrice=0;
        this.editBookingForm.get('slot')?.setValue("")
        }
      this.isFormLoadExistingDataStartTime = false;
    });

    this.editBookingForm.get('endTime')?.valueChanges.pipe(
      debounceTime(500),
      switchMap((endTime) => {
        //this.calculatePrice();
        return of([]);  // Return an observable of an empty array when no valid time is selected
      })
    ).subscribe(slots => {
      if (this.isFormLoadExistingDataEndTime == false) {
        this.availableSlots = slots;
        this.calculatedPrice = 0;
        this.selectedSlotPrice=0;
        this.editBookingForm.get('slot')?.setValue("")
      }
      this.isFormLoadExistingDataEndTime = false;
    });
    
  }

  public fetchAvailableSlots() {
    // returns an array of slot names
    const formattedStartDateTime = this.formatDateTime(this.editBookingForm.value.startTime);
    console.log("Start Time", formattedStartDateTime);
    const formattedEndDateTime = this.formatDateTime(this.editBookingForm.value.endTime);
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
      this.http.post(environment.domin + "/getAvaliableSlotsInEdit", data,).subscribe((res: any) => {
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
    //#region get price of selected slot
    const data = {
      SlotName: this.editBookingForm.value.slot
    }
    this.http.post(environment.domin + "/getOneSlot", data).subscribe((res: any) => {
      console.log("price ", res.price);
      this.selectedSlotPrice = res.price;


      //#region price calculation
      const startTime = this.editBookingForm.get('startTime')?.value;
      const endTime = this.editBookingForm.get('endTime')?.value;

      if (startTime && endTime) {

        //#region time calculations
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        // Calculate the difference in minutes
        const diffInMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60); // Time difference in minute
        //#endregion

        if (diffInMinutes > 0) {
          this.calculatedPrice = diffInMinutes * this.selectedSlotPrice;
        } else {
          this.calculatedPrice = 0;
        }
      } else {
        this.calculatedPrice = 0;
      }

      //#endregion

      //this.toastr.success("Successfully Updated!")
    }, (error) => {
      console.log(error)
      //this.toastr.error("Internal server error")
    })
    //#endregion
  }
}
