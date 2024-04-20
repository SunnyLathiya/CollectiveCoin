import { Component, OnInit } from '@angular/core';
import { ExpenseService } from './expense.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-expense',
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent implements OnInit {
  expensedatapop: any;
  showAdditionalFields: boolean = false;

  constructor(
    public expenseservice: ExpenseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.expenseservice.getExpense().subscribe(() => {
      console.log('getting expense');
    });
  }
  openbox4(id: any) {
    this.router.navigate([`update-expense/${id}`], { relativeTo: this.route });
  }
  onCategoryChange(event: any) {
    const selectedCategory = event.target.value.trim(); // Trim whitespace
    console.log('Selected Category:', selectedCategory);
    console.log('Is Monthly Bills?', selectedCategory === 'monthlybills');
    this.showAdditionalFields = selectedCategory === 'monthlybills';
  }

  saveadd() {
    if (this.expenseservice.expenseForm.valid) {
      this.expenseservice.addExpense();
    } else {
      alert('please fill the form as directed');
    }
  }
}
