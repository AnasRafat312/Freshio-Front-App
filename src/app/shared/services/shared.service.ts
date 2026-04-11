import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PageNaming } from '../components/page-info/core/page-naming';
import { Constant } from 'src/app/core/constants/constant';
import { AbstractControl, FormGroup, Validators } from '@angular/forms';
import { ResponseModel } from '../model/response';
import {
    MultiSelectTableFilter,
    NormalTableColumn,
} from '../core/normalTableColumn.model';
import * as XLSX from 'xlsx';
import { MessageService } from 'primeng/api';
import { RequiredDropDown } from '../model/RequiredDropDown';
import { ReturnedDropDown } from '../model/ReturnedDropDown';
import { FilterType } from '../core/enums/filter-type.enum';
import { TranslateToArabicPipe } from 'src/app/core/pipes/translate-to-arabic.pipe';
@Injectable({
    providedIn: 'root',
})
export class SharedService {
    isDetailsSubject = new BehaviorSubject(null);
    isDetails = this.isDetailsSubject.asObservable();
    translatePipe = new TranslateToArabicPipe()
    constructor(
        private constant: Constant,
        private http: HttpClient,
        private messageService: MessageService
    ) { }

    private configUrl = 'config.json';
    getIsDetails() {
        return this.isDetails;
    }
    setIsDetails(value: boolean) {
        localStorage.setItem('isDetails', JSON.stringify(value));
        return this.isDetailsSubject.next(value);
    }
    getTypes(data, enumName, typeName: string) {
        let testList = [];
        let finalList = [];
        data.forEach((element) => {
            let Label = this.getKeyNameByValue(enumName, element[typeName]);
            testList.push({ label: Label, value: element[typeName] });
        });
        const uniqueObjects = {};
        finalList = testList.filter((value) => {
            const stringifiedValue = JSON.stringify(value);
            if (!(stringifiedValue in uniqueObjects)) {
                uniqueObjects[stringifiedValue] = true;
                return true;
            }
            return false;
        });
        return finalList;
    }
    getKeyNameByValue(enumObject: any, value: number): string | null {
        const keys = Object.keys(enumObject).filter(
            (key) => typeof enumObject[key] === 'number'
        );
        for (const key of keys) {
            if (enumObject[key] === value) {
                return key;
            }
        }
        return null;
    }
    getTypeList(enumName) {
        let list = [];
        let counter = 0;
        for (let key in enumName) {
            if (
                enumName.hasOwnProperty(key) &&
                counter <= Object.keys(enumName).length / 2 - 1
            ) {
                const value = enumName[key];
                const formattedLabel = value.replace(/([A-Z])/g, ' $1'); // Add space before each capital character
                list.push({ label: formattedLabel, value: Number(key), labelAr: this.translatePipe.transform(formattedLabel, 'ar') });
                counter++;
            }
        }
        console.log(list);
        return list;
    }
    private config: any;
    /*   loadConfig(): Observable<any> {
    return this.http.get('/assets/config.json'); // Adjust the path based on your configuration file location
  } */
    getConfig(): any {
        return this.config;
    }
    getDateTime(date, time?) {
        if (date !== '' || date !== null || date !== undefined) {
            const startDate = new Date(date);
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to the month because months are zero-based
            const day = String(startDate.getDate()).padStart(2, '0');
            if (time) {
                const Time = time;
                const formattedDate = `${year}-${month}-${day} ${Time}`;
                return formattedDate;
            } else {
                const dateTime = new Date(date);
                const hours = String(dateTime.getHours()).padStart(2, '0');
                const minutes = String(dateTime.getMinutes()).padStart(2, '0');
                const seconds = String(dateTime.getSeconds()).padStart(2, '0');
                const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                return formattedDate;
            }
        } else {
            return null;
        }
    }
    getBasicsBodyProbs(
        normal?: boolean,
        Delete?: boolean,
        IDInDelete?: number
    ) {
        if (normal) {
            return {
                CompanyID: Number(localStorage.getItem('companyId')),
                CreatedBy: Number(localStorage.getItem('userId')),
                CreatedDateTime: this.getDateTime(new Date()),
            };
        } else {
            return {
                ItemID: IDInDelete,
                DeletedBy: Number(localStorage.getItem('userId')),
                DeletedDateTime: this.getDateTime(new Date()),
            };
        }
    }

