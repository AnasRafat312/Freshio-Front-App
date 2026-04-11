import { effect, Injectable } from '@angular/core';
import { ConfigService } from 'src/app/shared/services/config.service';

@Injectable({
    providedIn: 'root'
})
export class Constant {
    public BASIC_DATA_API_ENDPOINT: string;
    public ACTIVITY_API_ENDPOINT: string;
    public GETWAY_API_ENDPOINT: string;
    public CRM_API_ENDPOINT: string;
    public FINANCE_API_ENDPOINT: string;
    public MAIN_GetwAY_API_ENDPOINT: string;
    public PAYROLL_HR_ENDPOINT: string;
    public WAREHOUSE_API_ENDPOINT: string;
    public TICKETS_API_ENDPOINT: string;
    public SRM_API_ENDPOINT: string;
    public API_ENDPOINT: string;

    public LOGOUT: string;
    public MAIN_HOME: string;

    public ACTIVITY_WEB_ENDPOINT: string;
    public SRM_WEB_ENDPOINT: string;
    public PROJECTMANAGEMENT_WEB_ENDPOINT: string;
    public NEW_HR_WEB_ENDPOINT: string;
    public PIPELINE_WEB_ENDPOINT: string;
    public NEWFINANCE_WEB_ENDPOINT: string;
    public WAREHOUSE_WEB_ENDPOINT: string;

    public USER_PROFILE_IMAGE_SOURCE: string;
    public COMPANY_PROFILE_IMAGE_SOURCE: string;
    public ENTITY_IMAGE_SOURCE: string;
    public RESOURCE_IMAGE_SOURCE: string;
    public ATTACHMENT_FILES_SOURCE: string;

    constructor(
        private configService: ConfigService) {
            
//        this.configService.loadConfig().subscribe((res: any) => {
            effect(() => {
                const api:any = configService.config();
                this.BASIC_DATA_API_ENDPOINT = api?.BASIC_DATA_API_ENDPOINT;
                this.TICKETS_API_ENDPOINT = api?.TICKETS_API_ENDPOINT;
                this.ACTIVITY_API_ENDPOINT = api?.ACTIVITY_API_ENDPOINT;
                this.GETWAY_API_ENDPOINT = api?.GETWAY_API_ENDPOINT;
                this.CRM_API_ENDPOINT = api?.CRM_API_ENDPOINT;
                this.FINANCE_API_ENDPOINT = api?.FINANCE_API_ENDPOINT;
                this.MAIN_GetwAY_API_ENDPOINT = api?.MAIN_GetwAY_API_ENDPOINT;
                this.PAYROLL_HR_ENDPOINT = api?.PAYROLL_HR_ENDPOINT;
                this.WAREHOUSE_API_ENDPOINT = api?.WAREHOUSE_API_ENDPOINT;
                this.SRM_API_ENDPOINT = api?.SRM_API_ENDPOINT;
                this.API_ENDPOINT = api?.API_ENDPOINT;

                this.LOGOUT = api?.LOGOUT;
                this.MAIN_HOME = api?.MAIN_HOME;

                this.ACTIVITY_WEB_ENDPOINT = api?.ACTIVITY_WEB_ENDPOINT;
                this.SRM_WEB_ENDPOINT = api?.SRM_WEB_ENDPOINT;
                this.PROJECTMANAGEMENT_WEB_ENDPOINT = api?.PROJECTMANAGEMENT_WEB_ENDPOINT;
                this.NEW_HR_WEB_ENDPOINT = api?.NEW_HR_WEB_ENDPOINT;
                this.PIPELINE_WEB_ENDPOINT = api?.PIPELINE_WEB_ENDPOINT;
                this.NEWFINANCE_WEB_ENDPOINT = api?.NEWFINANCE_WEB_ENDPOINT;
                this.WAREHOUSE_WEB_ENDPOINT = api?.WAREHOUSE_WEB_ENDPOINT;

                this.USER_PROFILE_IMAGE_SOURCE = api?.USER_PROFILE_IMAGE_SOURCE;
                this.COMPANY_PROFILE_IMAGE_SOURCE = api?.COMPANY_PROFILE_IMAGE_SOURCE;
                this.ENTITY_IMAGE_SOURCE = api?.ENTITY_IMAGE_SOURCE;
                this.RESOURCE_IMAGE_SOURCE = api?.RESOURCE_IMAGE_SOURCE;
                this.ATTACHMENT_FILES_SOURCE = api?.ATTACHMENT_FILES_SOURCE;
            })
//        });
    }
}
