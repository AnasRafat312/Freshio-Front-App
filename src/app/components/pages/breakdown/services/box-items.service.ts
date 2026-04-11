import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { ResponseModel } from 'src/app/shared/model/response';
import {
  BoxItemResponseDto,
  CreateBoxItemDto,
  UpdateBoxItemDto
} from '../core/models/box.model';

@Injectable({
  providedIn: 'root'
})
export class BoxItemsService {
  private baseUrl: string;

  constructor(
    private http: HttpClient,
    private constant: Constant
  ) {
    this.baseUrl = `${this.constant.API_ENDPOINT}BoxItems`;
  }

  /**
   * Get all box items
   */
  getAll(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.baseUrl}/GetAll`);
  }

  /**
   * Get box item by ID
   */
  getById(id: number): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.baseUrl}/GetById/${id}`);
  }

  /**
   * Get box items by box ID
   */
  getByBoxId(boxId: number): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.baseUrl}/GetByBoxId/${boxId}`);
  }

  /**
   * Create a new box item
   */
  create(createDto: CreateBoxItemDto): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.baseUrl}/Create`, createDto);
  }

  /**
   * Update an existing box item
   */
  update(id: number, updateDto: UpdateBoxItemDto): Observable<ResponseModel> {
    return this.http.put<ResponseModel>(`${this.baseUrl}/Update/${id}`, updateDto);
  }

  /**
   * Delete a box item
   */
  delete(id: number): Observable<ResponseModel> {
    return this.http.delete<ResponseModel>(`${this.baseUrl}/Delete/${id}`);
  }
}
