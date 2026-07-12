import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ContentChild, TemplateRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LanguagesService } from '../../services/languages.service';
import { SharedService } from '../../services/shared.service';
import { Table, TableFilterEvent } from 'primeng/table';
import { fadeInOut } from 'src/app/core/animnations/animations';
import { NormalTableColumn } from '../../core/normalTableColumn.model';
import { PragraphSlicePipe } from 'src/app/core/pipes/pragraph-slice.pipe';

@Component({
  selector: 'app-basic-table',
  templateUrl: './basic-table.component.html',
  styleUrls: ['./basic-table.component.scss'],
  animations: [fadeInOut],
  providers: [PragraphSlicePipe]
})
export class BasicTableComponent implements OnInit, OnChanges {
    languageFactor = 'en';
    // selected item
    selectedRow!: any;
    // main Lists
    @Input() mainList: any[] = [];
    @Input() filteredList: any[] = [];
    // columns probs
    @Input() globalFilterFields:string[] = []
    @Input() ActionsList: { icon: string, tooltip: string, styleClass: string, action: (row: any,index?:number) => void, condition?: (row: any) => boolean, disabled?: (row: any,index?:number) => boolean }[] = [];
    @Input() getRowStyle?: (row: any) => any; // Function to get custom row styles
    cols: NormalTableColumn[] = [];
    _selectedColumns: NormalTableColumn[];
    loading: boolean = true;
    // Reorder probs
    movedRowIndex: number | null = null;
    backgroundColor!: string;
    // table options
    @Input() hasFooter = false;
    @Input() hasFilterRow = true;
    @Input() hasCaptionRow = true;
    @Input() rowReorder = true;
    @Input() columnReorder = true;
    @Input() SelectShownColumns = true;
    @Input() resizableColumns = 'true';
    //context menu probs
    @Input() items!: MenuItem[];
    // table filtering
    @Input() model = {};
    columnContainer: any = {};
    // exporting probs
    exportColumns!: any[];
    @Input() exportFileName: string = 'Export';

    // NEW: Add support for custom templates
    @ContentChild('statusCell') statusCellTemplate: TemplateRef<any>;
    @ContentChild('isInBudgetCell') isInBudgetCellTemplate: TemplateRef<any>;
    @Output() selectedRowChange = new EventEmitter<any>();

    constructor(
        private language: LanguagesService,
        private sharedService: SharedService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        
        this.cols = this.generateColumns(this.cols, this.model);
        this._selectedColumns = this.cols?.filter(col => !col?.hidden);
        this.exportColumns = this.cols.map((col) => ({
            title: col.header,
            dataKey: col.field,
            type: col.filterType,
        }));
        this.getAllRows()
    }

    ngOnInit() {
        this.language.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
            this.cols = this.generateColumns(this.cols, this.model);
            this._selectedColumns = this.cols?.filter(col => !col?.hidden);
            this.exportColumns = this.cols.map((col) => ({
                title: col.header,
                dataKey: col.field,
                type: col.filterType,
            }));
            this.globalFilterFields = this.cols.map((col) => col.field);
        });
    }

    clear(table: Table) {
        table.clear();
        this.filteredList = this.mainList;
    }

    setFilteredListInMultiSelected(list: any[]) {
        this.sharedService.setFilteredListInMultiSelected(
            list,
            this.cols,
            this.model
        );
    }

    generateColumns(cols: NormalTableColumn[], model: any) {
        return this.sharedService.generateColumns(
            cols,
            model,
            this.columnContainer
        );
    }

    filterColumn(event, colName) {
        this.filteredList = this.sharedService.multiFilterListInTable(
            event,
            colName,
            this.mainList,
            this.columnContainer
        );
    }

    onColsSelect(event) {
        if(event?.originalEvent?.selected) {
            this._selectedColumns.pop()
            const index = this.cols.findIndex((col) => col.field === event?.itemValue?.field);
            this._selectedColumns.splice(index, 0, event?.itemValue)
        }
    }

    onRowReorder(index) {
        this.sharedService.onRowReorder(index);
    }

    rowUp(index) {
        this.sharedService.rowUp(
            index,
            this.filteredList,
            this.movedRowIndex,
            this.backgroundColor
        );
        this.movedRowIndex = index - 1;
        this.backgroundColor = 'rgb(224 255 223)';
    }

    rowDown(index) {
        this.sharedService.rowDown(
            index,
            this.filteredList,
            this.movedRowIndex,
            this.backgroundColor
        );
        this.movedRowIndex = index + 1;
        this.backgroundColor = 'rgb(255 223 223)';
    }

    exportExcel() {
        this.sharedService.exportToExcel(
            this._selectedColumns,
            this.filteredList,
            this.exportFileName
        );
    }

    exportPdf() {
        this.sharedService.exportPdf(
            this.exportColumns,
            this.filteredList,
            'Excuse'
        );
    }
    onRowSelect(event) {
        this.selectedRowChange.emit(this.selectedRow);
    }

    getAllRows() {
       this.setFilteredListInMultiSelected(this.filteredList);
       this.loading = false;
   }
}
