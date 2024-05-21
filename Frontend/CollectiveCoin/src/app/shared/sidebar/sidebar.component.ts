import { Component, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { LoginDataService } from '../services/login-data.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  imageform: FormGroup;
  name: string = '';
  photo: string = '';

  constructor(
    private router: Router,
    private logindataservice: LoginDataService
  ) {}

  isActive(Route: string) {
    return this.router.isActive(Route, true);
  }

  ngOnInit(): void {
    this.logindataservice.isLoggedin().subscribe((resultData) => {
      this.name = this.logindataservice.username;
      this.logindataservice.photo$.subscribe((photo) => {
        this.photo = photo;
      });
      this.logindataservice.name$.subscribe((name) => {
        this.name = name;
      });
    });
  }

  clearStorage() {
    localStorage.clear();
  }
}
