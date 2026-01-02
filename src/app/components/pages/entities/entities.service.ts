import { Constant } from 'src/app/core/constants/constant';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Entity } from './entity.model';
import { LoaderService } from 'src/app/shared/components/loading-spinner/services/loader.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ResponseModel } from 'src/app/shared/model/response';

@Injectable({
  providedIn: 'root'
})
export class EntityService {
  entityAttatchmentsSubject = new BehaviorSubject({})
  constructor(
        private constant: Constant,public http: HttpClient,
    private loaderService:LoaderService) { }
  getEntityAttatchments() {
    return this.entityAttatchmentsSubject.asObservable()
  }
  setEntityAttatchments(files) {
    return this.entityAttatchmentsSubject.next(files)
  }
  createEntity(userEntity:any):Observable<ResponseModel>{
    return this.http.post<ResponseModel>(this.constant.BASIC_DATA_API_ENDPOINT + 'UserEntity/CreateBuisnessEntity',userEntity)
  }
  getAllEntities(){
    return this.http.get<Entity[]>(this.constant.BASIC_DATA_API_ENDPOINT +'UserEntity/GetUserEntitysNotDeleted/' + localStorage.getItem('accountId'))
    //return this.http.get<Entity[]>(this.constant.BASIC_DATA_API_ENDPOINT +'UserEntity/GetUserEntitysNotDeleted/' + localStorage.getItem('companyId'))
  }
  deleteFile(model){
    return this.http.post(this.constant.BASIC_DATA_API_ENDPOINT + 'FileDocument/DeleteAttachment',model)
  }

  updateEntity(userEntity:any){
    return this.http.post<Entity>(this.constant.BASIC_DATA_API_ENDPOINT +'UserEntity/UpdateBuisnessEntity/',userEntity)
  }
  getCityById(id:any){
    const headers = new HttpHeaders().set('disableLoader', 'true');
    return this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT +'City/GetCityByCountryID/'+id,{headers:headers})
  }
  addNewCity(obj:any){
    return this.http.post<any[]>(this.constant.BASIC_DATA_API_ENDPOINT +'City/CreateCity/',obj)
  }

  getAllNationality(){
    return this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT +'Country/GetCountrysNotDeletedForAll')
  }
  getAllcountries(){
    return this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT +'Country/GetCountrysNotDeletedForAll')
  }
  getAllCities(){
    return this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT +'City/GetCitysNotDeleted/' + localStorage.getItem('companyId'))
  }
  getAllRolesClass(){
    return this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT +'EntityContactRoleClassification/GetEntityContactRoleClassificationsNotDeleted/' + localStorage.getItem('companyId'))
  }
  getAllPersonsContacts(){
    return this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT +'UserEntity/GetAllPersonEntityNotDeleted/' + localStorage.getItem('companyId'))
  }

  getEntityById(id){
    return this.http.get<Entity>(this.constant.BASIC_DATA_API_ENDPOINT +`UserEntity/GetAllEntityData/${id}/${localStorage.getItem('accountId')}`)
  }
  getTaxNoVlidity(obj: any) {
    const headers = new HttpHeaders().set('disableLoader', 'true');
    return this.http.post<boolean>(
      this.constant.BASIC_DATA_API_ENDPOINT + 'CompanyEntity/CheckTaxNumberExist',
      obj,
      { headers }
    );
  }

  getNationalNoVlidity(obj: any) {
    const headers = new HttpHeaders().set('disableLoader', 'true');
    return this.http.post<boolean>(
      this.constant.BASIC_DATA_API_ENDPOINT + 'PersonEntity/CheckNationalNumberExist',
      obj,
      { headers }
    );
  }
  addAttachment(attachment:any):Observable<any>{
    return this.http.post<any>(this.constant.BASIC_DATA_API_ENDPOINT + 'FileDocument/CreateAttachment',attachment)
  }
}
