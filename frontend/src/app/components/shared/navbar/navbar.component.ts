import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../services/auth.service';
import { GlobalSearchService, SearchContext } from '../../../services/global-search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  readonly searchForm = new FormGroup({ search: new FormControl('', { nonNullable: true }) });
  readonly search = inject(GlobalSearchService);
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly auth: AuthService, private readonly router: Router) {}
  ngOnInit(): void {
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd), startWith(null), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.search.setContext(this.contextForUrl(this.router.url));
      this.searchForm.controls.search.setValue('', { emitEvent: false });
    });
    this.searchForm.controls.search.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((term) => this.search.setTerm(term));
  }
  private contextForUrl(url: string): SearchContext {
    const path = url.split(/[?#]/)[0];
    const contexts: Record<string, string> = { '/tickets': 'Search Ticket ID...', '/users': 'Search Users...', '/departments': 'Search Departments...', '/roles': 'Search Roles...', '/categories': 'Search Categories...', '/notifications': 'Search Notifications...' };
    return { enabled: !!contexts[path], placeholder: contexts[path] ?? 'Search…' };
  }
  get isEmployee(): boolean { return this.auth.isEmployee(); }
}
