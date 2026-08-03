import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly userService: UserService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loading = true; this.userService.getAll().subscribe({ next: (items) => { this.users = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load users.'; this.loading = false; this.cdr.markForCheck(); } }); }
  deleteUser(id: number, event: Event): void { event.stopPropagation(); this.userService.delete(id).subscribe({ next: () => { this.users = this.users.filter((item) => item.id !== id); this.toast.success('User deleted successfully.'); }, error: (error) => this.toast.error(error, 'Unable to delete user.') }); }
}
