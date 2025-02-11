import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';


@Component({
  selector: 'app-add-slot-page',
  templateUrl: './add-slot-page.component.html',
  styleUrl: './add-slot-page.component.css'
})
export class AddSlotPageComponent {
  isFormSubmitted: boolean = false
  slotForm: FormGroup;
  constructor(private router: Router, private http: HttpClient, private toastr: ToastrService, private cookie: CookieService) {
    this.slotForm = new FormGroup({
      SlotName: new FormControl("", [Validators.required]),
      price: new FormControl("", [Validators.required])
    });
  }

  ngOnInit(): void {
    if (!(this.cookie.check("token"))) {
      this.router.navigate(["/login"])
    }

  }

  public AddSlot() {
    const isFormValid = this.slotForm.valid;
    console.log(!isFormValid)
    this.isFormSubmitted = !isFormValid;
    if (isFormValid) {
      this.http.post(environment.domin + '/addSlot', this.slotForm.value).subscribe((data) => {
        console.log(data);
        this.toastr.success("Successfully Created!")
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
