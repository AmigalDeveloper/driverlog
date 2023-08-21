import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EditLogEntryFormComponent } from '../logEntries/edit-log-entry-form/edit-log-entry-form.component';
import { UserRegisterComponent } from '../user/user-register/user-register.component';
import { LoginComponent } from '../user/login/login.component';
import { UserService } from '../user/user.service';
import { LogEntriesService } from '../logEntries/log-entries.service';
import { User } from '../user/user';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  user



  constructor(private modalCtrl: ModalController, private userService: UserService,private logEntriesService: LogEntriesService) {}


  async openModal() {
    const modal = await this.modalCtrl.create({
      component: EditLogEntryFormComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('data saved', data);
    }
  }

  async login() {
    const modal = await this.modalCtrl.create({
      component: LoginComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    console.log('data from modal data:',data,'role:',role);
    if (role === 'confirm') {
      console.log('data saved', data);
      if(data.valid){
        this.user = this.userService.login(data)
        .subscribe((resp) => {
          console.log('LoginComponent::login resultatet af resp.body ',resp.body);

          return resp.body;
        });

      }
    }

  }

  async register() {
    const modal = await this.modalCtrl.create({
      component: UserRegisterComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('data saved', data);
    }
  }

  ngOnInit(): void {

    const isLoggedIn = this.userService.isLoggedIn();
    isLoggedIn.then(


      (value) => {
        console.log('result of loggedIn', value);
        if( !value) console.log('log in ',this.login() );
      }
    )

    console.log('result of loggedIn', isLoggedIn);

  }




}
