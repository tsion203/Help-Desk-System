import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  isAdmin = true; // Replace with the authenticated user's role check.
  isCollapsed = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  @HostBinding('class.is-collapsed')
  get collapsedClass(): boolean {
    return this.isCollapsed;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}
