import { Injectable, resolveForwardRef } from '@angular/core';
import { Actions, ofType, createEffect } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ExpenseActions from '../actions/expense.actions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { ExpenseState } from './../reducer/expense.reducer';
import { ExpenseService } from '../../shared/services/expense.service';

@Injectable()
export class ExpenseEffects {
  constructor(
    private actions$: Actions,
    private expenseservice: ExpenseService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    private store: Store<ExpenseState>
  ) {}

  loadExpenses$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpenseActions.loadExpense),
      switchMap((action) => {
        const { page, limit } = action.params || {};
        return this.expenseservice.getExpense(page, limit).pipe(
          map((response: any) => {
            const {
              monthlyexpense,
              yearlyTotalExpense,
              totalexpense,
              maxAmountexpense,
              minAmountexpense,
              expenseAmounts,
            } = response;

            const formattedDateMonthlyExpense = monthlyexpense.map(
              (expense) => ({
                ...expense,
                date: this.datePipe.transform(expense.date, 'MM/dd/yyyy'),
              })
            );
            const formattedMonthlyExpense = formattedDateMonthlyExpense.map(
              (expense) => ({
                ...expense,
                duedate: this.datePipe.transform(expense.duedate, 'MM/dd/yyyy'),
              })
            );
            return ExpenseActions.expensesLoaded({
              expenses: {
                monthlyexpense: formattedMonthlyExpense,
                yearlyTotalExpense,
                totalexpense,
                maxAmountexpense,
                minAmountexpense,
                expenseAmounts,
                status,
              },
            });
          }),
          catchError((error) => {
            // Handle errors and dispatch appropriate action
            this.showMessage(error.error.message);
            return of(ExpenseActions.ExpenseError({ error }));
          })
        );
      })
    )
  );
  addExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpenseActions.addExpense),
      switchMap(({ expense }) =>
        this.expenseservice.addExpense(expense).pipe(
          tap(() => this.showMessage('expense added successfully')),
          map((res) => {
            console.log(res);
            this.expenseservice.expenseForm.reset();
            this.store.dispatch(ExpenseActions.loadExpense({}));
            return ExpenseActions.addExpenseSuccess();
          }),
          catchError((error) => {
            this.showMessage(error.error.message);
            return of(ExpenseActions.ExpenseError({ error }));
          })
        )
      )
    )
  );

  deleteExpense$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpenseActions.deleteExpense),
      switchMap(({ id }) => {
        return this.expenseservice.deleteExpense(id).pipe(
          tap(() => this.showMessage('expense deleted successfully')),
          map(() => {
            this.store.dispatch(ExpenseActions.loadExpense({}));
            return ExpenseActions.deleteExpenseSuccess({ id });
          }),
          catchError((error) => {
            this.showMessage(error.error.message);
            return of(ExpenseActions.ExpenseError({ error }));
          })
        );
      })
    )
  );

  Payment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpenseActions.Payment),
      switchMap(({ id }) => {
        return this.expenseservice.payment(id).pipe(
          map((response: any) => {
            console.log(response);
            const redirectUrl = response.link;
            window.location.href = redirectUrl;
            return ExpenseActions.paymentSuccess(redirectUrl);
          }),
          catchError((error) => {
            console.log(error);
            if (error.status === 303) {
              const redirectUrl = error.error.link;
              window.location.href = redirectUrl;
              this.store.dispatch(ExpenseActions.paymentSuccess(redirectUrl));
            } else if (error.error.message) {
              alert(error.error.message);
            } else {
              alert(
                'There was a problem loading this page. Please login again.'
              );
            }

            return of(ExpenseActions.ExpenseError({ error }));
          })
        );
      })
    )
  );

  private showMessage(message: any) {
    this.snackBar.open(message || 'An error occurred', 'Close', {
      duration: 5000,
      panelClass: ['snackbar-error'],
    });
  }
}