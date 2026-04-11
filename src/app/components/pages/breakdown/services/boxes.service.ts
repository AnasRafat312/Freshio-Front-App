import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import {
  BoxResponseDto,
  BoxDetailsDto,
  CreateBoxDto,
  UpdateBoxDto,
  BreakdownDashboardDto
} from '../core/models/box.model';

@Injectable({
  providedIn: 'root'
})
export class BoxesService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private constant: Constant
  ) {
    this.baseUrl = `${this.constant.API_ENDPOINT}Boxes`;
  }

  /**
   * Get all boxes
   */
  getAll(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.baseUrl}/GetAll`);
  }

  /**
   * Get box by ID
   */
  getById(id: number): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.baseUrl}/GetById/${id}`);
  }

  /**
   * Get boxes by type (In or Out)
   */
  getByType(type: string): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.baseUrl}/GetByType?type=${type}`);
  }

  /**
   * Create a new box
   */
  create(createDto: CreateBoxDto): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/Create`, createDto);
  }

  /**
   * Update an existing box
   */
  update(id: number, updateDto: UpdateBoxDto): Observable<ResponseModel> {
    return this.http.put<ResponseModel>(`${this.baseUrl}/Update/${id}`, updateDto);
  }

  /**
   * Delete a box
   */
  delete(id: number): Observable<ResponseModel> {
    return this.http.delete<ResponseModel>(`${this.baseUrl}/Delete/${id}`);
  }
}
