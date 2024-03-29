import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { HomePageRoutingModule } from './home-routing.module';


import { HomePage } from './home.page';
import { EditLogEntryFormComponent } from '../logEntries/edit-log-entry-form/edit-log-entry-form.component';
import { ListLogEntriesComponent } from '../logEntries/list-log-entries/list-log-entries.component';
import { IonicModule } from '@ionic/angular';
import { ServiceWorkerModule } from '@angular/service-worker';
import { UserModule } from '../user/user.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ReactiveFormsModule,
    ServiceWorkerModule,
    UserModule
  ],
  declarations: [
    HomePage ,
    EditLogEntryFormComponent,
    ListLogEntriesComponent
  ]
})
export class HomePageModule {}
