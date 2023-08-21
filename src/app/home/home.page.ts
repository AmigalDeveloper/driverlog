import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EditLogEntryFormComponent } from '../logEntries/edit-log-entry-form/edit-log-entry-form.component';
import { UserRegisterComponent } from '../user/user-register/user-register.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private modalCtrl: ModalController) {}

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
      component: UserRegisterComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('data saved', data);
    }
  }

}
