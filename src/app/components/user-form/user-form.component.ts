import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  submitted = false;

  constructor (private fb: FormBuilder) {
    this.userForm = this.fb.group({
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(3)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]]
      }),
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern('^[0-9]{4}$')]]
      }),
      password: ['', [Validators.required, this.createPasswordValidator(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit (): void {
    // Écoute des changements sur le formulaire
    this.userForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
    });
  }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator (control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      // Erreur sur le champ spécifique
      confirmPassword.setErrors({ passwordMismatch: true });

      // Erreur sur le formulaire entier
      return { passwordMismatch: true };
    }
    return null;
  }

  createPasswordValidator (minLength: number) {
    // Validators.compose() permet de combiner plusieurs validateurs en un seul validateur
    return Validators.compose([
      Validators.required,
      Validators.minLength(minLength),
      // Sans message personnalisé
      // Validators.pattern(/\d/),         // doit contenir un chiffre
      // Validators.pattern(/[A-Z]/),      // doit contenir une majuscule
      // Validators.pattern(/[a-z]/),      // doit contenir une minuscule
      // Validators.pattern(/[!@#$%^&*=]/) // doit contenir un caractère spécial

      // Avec message personnalsié
      (control: AbstractControl): ValidationErrors | null => {
        if (!/\d/.test(control.value))
          return { digit: { message: 'Le mot de passe doit contenir un chiffre.' } };
        return null;
      },

      (control: AbstractControl): ValidationErrors | null => {
        if (!/[A-Z]/.test(control.value))
          return { uppercase: { message: 'Le mot de passe doit contenir une majuscule.' } };
        return null;
      },

      (control: AbstractControl): ValidationErrors | null => {
        if (!/[a-z]/.test(control.value))
          return { lowercase: { message: 'Le mot de passe doit contenir une minuscule.' } };
        return null;
      },

      (control: AbstractControl): ValidationErrors | null => {
        if (!/[!@#$%^&*=]/.test(control.value))
          return { specialChar: { message: 'Le mot de passe doit contenir un caractère spécial (!@#$%^&*=).' } };
        return null;
      },
    ]);
  }

  // Getter pour faciliter l'accès aux champs du formulaire dans le template
  get f () {
    return this.userForm.controls;
  }

  get personalInfo () {
    return this.userForm.get('personalInfo') as FormGroup;
  }

  get address () {
    return this.userForm.get('address') as FormGroup;
  }

  onSubmit () {
    this.submitted = true;

    if (this.userForm.invalid) return;

    console.log('Form submitted:', this.userForm.value);
    // Ici vous pouvez envoyer les données à votre backend
    this.resetForm();
  }

  resetForm () {
    this.submitted = false;
    this.userForm.reset();
  }
}
