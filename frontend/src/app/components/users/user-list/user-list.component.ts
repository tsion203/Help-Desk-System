import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  loading = false;
  errorMessage = '';
  constructor(private readonly userService: UserService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loading = true; this.userService.getAll().subscribe({ next: (items) => { this.users = items; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load users.'; this.loading = false; this.cdr.markForCheck(); } }); }
  deleteUser(id: number): void { this.userService.delete(id).subscribe({ next: () => (this.users = this.users.filter((item) => item.id !== id)), error: () => (this.errorMessage = 'Unable to delete user.') }); }
}
