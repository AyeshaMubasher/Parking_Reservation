import { NgModule } from '@angular/core';
import { RouterModule, Routes , Router } from '@angular/router';
import {  SignUpPageComponent } from './sign-up-page/sign-up-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ProfilePageComponent } from './profile-page/profile-page.component';

const routes: Routes = [
  {path:'login',component:LoginPageComponent},
  {path: 'home',component:HomePageComponent},
  {path: 'signUp',component:SignUpPageComponent},
  {path: 'profile',component:ProfilePageComponent},
  {path:'',component:LoginPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
