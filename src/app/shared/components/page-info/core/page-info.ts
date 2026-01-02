// export interface PageInfo {
//     titleAR: string,
//     title: string,
//     description: string,
//     descriptionAR: string,
//     pageName:string,
//     steps:Step[],
//     ID:Number,
    

// }
export interface PageInfo {
    TitleAR: string;
    Title: string;
    Description: string;
    DescriptionAR: string;
    PageName: string;
    Identifier: string;
    ParentID?: number;  // Use '?' for optional properties
    Level: number;
    IsParent: boolean;
    Steps: Step[];
    ParentPage?: PageInfo;  // Use '?' for optional properties
    PageInfoChild: PageInfo[];
}

// export interface Step{
//     id:Number,
//     pageID:Number,
//     order:Number,
//     stepEn:string,
//     stepAr:string
// }

interface Step {
    ID: number;
    Order: number;
    StepEn: string;
    StepAR: string;
    ContentType: number;  // Define ContentType interface or type if needed
}
export interface ProfileTree{
    key: string,
    label: string,
    data: string,
    icon?: string,
    children: ProfileTree[]
}