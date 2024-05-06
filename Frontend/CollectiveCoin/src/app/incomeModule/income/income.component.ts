import { Component, OnInit, OnDestroy } from '@angular/core';

import { IncomeService } from '../../shared/services/income.service';
import { ActivatedRoute, Router } from '@angular/router';

import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { LoginDataService } from '../../shared/services/login-data.service';
@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css',
})
export class IncomeComponent implements OnInit, OnDestroy {
  incomedatapop: any;
  isEarning: any;
  data: any;
  bsConfig: Partial<BsDatepickerConfig>;
  constructor(
    public incomeservice: IncomeService,
    private router: Router,
    private route: ActivatedRoute,
    private logindataservice: LoginDataService
  ) {
    this.logindataservice.isLoggedin().subscribe(() => {
      this.isEarning = this.logindataservice.isEarning;
    });
  }
  ngOnInit(): void {
    this.incomeservice.getIncome().subscribe(() => {
      console.log(' subscriberd method is getting called');
    });
  }
  ngOnDestroy() {
    this.incomeservice.incomeForm.reset();
  }

  updateIncome(id: any) {
    this.router.navigate([`update-income/${id}`], { relativeTo: this.route });
  }

  save() {
    if (this.incomeservice.incomeForm.valid) {
      this.incomeservice.addIncome();
    } else {
      alert('please fill the form as directed');
    }
  }
}
