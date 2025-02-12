import { NgModule } from '@angular/core';
import { RouterModule, Routes , Router } from '@angular/router';
import {  SignUpPageComponent } from './sign-up-page/sign-up-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { EditBookingPageComponent } from './edit-booking-page/edit-booking-page.component';
import { AddSlotPageComponent } from './add-slot-page/add-slot-page.component';
import { EditSlotPageComponent } from './edit-slot-page/edit-slot-page.component';
import { EditUserPageComponent } from './edit-user-page/edit-user-page.component';
import { EditProfilePageComponent } from './edit-profile-page/edit-profile-page.component';
import { ChangePasswordPageComponent } from './change-password-page/change-password-page.component';

const routes: Routes = [
  {path:'login',component:LoginPageComponent},
  {path: 'home',component:HomePageComponent},
  {path: 'signUp',component:SignUpPageComponent},
  {path: 'booking',component:BookingPageComponent},
  {path: 'edit-booking/:id',component:EditBookingPageComponent},
  {path: 'addSlot',component:AddSlotPageComponent},
  {path: 'edit-slot/:id',component:EditSlotPageComponent},
  {path: 'edit-user/:id',component:EditUserPageComponent},
  {path: 'profile',component:EditProfilePageComponent},
  {path: 'changePassword',component:ChangePasswordPageComponent},
  {path:'',component:LoginPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