    getListOfMultiSelectInTableFilter(Set, element, list, type) {
        const name = element[type];
        if (!Set.has(name)) {
            Set.add(name);
            list.push({ Name: name });
        }
    }
    multiFilterListInTable(
        event: any[],
        field: string,
        mainlist: any[],
        listContainer?: any
    ) {
        let tempList = [];
        //event = []
        Object.keys(listContainer).forEach((key) => {
            if (field == listContainer[key]?.field) {
                listContainer[key].list = event;
            }
            listContainer[key].Names = listContainer[key].list
                ? listContainer[key].list.map((ele) => ele.Name)
                : [];
        });
        tempList = mainlist.filter((row) =>
            this.generateFilterCondition(row, listContainer)
        );
        return tempList;
    }
    generateFilterCondition(row, listContainer) {
        var conditionItems = {};
        Object.keys(listContainer).forEach((key) => {
            const namesList = listContainer[key].Names;
            if (namesList) {
                if (
                    namesList.length === 0 ||
                    namesList.includes(row[listContainer[key].field])
                ) {
                    listContainer[key].IsContains = true;
                } else {
                    listContainer[key].IsContains = false;
                }
            } else {
                listContainer[key].IsContains = true;
            }
            conditionItems[listContainer[key].field] =
                listContainer[key].IsContains;
        });
        return this.logicalAnd(conditionItems);
    }
    logicalAnd(obj: Record<string, boolean>): boolean {
        return Object.values(obj).every((value) => value === true);
    }
    filterListInTable(
        event: any[],
        field: string,
        mainlist: any[],
        filteredList: any[]
    ) {
        let tempList = mainlist;
        if (event.length > 0) {
            filteredList = [];
            event.forEach((name) => {
                tempList = mainlist.filter((ele) => ele?.[field] == name?.Name);
                filteredList = [...filteredList, ...tempList];
            });
        } else {
            filteredList = mainlist;
        }
        return filteredList;
    }
    /*   getEndPointsConfig(): Observable<any> {
    return this.http.get(this.configUrl);
  } */
    //shared confirm Action
    confirm(url: any, data?: any, methodType?: string): Observable<any> {
        if (methodType == 'Post') {
            return this.http.post<any>(url, data);
        }
        if (methodType == 'Put') {
            return this.http.put<any>(url, data);
        }
        if (methodType == 'Get') {
            return this.http.get<any>(url + data);
        }
        return null;
    }
    setPageLocalName(pageName: string) {
        localStorage.removeItem(PageNaming.LOCALKEY);
        localStorage.setItem(PageNaming.LOCALKEY, pageName);
    }
    getAllAccountsInDropdowns(): Observable<any[]> {
        return this.http.get<any[]>(
            this.constant.FINANCE_API_ENDPOINT +
            'FinancialAccount/FinancialAccountsLookupList/' +
            localStorage.getItem('companyId')
        );
    }
    // function return if that control has specific validation
    hasValidator(
        form: FormGroup,
        controlName: string,
        validatorName: string
    ): boolean {
        const control = form.get(controlName);
        if (control) {
            const validators = control.validator
                ? control.validator({} as AbstractControl)
                : null;
            return validators ? validators[validatorName] : false;
        }
        return false;
    }
    //Shared Create And Update
    Create(url: string, model): Observable<ResponseModel> {
        return this.http.post<ResponseModel>(url, model);
    }
    Update(url: string, model): Observable<ResponseModel> {
        return this.http.put<ResponseModel>(url, model);
    }
    exportToExcel(
        cols: { field: string; header: string }[],
        data: any[],
        fileName: string
    ): void {
        // Step 1: Create a list of objects for Excel
        const exportData = [];

        // Step 2: Construct the headers row
        const headers = {};
        cols.forEach((col) => {
            headers[col.field] = col.header;
        });
        exportData.push(headers);

        // Step 3: Add data rows
        data.forEach((item) => {
            const row = {};
            cols.forEach((col) => {
                row[col.field] = item[col.field];
            });
            exportData.push(row);
        });

        // Step 4: Create a worksheet and add data
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);

