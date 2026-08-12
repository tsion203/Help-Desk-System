import { ChangeDetectorRef, Component, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { UserService } from '../../../services/user.service';
import { BrandLogoComponent } from '../brand-logo/brand-logo.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, BrandLogoComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  userEmail = '';
  userName = '';
  userInitials = '';

  get isAdmin(): boolean { return this.authService.isAdmin(); }
  get isSupervisor(): boolean { return this.authService.isSupervisor(); }
  get isSupportOfficer(): boolean { return this.authService.isSupportOfficer(); }
  get isEmployee(): boolean { return this.authService.isEmployee(); }

  readonly notificationCount$ = new Observable<number>();

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.notificationCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    this.notificationService.refreshUnreadCount();
    this.userEmail = this.authService.getEmail();
    this.setFallbackIdentity();
    this.userService.getCurrentProfile().subscribe({
      next: (user) => {
        this.userEmail = user.email;
        this.userName = `${user.firstName} ${user.lastName}`.trim();
        this.userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        this.cdr.markForCheck();
      },
    });
  }

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

  private setFallbackIdentity(): void {
    const emailName = this.userEmail.split('@')[0] || 'User';
    const nameParts = emailName.split(/[._-]+/).filter(Boolean);
    this.userName = nameParts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    this.userInitials = nameParts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || 'U';
  }
}
