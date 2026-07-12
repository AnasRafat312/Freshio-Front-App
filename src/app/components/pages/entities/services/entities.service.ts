import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import { EntitiesStore } from '../store/entities.store';
import { EntityDto, CreateEntityDto, EntityRole } from 'src/app/shared/model/freshio/entity.model';

@Injectable({
  providedIn: 'root'
})
export class EntitiesService {
  constructor(
    private http: HttpClient,
    private constant: Constant,
    private entitiesStore: EntitiesStore
  ) { }

  /**
   * Get all entities from the API and store in signal
   */
  getEntities(): void {
    const url = `${this.constant.API_ENDPOINT}Entities/GetAllEntities`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.entitiesStore.setEntities(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading entities:', error);
        this.entitiesStore.clearEntities();
      }
    });
  }

  /**
   * Get entities by role
   * @param role - Entity role filter
   */
  getEntitiesByRole(role: EntityRole): void {
    const url = `${this.constant.API_ENDPOINT}Entities/GetEntitiesByRoleType/${role}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.entitiesStore.setEntities(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading entities by role:', error);
      }
    });
  }

  /**
   * Get entity details by ID
   * @param id - Entity ID
   */
  getEntityDetails(id: number): void {
    const url = `${this.constant.API_ENDPOINT}Entities/GetEntity/${id}`;
    this.http.get<ResponseModel>(url).subscribe({
      next: (res: ResponseModel) => {
        if (res?.Success) {
          this.entitiesStore.setEntityDetails(res?.Data);
        }
      },
      error: (error) => {
        console.error('Error loading entity details:', error);
        this.entitiesStore.clearEntityDetails();
      }
    });
  }

  /**
   * Create new entity
   * @param entity - Entity data
   */
  createEntity(entity: CreateEntityDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/CreateEntity`;
    return this.http.post<ResponseModel>(url, entity);
  }

  /**
   * Update existing entity
   * @param id - Entity ID
   * @param entity - Updated entity data
   */
  updateEntity(id: number, entity: CreateEntityDto): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/UpdateEntity/${id}`;
    return this.http.put<ResponseModel>(url, entity);
  }

  /**
   * Disable entity
   * @param id - Entity ID
   */
  disableEntity(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/DeleteEntity/${id}`;
    return this.http.put<ResponseModel>(url, {});
  }

  /**
   * Enable entity
   * @param id - Entity ID
   */
  enableEntity(id: number): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/DeleteEntity/${id}`;
    return this.http.put<ResponseModel>(url, {});
  }

  /**
   * Get customers dropdown
   */
  getCustomers(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/GetEntitiesByRoleType/Customer`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Get suppliers dropdown
   */
  getSuppliers(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/GetEntitiesByRoleType/Supplier`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Get employees dropdown
   */
  getEmployees(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/GetEntitiesByRoleType/Employee`;
    return this.http.get<ResponseModel>(url);
  }

  /**
   * Get drivers dropdown
   */
  getDrivers(): Observable<ResponseModel> {
    const url = `${this.constant.API_ENDPOINT}Entities/GetEntitiesByRoleType/Driver`;
    return this.http.get<ResponseModel>(url);
  }
}
