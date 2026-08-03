import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  appName = 'HelpDesk';
  notificationCount = 0;
  userInitials = '';
  readonly searchForm = new FormGroup({ search: new FormControl('', { nonNullable: true }) });
  constructor(private readonly auth: AuthService) {}
  get isEmployee(): boolean { return this.auth.isEmployee(); }
}
