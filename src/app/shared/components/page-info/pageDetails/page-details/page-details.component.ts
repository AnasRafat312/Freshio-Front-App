import { Component, ElementRef, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageInfoService } from '../../services/page-info.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageInfoComponent } from '../../page-info.component';
import {TreeModule} from 'primeng/tree';
import {TreeNode} from 'primeng/api';

@Component({
  selector: 'app-page-details',
  templateUrl: './page-details.component.html',
  styleUrls: ['./page-details.component.scss']
})
export class PageDetailsComponent {
  Identitfier:string=''
  pageGuide:any;
  Root:any;
  stepString:any;
  visible:boolean=false;
  stepImage:any;
  languageFactor = 'ar';
  pageName = '';
  selectedChild:any;
  SelectedChildPage:any;
  dialogOpen:any;
  pagesTreeList!:any[];
  ChildLevels:any;
  textHTML:string = ''
  transformedData:any[];
  transformedDatAR:any[];
  KeyWordListEn:any=[];
  KeyWordListAr:any=[];
   link!:any;
   KeyWordList:any[];
   testListOfParent:any=[];
   ListedTree:any=[];
   parentData:any;
  constructor(
    private route: ActivatedRoute,
    private  infoServices: PageInfoService,
    private languageService: LanguagesService,

    private toastr: ToastrService,
   // public dialogRef: MatDialogRef<PageDetailsComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private sharedService: SharedService,
   public dialog: MatDialog,
   private router: Router,
   private elRef: ElementRef, private renderer: Renderer2,
   private sanitizer: DomSanitizer,

  ) {

  }
  ngOnInit() {

    //this.layoutService.onMenuToggle()
    this.route.params.subscribe(params => {
      const name = params['name'];
      this.Identitfier= params['name']
      console.log('Name parameter:', name);
    });

    this.languageService.currentLanguage.subscribe((data) => {
      this.languageFactor = data;
  });
  // this.infoServices.GetpageByIdentitifer(this.Identitfier).subscribe((res : any) => {

  //   this.pageGuide = res;
  //   });


    // this.infoServices.GetAllPages().subscribe((res : any) => {
    //
    // this.testListOfParent = res;

    // this.testListOfParent.forEach(element => {
    //
    //   this.Root={
    //     "titleAR": element.titleAR,
    //     "title":element.title ,
    //     "description": element.description,
    //     "descriptionAR": element.descriptionAR,
    //     "pageName":element.pageName ,
    //     "identifier": element.identifier,
    //    // "ParentPage": element.ParentPage,
    //    "parentID":element.parentID,
    //     "level": element.level,
    //     "isParent": element.isParent,
    //     "ID": element.ID,
    //     "IsDeleted": element.IsDeleted,
    //     "CreatedBy": element.CreatedBy,
    //     "CreatedDateTime": element.CreatedDateTime,
    //     "DeletedBy": element.DeletedBy,
    //     "DeletedDateTime": element.DeletedDateTime,
    //     "HistoryKey": element.HistoryKey,
    //     "CompanyID": element.CompanyID
    //   }
    //   this.ListedTree.push(this.createHierarchy(element,this.Root));

    // });
    // console.log("ListedTreeeeeee")
    // console.log(this.ListedTree)
    // });

    this.infoServices.GetAllPages().subscribe((res: any) => {
      this.testListOfParent = res;

      // Create hierarchy for the full list of items
      if(this.languageFactor=='en')
      {

        this.ListedTree = this.createHierarchy(this.testListOfParent);
      }
      else
      {
        this.ListedTree = this.createHierarchyAR(this.testListOfParent);
      }

      console.log("ListedTree");
      console.log(this.ListedTree);
  });


    this.infoServices.GetpageByIdentitifer(this.Identitfier).subscribe((res : any) => {

      this.pageGuide = res;
      console.log("Page Dataaa");
      console.log(res);
      this.Root={
        "titleAR": res.titleAR,
        "title":res.title ,
        "description": res.description,
        "descriptionAR": res.descriptionAR,
        "pageName":res.pageName ,
        "identifier": res.identifier,
       // "ParentPage": res.ParentPage,
       "parentID":res.parentID,
        "level": res.level,
        "isParent": res.isParent,
        "ID": res.ID,
        "IsDeleted": res.IsDeleted,
        "CreatedBy": res.CreatedBy,
        "CreatedDateTime": res.CreatedDateTime,
        "DeletedBy": res.DeletedBy,
        "DeletedDateTime": res.DeletedDateTime,
        "HistoryKey": res.HistoryKey,
        "CompanyID": res.CompanyID
      }


    //   if(this.pageGuide.pageInfoChild.length > 0)  {
    //  //   this.pageGuide.pageInfoChild = this.createHierarchy(this.pageGuide.pageInfoChild)
    //  if(this.languageFactor=='en')
    //  {
    //

    //   //this.transformedData = this.createHierarchy(this.pageGuide,this.Root);
    //  }
    //  else
    //  {
    //   this.transformedDatAR = this.createHierarchyAR(this.pageGuide,this.Root);
    //  }

    //   }
        //this.KeyWordListEn
        if(this.languageFactor=='en')
        {
          this.pageGuide.description= this.wrapKeywordsWithRouterLinksDescription(this.pageGuide.description,this.KeyWordList)
        }
        else
        {
          this.pageGuide.descriptionAR= this.wrapKeywordsWithRouterLinksDescription(this.pageGuide.descriptionAR,this.KeyWordList)
        }

   })
   this.infoServices.GetAllKeyWords().subscribe((res:any)=>
  {

    this.KeyWordList=res;
    res.forEach(element => {
      this.KeyWordListEn.push(element.titleEn)
      this.KeyWordListAr.push(element.R)
    });
  })

  }


