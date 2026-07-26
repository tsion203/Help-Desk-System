import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

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

  @HostBinding('class.is-collapsed')
  get collapsedClass(): boolean {
    return this.isCollapsed;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }
}
