import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constant } from 'src/app/core/constants/constant';
@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor(private http: HttpClient, private constant: Constant) { }

  // WBS

  getWBSByProject(id: number) {
    return this.http.get<any[]>(
      this.constant.ACTIVITY_API_ENDPOINT +
      'WBSHeader/GetWBSHeaderByProjectID/' +
      id
    );
  }
}
