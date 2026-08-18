import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../models/user';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit {
  user: User | null = null;
  loading = false;
  errorMessage = '';
  constructor(private readonly userService: UserService, private readonly route: ActivatedRoute, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get('id')); this.loading = true; this.userService.getById(id).subscribe({ next: (user) => { this.user = user; this.loading = false; this.cdr.markForCheck(); }, error: () => { this.errorMessage = 'Unable to load user.'; this.loading = false; this.cdr.markForCheck(); } }); }
}
