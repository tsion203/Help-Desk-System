import { Routes } from '@angular/router';

import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';

import { HomeComponent } from './components/home/home.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';

import { UserListComponent } from './components/users/user-list/user-list.component';
import { UserFormComponent } from './components/users/user-form/user-form.component';
import { UserDetailsComponent } from './components/users/user-details/user-details.component';
import { ProfileFormComponent } from './components/users/profile-form/profile-form.component';

import { DepartmentListComponent } from './components/departments/department-list/department-list.component';
import { DepartmentFormComponent } from './components/departments/department-form/department-form.component';

import { RoleListComponent } from './components/roles/role-list/role-list.component';
import { RoleFormComponent } from './components/roles/role-form/role-form.component';

import { TicketListComponent } from './components/tickets/ticket-list/ticket-list.component';
import { TicketDetailsComponent } from './components/tickets/ticket-details/ticket-details.component';
import { TicketFormComponent } from './components/tickets/ticket-form/ticket-form.component';
import { TicketUpdateComponent } from './components/tickets/ticket-update/ticket-update.component';

import { TicketCommentListComponent } from './components/tickets/ticket-comment-list/ticket-comment-list.component';
import { TicketCommentFormComponent } from './components/tickets/ticket-comment-form/ticket-comment-form.component';

import { TicketAttachmentListComponent } from './components/tickets/ticket-attachment-list/ticket-attachment-list.component';
import { TicketAttachmentFormComponent } from './components/tickets/ticket-attachment-form/ticket-attachment-form.component';

import { TicketAssignmentHistoryComponent } from './components/tickets/ticket-assignment-history/ticket-assignment-history.component';
import { TicketStatusHistoryComponent } from './components/tickets/ticket-status-history/ticket-status-history.component';
import { NotificationListComponent } from './components/notifications/notification-list/notification-list.component';
import { authGuard } from './auth.guard';
import { AccessDeniedComponent } from './components/auth/access-denied/access-denied.component';
import { CategoryListComponent } from './components/categories/category-list/category-list.component';
import { CategoryFormComponent } from './components/categories/category-form/category-form.component';

export const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'SUPERVISOR'] } },

  { path: 'users', component: UserListComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'users/new', component: UserFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'users/:id/edit', component: UserFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'users/:id', component: UserDetailsComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'EMPLOYEE'] } },
  { path: 'profile', component: ProfileFormComponent, canActivate: [authGuard], data: { roles: ['EMPLOYEE'] } },

  { path: 'departments', component: DepartmentListComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'departments/new', component: DepartmentFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'departments/:id/edit', component: DepartmentFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  { path: 'roles', component: RoleListComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'roles/new', component: RoleFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'roles/:id/edit', component: RoleFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  { path: 'categories', component: CategoryListComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'categories/new', component: CategoryFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },
  { path: 'categories/:id/edit', component: CategoryFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN'] } },

  { path: 'tickets', component: TicketListComponent, canActivate: [authGuard] },
  { path: 'tickets/new', component: TicketFormComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'EMPLOYEE'] } },
  { path: 'tickets/:id', component: TicketDetailsComponent, canActivate: [authGuard] },
  { path: 'tickets/:id/edit', component: TicketUpdateComponent, canActivate: [authGuard], data: { roles: ['ADMIN', 'SUPERVISOR', 'SUPPORT_OFFICER', 'EMPLOYEE'] } },

  { path: 'tickets/:id/comments', component: TicketCommentListComponent, canActivate: [authGuard] },
  { path: 'tickets/:id/comments/new', component: TicketCommentFormComponent, canActivate: [authGuard] },

  { path: 'tickets/:id/attachments', component: TicketAttachmentListComponent, canActivate: [authGuard] },
  { path: 'tickets/:id/attachments/new', component: TicketAttachmentFormComponent, canActivate: [authGuard] },

  { path: 'tickets/:id/assignment-history', component: TicketAssignmentHistoryComponent, canActivate: [authGuard] },

  { path: 'tickets/:id/status-history', component: TicketStatusHistoryComponent, canActivate: [authGuard] },

  { path: 'notifications', component: NotificationListComponent, canActivate: [authGuard] },
  { path: 'access-denied', component: AccessDeniedComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' }

];
