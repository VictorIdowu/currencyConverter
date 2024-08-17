import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSemanticModule } from 'ngx-semantic';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ConversionService } from './conversion.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgxSemanticModule, ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'currencyConverter';
  form!: FormGroup;
  loading = false;

  conversionResult: string | null = null;
  errorMessage: string | null = null;

  currencies = [
    { text: 'US Dollars', value: 'USD' },
    { text: 'Euros', value: 'EUR' },
    { text: 'British Pounds', value: 'GBP' },
    { text: 'Japanese Yen', value: 'JPY' },
    { text: 'Naira', value: 'NGN' },
  ];

  currencyMatchValidator(): ValidatorFn {
    return (form: AbstractControl): { [key: string]: any } | null => {
      const fromCurrency = form.get('fromCurrency')?.value;
      const toCurrency = form.get('toCurrency')?.value;
      const amount = form.get('amount')?.value;
      return (fromCurrency && toCurrency && fromCurrency === toCurrency) ||
        amount === 0
        ? { currencyMatch: true }
        : null;
    };
  }

  toggleCurrencies() {
    const fromCurrency = this.form.get('fromCurrency')?.value;
    const toCurrency = this.form.get('toCurrency')?.value;

    this.form.controls['fromCurrency'].setValue(toCurrency);
    this.form.controls['toCurrency'].setValue(fromCurrency);

    this.handleConvert();
  }

  constructor(private fb: FormBuilder, private convert: ConversionService) {}

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        amount: [0, Validators.required],
        fromCurrency: ['USD', Validators.required],
        toCurrency: ['NGN', Validators.required],
      },
      { validator: this.currencyMatchValidator() }
    );
  }

  handleConvert() {
    if (this.form.valid) {
      this.loading = true;
      const res = this.convert
        .getExchangeRate(
          this.form.get('fromCurrency')?.value,
          this.form.get('toCurrency')?.value
        )
        .subscribe({
          next: (data) => {
            const rate = data.conversion_rate;
            this.conversionResult = `${this.form.get('amount')?.value} ${
              this.form.get('fromCurrency')?.value
            } is equal to ${this.form.get('amount')?.value * rate} ${
              this.form.get('toCurrency')?.value
            }`;
            this.loading = false;
            this.errorMessage = null;
          },
          error: (err) => {
            this.errorMessage =
              'Error fetching conversion rate. Please try again.';
            this.loading = false;
            this.conversionResult = null;
          },
        });
    }
  }
}
