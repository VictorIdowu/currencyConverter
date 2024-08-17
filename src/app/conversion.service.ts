import { Injectable } from '@angular/core';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  constructor() {}

  getExchangeRate(fromCurrency: string, toCurrency: string): Observable<any> {
    return fromFetch(
      `https://v6.exchangerate-api.com/v6/461c4401fa9ef72a4b5d9690/pair/${fromCurrency}/${toCurrency}`
    ).pipe(
      switchMap((response) => {
        if (response.ok) {
          return response.json();
        } else {
          console.error(`Error ${response.status}`);
          return of([]);
        }
      }),
      catchError((err) => {
        console.error('Fetch error:', err);
        return of([]);
      })
    );
  }
}
