import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'globalSearch', standalone: true })
export class GlobalSearchPipe implements PipeTransform {
  transform<T>(items: readonly T[] | null | undefined, term: string): T[] {
    if (!items) return []; const query = term.trim().toLocaleLowerCase();
    if (!query) return [...items]; return items.filter((item) => this.searchableText(item).includes(query));
  }
  private searchableText(value: unknown): string {
    if (value == null) return '';
    if (Array.isArray(value)) return value.map((item) => this.searchableText(item)).join(' ').toLocaleLowerCase();
    if (typeof value === 'object') return Object.values(value).map((item) => this.searchableText(item)).join(' ').toLocaleLowerCase();
    return String(value).toLocaleLowerCase();
  }
}
