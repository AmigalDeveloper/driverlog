import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../user';
import {
  Form,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { IonModal, ModalController } from '@ionic/angular';
import { UserService } from '../user.service';
import {OverlayEventDetail} from '@ionic/core/components';
import { identicalpasswordValidator } from '../../validators/identicalpassworde.validator.directive';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.scss'],
})
export class UserRegisterComponent implements OnInit {
  @ViewChild(IonModal) modal: IonModal;

  registerForm: FormGroup<any> | FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
    retypePassword: FormControl<string>;
    name: FormControl<string>;
  }>;

  registerStatus: any;
  message: string;


  constructor(private service: UserService, public fb: FormBuilder, private modalCtrl: ModalController) {}

  onSubmit(form: FormGroup) {
    return this.register(this.registerForm);
  }

  cancel() {
    return this.modalCtrl.dismiss(null,'cancel');
  }
  confirm() {
    return this.modalCtrl.dismiss(this.register(this.registerForm),'confirm');
  }


  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: new FormControl('', Validators.email),
      password: new FormControl('', Validators.nullValidator),
      retypePassword: new FormControl('', identicalpasswordValidator),
      name: new FormControl('', Validators.nullValidator),
    });
  }

  register(form: FormGroup) {
    console.log('UserRegisterComponent::register is called');
    if(form.valid){
      this.registerStatus = this.service.register(form)
      .subscribe((resp) => {
        console.log('UserReggeisterComponent::register resultatet af resp.body ',resp);
        return resp;
      });

    }

  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;

    console.info('paramter event er ',event);
    console.info('paramter ev er ',ev);

    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }
}


