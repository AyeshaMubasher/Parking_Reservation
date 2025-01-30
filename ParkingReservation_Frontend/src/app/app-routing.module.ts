import { NgModule } from '@angular/core';
import { RouterModule, Routes , Router } from '@angular/router';
import {  SignUpPageComponent } from './sign-up-page/sign-up-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { BookingPageComponent } from './booking-page/booking-page.component';
import { EditBookingPageComponent } from './edit-booking-page/edit-booking-page.component';

const routes: Routes = [
  {path:'login',component:LoginPageComponent},
  {path: 'home',component:HomePageComponent},
  {path: 'signUp',component:SignUpPageComponent},
  {path: 'booking',component:BookingPageComponent},
  { path: 'edit-booking/:id',component:EditBookingPageComponent },
  {path:'',component:LoginPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
