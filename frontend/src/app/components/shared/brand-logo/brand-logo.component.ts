import { Component } from '@angular/core';

@Component({
  selector: 'app-brand-logo',
  standalone: true,
  template: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 13v-2a7 7 0 0 1 14 0v5M5 12H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v-6H5Zm14 0h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2v-6h1Z"/><path d="M18 18c0 2-1.5 3-4 3h-2"/></svg>`,
  styles: [`:host{display:grid;place-items:center;width:36px;height:36px;flex:0 0 auto;border-radius:9px;background:#153451;color:#fff}svg{width:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}`],
})
export class BrandLogoComponent {}
