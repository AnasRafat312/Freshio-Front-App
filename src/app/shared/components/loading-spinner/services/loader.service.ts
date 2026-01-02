import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private isLoading = new BehaviorSubject<boolean>(false);
  constructor() { }

  show() {
    setTimeout(() => this.isLoading.next(true));
    
  }

  hide() {
    setTimeout(() => this.isLoading.next(false));
  }

  getLoadingStatus() {
    return this.isLoading.asObservable();
  }
}
