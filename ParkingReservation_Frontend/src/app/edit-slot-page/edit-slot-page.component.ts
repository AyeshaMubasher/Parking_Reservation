import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-slot-page',
  templateUrl: './edit-slot-page.component.html',
  styleUrl: './edit-slot-page.component.css'
})
export class EditSlotPageComponent {
  public tooken: any;
  public slotId: number = 0;
  isFormSubmitted: boolean = false
  editSlotForm: FormGroup = new FormGroup({
    SlotName: new FormControl("", [Validators.required]),
    price: new FormControl("", [Validators.required])
  });
  constructor(private router: Router, private http: HttpClient, private toastr: ToastrService, private cookie: CookieService, private route: ActivatedRoute) {
    this.slotId = +this.route.snapshot.paramMap.get('id')!; // get the slot Id from the slot class which call this edit 
    console.log("booking id =", this.slotId)
    if (!(this.cookie.check("token"))) {
      this.router.navigate(["/login"])
    }
    else {
      if (this.cookie.check("token")) {
        this.tooken = this.cookie.get("token")
        console.log("tooken from home ", this.tooken)
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${this.tooken}`
        })
        this.http.get(environment.domin + "/verifyAdmin", { headers }).subscribe((res: any) => {
          this.getSlot();
        }, (error) => {
          this.router.navigate(["/home"])
        })
      }
    }
  }

  ngOnInit(): void {

  }

  public getSlot() {
    const data = {
      SlotId: this.slotId
    }
    this.http.post(environment.domin + '/getOneSlotWithId', data).subscribe((res: any) => {
      console.log(res);
      this.editSlotForm.setValue({
        SlotName: res.SlotName,
        price: res.price
      })
    });
  }

  public EditSlot() {
    const isFormValid = this.editSlotForm.valid;
    console.log(!isFormValid)
    this.isFormSubmitted = !isFormValid;
    if (isFormValid) {

      const data = {
        SlotId: this.slotId,
        SlotName: this.editSlotForm.value.SlotName,
        price: this.editSlotForm.value.price
      }
      console.log("data to update", data)
      this.http.put(environment.domin + '/updateSlot', data).subscribe((res: any) => {
        console.log(res);
        this.toastr.success("Successfully Updated!")
        this.router.navigate(["/home"])

      }, (error) => {
        if (error.status == 501) {
          this.toastr.error("slot already exist");
        }
        else {
          this.toastr.error("Internal server error please try again latter")
        }
      });
    }
  }
}
