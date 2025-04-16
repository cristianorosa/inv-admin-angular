import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Redirecionar para a home se já estiver logado
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }

    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  // Validador personalizado para verificar se as senhas coincidem
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  // Getter de conveniência para acesso fácil aos campos do formulário
  get f() { return this.registerForm.controls; }

  onSubmit(): void {
    this.submitted = true;

    // Para a validação se o formulário for inválido
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.authService.register({
      username: this.f['username'].value,
      email: this.f['email'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      password: this.f['password'].value
    })
    .subscribe({
      next: () => {
        this.router.navigate(['/auth/login'], { queryParams: { registered: true } });
      },
      error: error => {
        this.error = error;
        this.loading = false;
      }
    });
  }
}