import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { UserComponent } from './user.component';
import { UserRegisterComponent } from './user-register/user-register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [UserComponent, UserRegisterComponent,LoginComponent],
  imports: [CommonModule, IonicModule, FormsModule, ReactiveFormsModule],
})
export class UserModule {}
