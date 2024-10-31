# Guide Pratique des Validateurs

## 1. Validateur Simple

### Required
```typescript
// Définition
email: ['', Validators.required]

// Template
<input formControlName="email">
<div *ngIf="form.get('email')?.errors?.['required']">
  Email requis
</div>
```

### Min Length
```typescript
// Définition
username: ['', Validators.minLength(3)]

// Template
<div *ngIf="form.get('username')?.errors?.['minlength']">
  Minimum {{form.get('username')?.errors?.['minlength'].requiredLength}} caractères
</div>
```

## 2. Validateur Multiple

```typescript
// Définition
password: ['', [
  Validators.required,
  Validators.minLength(8),
  Validators.pattern(/[A-Z]/)
]]

// Template
<div *ngIf="form.get('password')?.errors">
  <div *ngIf="form.get('password')?.errors?.['required']">
    Mot de passe requis
  </div>
  <div *ngIf="form.get('password')?.errors?.['minlength']">
    Minimum 8 caractères
  </div>
  <div *ngIf="form.get('password')?.errors?.['pattern']">
    Doit contenir une majuscule
  </div>
</div>
```

## 3. Validateur Personnalisé Simple

```typescript
// Définition
function ageValidator(control: AbstractControl): ValidationErrors | null {
  const age = control.value;
  if (age < 18 || age > 99) {
    return { invalidAge: { message: 'L\'âge doit être entre 18 et 99 ans' } };
  }
  return null;
}

// Utilisation
age: ['', [Validators.required, ageValidator]]

// Template
<div *ngIf="form.get('age')?.errors?.['invalidAge']">
  {{form.get('age')?.errors?.['invalidAge'].message}}
</div>
```

## 4. Validateur Personnalisé avec Paramètres

```typescript
// Définition
function minMaxValidator(min: number, max: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value < min || value > max) {
      return {
        range: {
          min: min,
          max: max,
          actual: value,
          message: `La valeur doit être entre ${min} et ${max}`
        }
      };
    }
    return null;
  };
}

// Utilisation
quantity: ['', [Validators.required, minMaxValidator(1, 100)]]

// Template
<div *ngIf="form.get('quantity')?.errors?.['range']">
  {{form.get('quantity')?.errors?.['range'].message}}
</div>
```

## 5. Validateur de Groupe (Cross-Field)

```typescript
// Définition
export class DateRangeValidator {
  static validate(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;

    if (start && end && start > end) {
      return { dateRange: { message: 'La date de fin doit être après la date de début' } };
    }
    return null;
  }
}

// Utilisation
this.form = this.fb.group({
  startDate: [''],
  endDate: ['']
}, {
  validators: DateRangeValidator.validate
})

// Template
<div *ngIf="form.errors?.['dateRange']">
  {{form.errors?.['dateRange'].message}}
</div>
```

## 6. Validateur Asynchrone

```typescript
// Définition
export class UsernameValidator {
  static createValidator(userService: UserService) {
    return (control: AbstractControl): Promise<ValidationErrors | null> => {
      return new Promise(resolve => {
        userService.checkUsernameExists(control.value).subscribe(
          exists => {
            resolve(exists ? { usernameTaken: true } : null);
          }
        );
      });
    };
  }
}

// Utilisation
constructor(private userService: UserService) {
  this.form = this.fb.group({
    username: ['', [], [UsernameValidator.createValidator(userService)]]
  });
}

// Template
<div *ngIf="form.get('username')?.errors?.['usernameTaken']">
  Ce nom d'utilisateur est déjà pris
</div>
<div *ngIf="form.get('username')?.pending">
  Vérification en cours...
</div>
```

## 7. Validateur avec Expression Régulière

```typescript
// Définition
function createPatternValidator(
  pattern: RegExp,
  errorKey: string,
  errorMessage: string
) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!pattern.test(control.value)) {
      return { [errorKey]: { message: errorMessage } };
    }
    return null;
  };
}

// Utilisation
password: ['', [
  createPatternValidator(
    /[A-Z]/,
    'uppercase',
    'Doit contenir une majuscule'
  ),
  createPatternValidator(
    /[0-9]/,
    'digit',
    'Doit contenir un chiffre'
  )
]]

// Template
<div *ngIf="form.get('password')?.errors?.['uppercase']">
  {{form.get('password')?.errors?.['uppercase'].message}}
</div>
<div *ngIf="form.get('password')?.errors?.['digit']">
  {{form.get('password')?.errors?.['digit'].message}}
</div>
```

## 8. Validation Conditionnelle

```typescript
// Définition
export class ConditionalValidator {
  static requiredIf(predicate: () => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (predicate()) {
        return Validators.required(control);
      }
      return null;
    };
  }
}

// Utilisation
export class MyComponent {
  hasPhone = false;

  ngOnInit() {
    this.form = this.fb.group({
      phoneNumber: ['', ConditionalValidator.requiredIf(() => this.hasPhone)]
    });

    // Mise à jour des validateurs quand hasPhone change
    this.form.get('phoneNumber')?.setValidators(
      ConditionalValidator.requiredIf(() => this.hasPhone)
    );
  }
}

// Template
<div *ngIf="form.get('phoneNumber')?.errors?.['required']">
  Numéro de téléphone requis quand la case est cochée
</div>
```