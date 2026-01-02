import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { Constant } from 'src/app/core/constants/constant';
import { SharedService } from './shared.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AttachmentsService {
    constructor(
        private constant: Constant,private http: HttpClient,private sharedService:SharedService,private messageService:MessageService,private injector: Injector) { }
    getAllAttatchmentsByID(ID:number) :Observable<any[]>{
      return  this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT + 'AttachmentFinance/GetAttachmentFinanceByHostID/' + ID)
    }
    getAllAttatchmentsByHostIDAndHostTypeID(model:any,TargetTable:string='AttachmentBasic') :Observable<any[]>{
      return  this.http.post<any[]>(this.constant.BASIC_DATA_API_ENDPOINT + `${TargetTable}/GetHostAttachments`,model)
    }
    getAllAttatchmentsBasicByHostIDAndHostTypeID(model:any) :Observable<any[]>{
      return  this.http.post<any[]>(this.constant.BASIC_DATA_API_ENDPOINT + 'AttachmentBasic/GetHostAttachmentsBasic/',model)
    }
    addAttachment(attachment:any):Observable<any>{
      return this.http.post<any>(this.constant.BASIC_DATA_API_ENDPOINT + 'FileDocument/CreateAttachment',attachment)
    }
    deleteFile(model){
      return this.http.post(this.constant.BASIC_DATA_API_ENDPOINT + 'FileDocument/DeleteAttachment',model)
    }
    saveAttatchment(objectID, addlist: any[], attachHostType: string, FileNameAbbreviation: string, tableName: string, deletedList: any[] = []): Observable<any[]> {
      const attachmentRequests = [];

      if (addlist?.length > 0) {
        for (let i = 0; i < addlist.length; i++) {
          const formData = new FormData();
          formData.append('AttahcmentFile', addlist[i], addlist[i]?.name);
          formData.append('TargeTable', tableName);
          formData.append('AttachmentHostType', attachHostType);
          formData.append(
            'FileNameAbbreviation',
            FileNameAbbreviation + localStorage.getItem('companyId') + '_' + addlist[i]?.name
          );
          formData.append('CreatedDateTime', this.sharedService.getDateTime(new Date()));
          formData.append('companyId', localStorage.getItem('companyId'));
          formData.append('CreatedBy', localStorage.getItem('userId'));
          formData.append('AttachmentHostID', objectID);
          formData.append('IsEdit', 'false');
          formData.append('CompanyID', localStorage.getItem('companyId'));
          // Push each request (observable) to the array
          attachmentRequests.push(
            this.addAttachment(formData)
          );
        }
      }
      if (deletedList?.length > 0) {
        deletedList.forEach(ele => {
          attachmentRequests.push(this.deleteFile(ele))
        })
      }
      // Return an observable that completes when all attachment requests are completed
      return attachmentRequests.length > 0 ? forkJoin(attachmentRequests) : of([]);
    }
    saveAttatchmentWithHostFieldID(objectID, addlist: any[], attachHostType: string, FileNameAbbreviation: string, tableName: string, deletedList: any[] = []): Observable<any[]> {
      const attachmentRequests = [];

      if (addlist?.length > 0) {
        for (let i = 0; i < addlist.length; i++) {
          const formData = new FormData();
          formData.append('AttahcmentFile', addlist[i].file, addlist[i].file?.name);
          formData.append('TargeTable', tableName);
          formData.append('AttachmentHostType', attachHostType.toString());
          formData.append('AttachmentHostFieldID', addlist[i]?.AttachmentHostFieldID || null);
          formData.append(
            'FileNameAbbreviation',
            FileNameAbbreviation + localStorage.getItem('companyId') + '_' + addlist[i].file?.name
          );
          formData.append('CreatedDateTime', this.sharedService.getDateTime(new Date()));
          formData.append('companyId', localStorage.getItem('companyId'));
          formData.append('CreatedBy', localStorage.getItem('userId'));
          formData.append('AttachmentHostID', objectID);
          formData.append('IsEdit', 'false');
          formData.append('CompanyID', localStorage.getItem('companyId'));
          // Push each request (observable) to the array
          attachmentRequests.push(
            this.addAttachment(formData)
          );
        }
      }
      if (deletedList?.length > 0) {
        deletedList.forEach(ele => {
          attachmentRequests.push(this.deleteFile(ele))
        })
      }
      // Return an observable that completes when all attachment requests are completed
      return attachmentRequests.length > 0 ? forkJoin(attachmentRequests) : of([]);
    }
}
