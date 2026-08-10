import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({ selector:'app-pagination', standalone:true, imports:[CommonModule], templateUrl:'./pagination.component.html', styleUrl:'./pagination.component.scss' })
export class PaginationComponent {
  @Input() page=0; @Input() pageSize=5; @Input() totalElements=0; @Input() totalPages=0;
  @Output() pageChange=new EventEmitter<number>();
  get pages(): number[] { const start=Math.max(0,Math.min(this.page-2,this.totalPages-5)); const end=Math.min(this.totalPages,start+5); return Array.from({length:Math.max(0,end-start)},(_,i)=>start+i); }
  get startRecord(): number { return this.totalElements ? this.page*this.pageSize+1 : 0; }
  get endRecord(): number { return Math.min((this.page+1)*this.pageSize,this.totalElements); }
}
