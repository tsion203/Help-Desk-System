import { Injectable, signal } from '@angular/core';
export interface SearchContext { enabled: boolean; placeholder: string; }
@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  readonly term = signal(''); readonly enabled = signal(false); readonly placeholder = signal('Search…');
  setContext(context: SearchContext): void { this.enabled.set(context.enabled); this.placeholder.set(context.placeholder); this.clear(); }
  setTerm(term: string): void { this.term.set(term.trimStart()); }
  clear(): void { this.term.set(''); }
}
