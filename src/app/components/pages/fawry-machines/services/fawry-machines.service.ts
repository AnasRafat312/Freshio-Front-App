import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { FawryMachinesStore } from '../store/fawry-machines.store';

@Injectable({
  providedIn: 'root'
})
export class FawryMachinesService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private fawryMachinesStore: FawryMachinesStore,
  ) { }

  /**
   * Get all fawry machines from the API and store in signal
   * Automatically subscribes and updates the store
   */
  getFawryMachines(): void {
    const url = `${this.constant.API_ENDPOINT}FawryMachines/GetAll`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.fawryMachinesStore.setFawryMachines(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading fawry machines:', error);
      }
    });
  }

  /**
   * Get fawry machine by ID from the API
   * @param id - Fawry Machine ID
   */
  getFawryMachineById(id: number): void {
    const url = `${this.constant.API_ENDPOINT}FawryMachines/GetById/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          // Can be used for edit mode if needed
        }
      },
      error: (error) => {
        console.error('Error loading fawry machine:', error);
      }
    });
  }

  /**
   * Get fawry machine details by ID from the API and store in signal
   * Automatically subscribes and updates the store
   * @param id - Fawry Machine ID
   */
  getFawryMachineDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}FawryMachines/GetDetails/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.fawryMachinesStore.setFawryMachineDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading fawry machine details:', error);
        this.fawryMachinesStore.setFawryMachineDetails(null);
      }
    });
  }
}
