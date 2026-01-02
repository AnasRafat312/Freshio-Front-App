export interface NormalTableColumn {
    field: string,
    hidden?: boolean,
    textColor?: boolean,
    filterType: number,
    bindType?: number,
    filterList: any[],
    header: string,
    customExportHeader?:string
    hideSorting?: boolean;
}
export interface MultiSelectTableFilter {
    key: string,
    set: any,
    filterList: any[]
}
export interface ActionData {
  icon: string;
  tooltip: string;
  styleClass: string;
  action: (row: any, index?: number) => void;
  condition?: (row: any) => boolean;
  disabled?: (row: any, index?: number) => boolean;
}
