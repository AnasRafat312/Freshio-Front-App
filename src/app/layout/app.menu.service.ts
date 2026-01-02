import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MenuChangeEvent } from './api/menuchangeevent';

@Injectable({
    providedIn: 'root'
})
export class MenuService {

    private menuSource = new Subject<MenuChangeEvent>();
    private resetSource = new Subject();
   private dataSource = new BehaviorSubject<any[]>([]);
    currentMenue$ = this.dataSource.asObservable();
  
    settMenue(data: any) {
      this.dataSource.next(data);
    }
    menuSource$ = this.menuSource.asObservable();
    resetSource$ = this.resetSource.asObservable();

    onMenuStateChange(event: MenuChangeEvent) {
        this.menuSource.next(event);
    }

    reset() {
        this.resetSource.next(true);
    }
}