        // Step 5: Create a workbook and add the worksheet
        const workbook: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        // Step 6: Export the workbook as an Excel file
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    }
    exportPdf(ExportColumns, list, fileName) {
        const rows = list.map((ele) => {
            ExportColumns.forEach((col) => {
                if (col?.type == 4)
                    ele[col.dataKey] = this.getDateTime(ele[col.dataKey]);
            });
            return ele;
        });

        import('jspdf').then((jsPDF) => {
            import('jspdf-autotable').then((x) => {
                const doc = new jsPDF.default('p', 'px', 'a4');
                (doc as any).autoTable(ExportColumns, rows);
                doc.save(`${fileName}.pdf`);
            });
        });
    }
    onRowReorder(event?, currentIndex?, otherIndex?) {
        let fromIndex = 0;
        let toIndex = 0;
        if (currentIndex || otherIndex) {
            fromIndex = currentIndex;
            toIndex = otherIndex;
        } else {
            fromIndex = event.dragIndex;
            toIndex = event.dropIndex;
        }
    }
    rowUp(index, filteredList, movedRowIndex, backgroundColor) {
        if (index > 0) {
            const currentRequest = filteredList.at(index);
            const topRequest = filteredList.at(index - 1);
            //set row data
            filteredList[index] = topRequest;
            filteredList[index - 1] = currentRequest;
            //set forms data
            this.onRowReorder(undefined, index, index - 1);
        }
    }
    rowDown(index, filteredList, movedRowIndex, backgroundColor) {
        if (index < filteredList.length - 1) {
            const currentRequest = filteredList.at(index);
            const topRequest = filteredList.at(index + 1);
            //set row data
            filteredList[index] = topRequest;
            filteredList[index + 1] = currentRequest;
            //set forms data
            this.onRowReorder(undefined, index, index + 1);
        }
    }
    // start filtering in table
    setFilteredListInMultiSelected(
        list: any[],
        cols: NormalTableColumn[],
        model
    ) {
        // generate filter lists
        const filters: MultiSelectTableFilter[] = [];
        cols.forEach((col) => {
            if (col.filterType == FilterType.multi) {
                const filter = {
                    key: col.field,
                    set: new Set<string>(),
                    filterList: model[col.field].filterList,
                };
                filters.push(filter);
            }
        });
        if (list?.length > 0) {
            list.forEach((Row) => {
                // Date Casting
                cols.forEach((col) => {
                    if (col.filterType == FilterType.date || col.filterType == FilterType['full-date'] || col.filterType == FilterType.time) {
                        if (Row[col.field]) {
                            Row[col.field] = new Date(Row[col.field]);
                        }
                    }
                });
                filters.forEach((filter) => {
                    this.getListOfMultiSelectInTableFilter(
                        filter.set,
                        Row,
                        filter.filterList,
                        filter.key
                    );
                });
            });
        }
    }
    //Shared Filter Methods
    generateColumns(cols: NormalTableColumn[], model: any, columnContainer) {
        cols = Object.keys(model).map((key, i) => {
            // if col is multi select add that object to columnContainer
            if (model[key].filterType == 2) {
                columnContainer[key] = { list: null, field: key };
            }
            const col: NormalTableColumn = {
                field: key,
                filterType: model[key].filterType,
                bindType: model[key].bindType,
                filterList: [],
                hidden: model[key].hidden,
                header: model[key].header,
                hideSorting: model[key]?.hideSorting || false,
            };
            if (i == 0) {
                col.customExportHeader = model[key].header;
            }
            return col;
        });
        return cols;
    }
    formatHeader(key: string): string {
        return key.replace(/([A-Z])/g, ' $1').trim();
    }
    setFormValues(form: FormGroup, data: any) {
        Object.keys(form?.controls).forEach((key) => {
            if (data[key] !== null || data[key] !== undefined) {
                form.controls[key].setValue(data[key]);
            }
        });
    }
    getAllCompaniesByUserID() {
        return this.http.get<any[]>(
            this.constant.GETWAY_API_ENDPOINT +
            'Authentication/AccessableUserComponies/' +
            localStorage.getItem('userId')
        );
    }
    handelValidatorToFormControls(
        IsSet: boolean = true,
        Form: FormGroup,
        ControlsList: string[],
        Validator: string,
        isClear: boolean = false
    ) {
        Object.keys(Form?.controls).forEach((key: any) => {
            if (ControlsList.some((control) => control == key)) {
                if (IsSet) {
                    isClear ? Form.controls[key].setValue(null) : null;
                    Form.controls[key].setValidators([Validators[Validator]]);
                } else {
                    Form.controls[key].setValue(null);
                    Form.controls[key].clearValidators();
                }
                Form.controls[key].updateValueAndValidity();
            }
        });
    }
    getAllDropdowns(requiredDropDowns: RequiredDropDown): Observable<ReturnedDropDown> {
        return this.http.post<ReturnedDropDown>(`${this.constant.BASIC_DATA_API_ENDPOINT}DropdownData/GetDropdownDataLookUp`, requiredDropDowns);
    }
    removeDuplicates(arr, prop) {
        return arr.filter((obj, index, self) =>
            index === self.findIndex((el) => el[prop] === obj[prop])
        );
    }
    getBankInfoAccountsByEntityID(id: number): Observable<any[]> {
        return this.http.get<any[]>(this.constant.BASIC_DATA_API_ENDPOINT + 'EntityBankingInfo/GetEntityBankingInfoByEntity/' + id)
    }
}
