import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
    imageSignal = signal('');
  constructor(
        private constant: Constant,private http: HttpClient) { }
  getUserProfileData(routeParameters: any): Observable<any> {

    return this.http.post<any>(this.constant.GETWAY_API_ENDPOINT+`AssembleUser/GetUserProfile`, routeParameters);
  }
  changeProfilePicture(formData: FormData): Observable<any> {
    return this.http.post<any>(
      this.constant.GETWAY_API_ENDPOINT + 'AssembleUser/ChangeUserProfilePicture',
      formData
    );
  }
  setImageName(name) {
    this.imageSignal.set(name);
  }
  getImageName() {
    return this.imageSignal;
  }

}
