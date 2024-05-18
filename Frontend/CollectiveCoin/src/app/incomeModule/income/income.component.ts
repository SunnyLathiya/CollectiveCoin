import { Component, OnInit, OnDestroy } from '@angular/core';
import { IncomeService } from '../../shared/services/income.service';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginDataService } from '../../shared/services/login-data.service';
import { Observable } from 'rxjs';
import { IncomeState } from '../incomeStore/income.reducer';
import { Store, select } from '@ngrx/store';
import * as incomeActions from './../incomeStore/income.actions';
import {
  selectIncomeData,
  selectIncomeTotal,
  selectMaxIncome,
  selectMinIncome,
} from '../incomeStore/income.selector';
import { income } from '../../shared/interfaces/income.interface';

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css',
})
export class IncomeComponent implements OnInit, OnDestroy {
  isEarning: boolean;
  currentPage: number;
  totalItems: number;
  totalIncome$: Observable<number>;
  incomes$: Observable<income[]>;
  deleteMethod: Function;

  constructor(
    public incomeservice: IncomeService,
    private router: Router,
    private route: ActivatedRoute,
    private logindataservice: LoginDataService,
    private store: Store<IncomeState>
  ) {
    this.logindataservice.isLoggedin().subscribe(() => {
      this.isEarning = this.logindataservice.isEarning;
    });
  }
  ngOnInit(): void {
    this.deleteMethod = incomeActions.deleteIncome;
    this.store.dispatch(incomeActions.loadIncomes());

    this.totalIncome$ = this.store.select(selectIncomeTotal);
    this.incomes$ = this.store.select(selectIncomeData);
    console.log(this.incomes$);
  }

  updateIncome(id: string) {
    this.router.navigate([`Income/update-income/${id}`]);
  }

  save() {
    if (this.incomeservice.incomeForm.valid) {
      this.store.dispatch(
        incomeActions.addIncome(this.incomeservice.incomeForm.value)
      );
    } else {
      alert('please fill the form as directed');
    }
  }
  delete(id) {
    this.store.dispatch(incomeActions.deleteIncome({ id }));
  }
  ngOnDestroy() {
    this.incomeservice.incomeForm.reset();
  }
}