  GetStepsNew(child:any)
  {
     this.selectedChild=child;
     this.stepString=
     this.splitStringWithIndex(child);
     this.stepString= this.wrapKeywordsWithAnchor(this.stepString,this.KeyWordList)
  }
   splitStringWithIndex(inputString: string): string[] {

     const rows = inputString.split(',').map((row, index) => `${index + 1}-${row.trim()}`);
     return rows;
   }
   openImage(image:any)
   {
     this.stepImage=image;
     this.visible = true;
   }


//    createHierarchy(data: any, root: any): any[] {
//
//      const idMap: any = {};
//      const rootItems: any[] = [];

//      // Initialize the root item and map it
//      const { ID, parentID } = root;
//      root.children = [];
//      idMap[ID] = root;

//      // Check if the root itself is a root-level item
//      if (parentID === null) {
//          rootItems.push(root);
//      }
//      for (const item of data.pageInfoChild) {
//        const { ID, parentID } = item;
//        item.children = [];
//        idMap[ID] = item;

//      // Check if the item is a root-level item
//        if (parentID === null) {
//          rootItems.push(item);
//        }
//      }

//      // Step 1: Assign children to their respective parents
//      for (const item of data.pageInfoChild) {
//          const { ID, parentID } = item;
//          // Attach the item to its parent
//          const parentItem = idMap[parentID];
//          if (parentItem) {
//              parentItem.children.push(item);
//          }
//      }

//      // Step 2: Transform the structure to fit PrimeNG's p-tree structure
//      const transformedRootItems = rootItems.map(rootItem => this.transformItem(rootItem));
//      console.log(transformedRootItems)
//      return transformedRootItems;
//  }
createHierarchy(data: any[]): any[] {

  const idMap: any = {};
  const rootItems: any[] = [];

  // Initialize all items and map them
  for (const item of data) {
      item.children = [];
      idMap[item.ID] = item;

      // If the item is a root-level item (parentID is null), add to rootItems
      if (item.parentID === null) {
          rootItems.push(item);
      }
  }

  // Step 1: Assign children to their respective parents
  for(const parent of data)
  {
    for (const item of parent.pageInfoChild) {
      const parentItem = idMap[item.parentID];
      if (parentItem) {
          parentItem.children.push(item);
      }
  }
 }

  // Step 2: Transform the structure to fit PrimeNG's p-tree structure
  return rootItems.map(rootItem => this.transformItem(rootItem));
}




transformItem(item: any): any {
   const transformedItem: any = {
       key: item.ID,
      // label: item.pageName,
      label: item.title,
       data: item
   };

   if (item.children && item.children.length > 0) {
       transformedItem.children = item.children.map(child => this.transformItem(child));
   }
   return transformedItem;
}

wrapKeywordsWithRouterLinksDescription(inputString: string, keywordList: any[]): string {

 let result = inputString;
 if(this.languageFactor=='en')
 {
   keywordList.forEach(keyword => {
     const regex = new RegExp(`\\b(${keyword.titleEn})\\b`, 'gi');
    result = result.replace(regex, `<a target='_blank' href='${keyword.url}'>$1</a>`);
   });
   return result;
 }
 else
 {

   keywordList.forEach(keyword => {

    // const regex = new RegExp(`\\b(${keyword.titleAR})\\b`, 'gi');
     const escapedKeyword = this.escapeRegExp(keyword.titleAR);
     const regex = new RegExp(`(?:^|(?<=\\s))(${escapedKeyword})(?=\\s|$)`, 'gui');
    result = result.replace(regex, `<a target='_blank' href='${keyword.url}'>$1</a>`);
   });
   return result;
 }

}

selectedFile:any;

onNodeSelect(event: any) {
  //this.GetSteps(event.node.data)

  this.SelectedChildPage=event.node.data.steps
  if(event.node.data.parentID===null)
  {
    this.pageGuide=event.node.data;
  }
  else
  {
    this.pageGuide=event.node.data;
    this.pageGuide=this.testListOfParent.find(user => user.ID === this.pageGuide.parentID);
  }

}

onNodeSelectAR(event: any) {
 //this.GetSteps(event.node.data)
 this.SelectedChildPage=event.node.data.steps
 if(event.node.data.parentID===null)
  {
    this.pageGuide=event.node.data;
  }
  else
  {
    this.pageGuide=event.node.data;
    this.pageGuide=this.testListOfParent.find(user => user.ID === this.pageGuide.parentID);
  }
 console.log("nooooooooooooooede")
 console.log(this.selectedFile);
 console.log(event.node.data);
}

GetStepsNewAR(child:any)
{
 this.selectedChild=child;
 this.stepString=
 this.splitAndFormatStringAR(child);
 this.stepString= this.wrapKeywordsWithAnchor(this.stepString,this.KeyWordList)
}
// createHierarchyAR(data: any, root: any): any[] {

// const idMap: any = {};
// const rootItems: any[] = [];

// // Initialize the root item and map it
// const { ID, parentID } = root;
// root.children = [];
// idMap[ID] = root;

// // Check if the root itself is a root-level item
// if (parentID === null) {
//    rootItems.push(root);
// }
// for (const item of data.pageInfoChild) {
//  const { ID, parentID } = item;
//  item.children = [];
//  idMap[ID] = item;

// // Check if the item is a root-level item
//  if (parentID === null) {
//    rootItems.push(item);
//  }
// }

// // Step 1: Assign children to their respective parents
// for (const item of data.pageInfoChild) {
//    const { ID, parentID } = item;
//    // Attach the item to its parent
//    const parentItem = idMap[parentID];
//    if (parentItem) {
//        parentItem.children.push(item);
//    }
// }

// // Step 2: Transform the structure to fit PrimeNG's p-tree structure
// const transformedRootItems = rootItems.map(rootItem => this.transformItemAR(rootItem));
// console.log(transformedRootItems)
// return transformedRootItems;
// }


// Helper function to transform each item recursively
createHierarchyAR(data: any[]): any[] {

  const idMap: any = {};
  const rootItems: any[] = [];

  // Initialize all items and map them
  for (const item of data) {
      item.children = [];
      idMap[item.ID] = item;

      // If the item is a root-level item (parentID is null), add to rootItems
      if (item.parentID === null) {
          rootItems.push(item);
      }
  }

  // Step 1: Assign children to their respective parents
  for(const parent of data)
  {
    for (const item of parent.pageInfoChild) {
      const parentItem = idMap[item.parentID];
      if (parentItem) {
          parentItem.children.push(item);
      }
  }
 }

  // Step 2: Transform the structure to fit PrimeNG's p-tree structure
  return rootItems.map(rootItem => this.transformItemAR(rootItem));
}


transformItemAR(item: any): any {
const transformedItem: any = {
 key: item.ID,
 label: item.titleAR,
 data: item
};

if (item.children && item.children.length > 0) {
 transformedItem.children = item.children.map(child => this.transformItemAR(child));
}
return transformedItem;
}

splitAndFormatStringAR(inputString:string) {

  let currentIndex = 1; // Start index
  const formattedStrings = [];

  const segments = inputString.split('،').map(item => item.trim());

  const filteredSegments = segments.filter(segment => segment !== '');

  filteredSegments.forEach(segment => {
      formattedStrings.push(`${currentIndex}- ${segment}`);
      currentIndex++;
  });

  return formattedStrings;
 }

