import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup<any> | FormGroup<{
    username: FormControl<string>;
    password: FormControl<string>;
  }>;
  loginStatus:any;
  message: string ;

  constructor(private service: UserService, public fb: FormBuilder, private modalCtrl: ModalController) { }

  onSubmit(form: FormGroup) {
    return this.login(this.loginForm);
  }

  cancel() {
    return this.modalCtrl.dismiss(null,'cancel');
  }
  confirm() {
 //   return this.modalCtrl.dismiss(this.login(this.loginForm),'login');
      return this.modalCtrl.dismiss(this.loginForm,'login');
  }

  login(form: FormGroup){
    console.log('LoginComponent::login is called');
    if(form.valid){
      this.loginStatus = this.service.login(form)
      .subscribe((resp) => {
        console.log('LoginComponent::login resultatet af resp.body ',resp.body);

        return resp.body;
      });

    }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: new FormControl('', Validators.email),
      password: new FormControl('', Validators.nullValidator),
     });
  }

}
