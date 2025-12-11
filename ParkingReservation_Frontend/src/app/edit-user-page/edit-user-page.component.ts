import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-user-page',
  templateUrl: './edit-user-page.component.html',
  styleUrl: './edit-user-page.component.css'
})
export class EditUserPageComponent {

  public tooken: any;
  public userId: number = 0;
  isFormSubmitted: boolean = false
  UserName: any
  RoleId: any
  Role: any
  public role: string = "";
  public avaliableRoles: string[] = []
  editUserForm: FormGroup = new FormGroup({
    UserName: new FormControl("", [Validators.required]),
    role: new FormControl("", [Validators.required])
  });
  constructor(private router: Router, private http: HttpClient, private toastr: ToastrService, private cookie: CookieService, private route: ActivatedRoute) {
    this.userId = +this.route.snapshot.paramMap.get('id')!; // get the slot Id from the slot class which call this edit 
    console.log("user id =", this.userId)
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
          if(res.RoleId==2){
            this.router.navigate(["/home"])
          }
          this.getUser();
        }, (error) => {
          this.router.navigate(["/home"])
        })
      }
    }
  }

  ngOnInit(): void {
  }

  public getUser() {
    const data = {
      UserId: this.userId
    }
    this.http.post(environment.domin + "/getOneUser", data).subscribe((res: any) => {
      console.log("get user responce", res)
      this.UserName = res.UserName;
      this.RoleId = res.RoleId;
      console.log("Role Id", this.RoleId)
      this.http.get(environment.domin + "/getAllRoles").subscribe((res: any) => {
        this.avaliableRoles = res
      })
      const RoleData = {
        RoleId: this.RoleId
      }
      this.http.post(environment.domin + "/getOneRole", RoleData).subscribe((res: any) => {
        this.Role = res.RoleName;

        this.editUserForm.patchValue({
          UserName: this.UserName,
          role: this.Role
        })
      })

    })
  }

  public EditUser() {
    const isFormValid = this.editUserForm.valid;
    console.log(!isFormValid)
    this.isFormSubmitted = !isFormValid;
    if (isFormValid) {

      const data = {
        UserId: this.userId,
        UserName: this.editUserForm.value.UserName,
        Role: this.editUserForm.value.role
      }
      console.log("data to update", data)
      this.http.put(environment.domin + '/user/updateUserRights', data).subscribe((res: any) => {
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
