import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IncomeState } from './income.reducer';
import { state } from '@angular/animations';
import { income } from '../../shared/interfaces/income.interface';

export const selectIncomeState = createFeatureSelector<IncomeState>('income');

export const selectIncomeData = createSelector(
  selectIncomeState,

  (state) => {
    console.log(state);
    return state.data;
  }
);

export const selectIncomeTotal = createSelector(selectIncomeState, (state) => {
  return state.totalIncome;
});

export const selectYearlyTotalIncome = createSelector(
  selectIncomeState,
  (state) => {
    return state.yearlyTotalIncome;
  }
);

export const selectMaxIncome = createSelector(
  selectIncomeState,
  (state) => state.maxIncome
);

export const selectMinIncome = createSelector(
  selectIncomeState,
  (state) => state.minIncome
);
export const selectIncomeById = (id: string) =>
  createSelector(selectIncomeState, (state: IncomeState) =>
    state.data.find((income: income) => income._id === id)
  );