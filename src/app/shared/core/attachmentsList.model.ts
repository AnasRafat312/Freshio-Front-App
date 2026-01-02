export interface AttachmentsLists {
    deletedFiles: any[],
    selectedFiles: any[],
    updatedFiles: any[],
}
export interface AttachmentInputsModel {
    selectedFileInUpdate: any[];
    selectedFiles: any[];
    DeletedFileList: any[];
    ID: number;
    isMulti: boolean;
    returnFiles: boolean;
    isDetails: boolean ;
    TargetTable: string;
    fileNameAbbreviation:string;
    attachmentHostType:string;
}
