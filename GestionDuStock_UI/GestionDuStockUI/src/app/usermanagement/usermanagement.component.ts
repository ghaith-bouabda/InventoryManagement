import {Component} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { register } from '../services/fn/auth-controller/register';
import { RegisterRequest } from '../services/models/register-request';
import { AuthResponse } from '../services/models/auth-response';
import {AuthControllerService} from '../services/services/auth-controller.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './usermanagement.component.html',
  styleUrls: ['./usermanagement.component.scss'] // optional
})
export class UsermanagementComponent {
  registerForm: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthControllerService,
    private toastr: ToastrService,
  ) {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['USER', Validators.required]
    });
  }
  showSuccess(msg:string) {
    this.toastr.success(msg);
  }

  showError(msg: string) {
    this.toastr.error(msg);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const formData: RegisterRequest = this.registerForm.value;


  this.auth.register({body:formData}).subscribe({
        next: (res) => {
          this.showSuccess('Registration successful');
          this.registerForm.reset();
        },
        error: (err) => {
          this.showError('Registration failed. Please try again.');
        }
      });
  }
}