  // onCancel() {
  //     this.dialogRef.close(false)
  // }
  concat(obj) {
   let link = "dasdsadads"
   let linkName = "dasdsadads"
   let ancor = `<a href="${link}">${linkName}</a>`
   this.textHTML = `
     lakcsdjlkjfldfkjhaslkfjhasdkljfhalsdkjfhlaskjfhlsakjhldfskajh${ancor}asdfdsafasfdafasf
   `
  }
  wrapKeywordsWithAnchor(inputStrings: string[],keywordList: any[] ): string[] {

   if(this.languageFactor=='en')
   {
     return inputStrings.map(inputString => {
       let result = inputString;

       keywordList.forEach(keyword => {
           const regex = new RegExp(`\\b(${keyword.titleEn})\\b`, 'gi');
          // result = result.replace(regex, `<a target='_blank' href='/pages/Details/${keyword}'>$1</a>`);
          result = result.replace(regex, `<a target='_blank' href='${keyword.url}'>$1</a>`);
       });

       return result;
   });
   }

   else
   {

   return inputStrings.map(inputString => {

     let result = inputString;

     keywordList.forEach(keyword => {

       const escapedKeyword = this.escapeRegExp(keyword.titleAR);
       const regex = new RegExp(`(?:^|(?<=\\s))(${escapedKeyword})(?=\\s|$)`, 'gui'); // 'u' flag for Unicode support, 'i' for case insensitivity

       result = result.replace(regex, `<a target="_blank" href="${keyword.url}">$1</a>`);
     });

     return result;
   });
 }




}

escapeRegExp(text: string): string {
 return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

}


processLinks(e: Event) {

 const element: HTMLElement = e.target as HTMLElement;

 if (element.nodeName === 'A') {
   const target = element.getAttribute('target');

   if (target === '_blank') {
     e.preventDefault(); // Prevent default navigation behavior
     const link = element.getAttribute('href');
     const hrefWithBaseUrl=element.baseURI+'#'+link;
     window.open(hrefWithBaseUrl, '_blank'); // Open link in new tab
   }
 }
}


handleClick() {
 this.router.navigate(['/Details/'+'sssss']);
 const key='Home Page'
 //console.log(`Clicked on keyword: ${keyword}`);
 //this.router.navigate(['/pages/Details/', keyword]);
 this.router.navigate(['/pages/Details/'+key]);

}
}



