import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { LanguagesService } from '../../services/languages.service';
import { SharedService } from '../../services/shared.service';
import { PageInfoService } from './services/page-info.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-page-info',
  templateUrl: './page-info.component.html',
  styleUrls: ['./page-info.component.scss'],

})
export class PageInfoComponent implements OnInit {
     //language Variables
     languageFactor = 'ar';
     pageGuide: any ;
     pageName = '';
     stepString:any;
     selectedChild:any;
     SelectedChildPage:any;
     dialogOpen:any;
     pagesTreeList!:any[];
     visible: boolean = false;
     stepImage='';
     ChildLevels:any;
     textHTML:string = ''
     Root:any;
     transformedData:any[];
     transformedDatAR:any[];
     KeyWordListEn:any=[];
     KeyWordListAr:any=[];
      link!:any;
      KeyWordList:any[];
     constructor(
         private toastr: ToastrService,
         public dialogRef: MatDialogRef<PageInfoComponent>,
         @Inject(MAT_DIALOG_DATA) public data: any,
         private fb: FormBuilder,
         private languageService: LanguagesService,
         private sharedService: SharedService,
        private  infoServices: PageInfoService,
        public dialog: MatDialog,
        private router: Router,
        private elRef: ElementRef, private renderer: Renderer2,
        private sanitizer: DomSanitizer,

     ) {
         // set language value
         this.languageService.currentLanguage.subscribe((data) => {
             this.languageFactor = data;
         });


         this.pageName = localStorage.getItem('pageName');
        //  (res : PageInfo)
         this.infoServices.getNewGuide(localStorage.getItem('pageName')).subscribe((res : any) => {

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


            if(this.pageGuide.pageInfoChild.length > 0)  {
           //   this.pageGuide.pageInfoChild = this.createHierarchy(this.pageGuide.pageInfoChild)
           if(this.languageFactor=='en')
           {
            this.transformedData = this.createHierarchy(this.pageGuide,this.Root);
           }
           else
           {
            this.transformedDatAR = this.createHierarchyAR(this.pageGuide,this.Root);
           }

            }
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
     ngOnInit(): void {


     }
     GetStepsNew(child:any)
     {

        this.selectedChild=child;
        this.stepString=
        this.splitStringWithIndex(child);
        this.stepString= this.wrapKeywordsWithAnchor(this.stepString,this.KeyWordList)

     }
      // splitStringWithIndex(inputString: string): string[] {

      //   const rows = inputString.split(',').map((row, index) => `${index + 1}-${row.trim()}`);
      //   return rows;
      // }
       splitStringWithIndex(inputString: string): string[] {
        // Remove all double quotes from the input string
        const sanitizedInputString = inputString.replace(/"/g, '');

        // Split the sanitized string and format with index
        const rows = sanitizedInputString.split(',').map((row, index) => `${index + 1}-${row.trim()}`);

        return rows;
    }

      openImage(image:any)
      {
        this.stepImage=image;
        this.visible = true;
      }


      createHierarchy(data: any, root: any): any[] {

        const idMap: any = {};
        const rootItems: any[] = [];

        // Initialize the root item and map it
        const { ID, parentID } = root;
        root.children = [];
        idMap[ID] = root;

        // Check if the root itself is a root-level item
        if (parentID === null) {
            rootItems.push(root);
        }
        for (const item of data.pageInfoChild) {
          const { ID, parentID } = item;
          item.children = [];
          idMap[ID] = item;

        // Check if the item is a root-level item
          if (parentID === null) {
            rootItems.push(item);
          }
        }

        // Step 1: Assign children to their respective parents
        for (const item of data.pageInfoChild) {
            const { ID, parentID } = item;
            // Attach the item to its parent
            const parentItem = idMap[parentID];
            if (parentItem) {
                parentItem.children.push(item);
            }
        }

        // Step 2: Transform the structure to fit PrimeNG's p-tree structure
        const transformedRootItems = rootItems.map(rootItem => this.transformItem(rootItem));
        console.log(transformedRootItems)
        return transformedRootItems;
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
    //     const linkRegex = /(<a.*?>.*?<\/a>)/g; // Regex to match <a> tags
    // const keywordRegex = new RegExp(`\\b(${keyword})\\b`, 'gi');
       // result = result.replace(regex, `<a id="${keyword}" class="link" routerLink="./pages/Detalis/${keyword}">$1</a>`);
       //result = result.replace(regex, `<a  class="link" routerLinkActive="active" [routerLink]="'/pages/Detalis/${keyword}'" target="_blank" >$1</a>`)
       //result = result.replace(regex, `<a routerLinkActive="active" [routerLink]="'/pages/Detalis/${keyword}'" target="_blank">$1</a>`);
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
  }

  onNodeSelectAR(event: any) {
    //this.GetSteps(event.node.data)
    this.SelectedChildPage=event.node.data.steps
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
 createHierarchyAR(data: any, root: any): any[] {

  const idMap: any = {};
  const rootItems: any[] = [];

  // Initialize the root item and map it
  const { ID, parentID } = root;
  root.children = [];
  idMap[ID] = root;

  // Check if the root itself is a root-level item
  if (parentID === null) {
      rootItems.push(root);
  }
  for (const item of data.pageInfoChild) {
    const { ID, parentID } = item;
    item.children = [];
    idMap[ID] = item;

  // Check if the item is a root-level item
    if (parentID === null) {
      rootItems.push(item);
    }
  }

  // Step 1: Assign children to their respective parents
  for (const item of data.pageInfoChild) {
      const { ID, parentID } = item;
      // Attach the item to its parent
      const parentItem = idMap[parentID];
      if (parentItem) {
          parentItem.children.push(item);
      }
  }

  // Step 2: Transform the structure to fit PrimeNG's p-tree structure
  const transformedRootItems = rootItems.map(rootItem => this.transformItemAR(rootItem));
  console.log(transformedRootItems)
  return transformedRootItems;
}


// Helper function to transform each item recursively
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

//  splitAndFormatStringAR(inputString:string) {

//      let currentIndex = 1; // Start index
//      const formattedStrings = [];

//      const segments = inputString.split('،').map(item => item.trim());

//      const filteredSegments = segments.filter(segment => segment !== '');

//      filteredSegments.forEach(segment => {
//          formattedStrings.push(`${currentIndex}- ${segment}`);
//          currentIndex++;
//      });

//      return formattedStrings;
//     }

 splitAndFormatStringAR(inputString: string) {
  let currentIndex = 1; // Start index
  const formattedStrings = [];

  // Remove all double quotes from the input string
  const sanitizedInputString = inputString.replace(/"/g, '');

  const segments = sanitizedInputString.split('،').map(item => item.trim());

  const filteredSegments = segments.filter(segment => segment !== '');

  filteredSegments.forEach(segment => {
      formattedStrings.push(`${currentIndex}- ${segment}`);
      currentIndex++;
  });

  return formattedStrings;
}

     onCancel() {
         this.dialogRef.close(false)
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
  // wrapKeywordsWithAnchor(inputStrings: string[], keywordList: string[]): string[] {
  //   return inputStrings.map(inputString => {
  //     let result = inputString;

  //     keywordList.forEach(keyword => {
  //       const regex = new RegExp(`\\b(${keyword})\\b`, 'gi');
  //       result = result.replace(regex, match => {
  //         // Create a new anchor element
  //         const anchor = this.renderer.createElement('a');
  //         this.renderer.addClass(anchor, 'link');
  //         //this.renderer.setAttribute(anchor, 'routerLink', `/pages/Detalis/${keyword}`);
  //         this.renderer.setAttribute(anchor, 'href', `/pages/Details/${keyword}`);
  //         //this.renderer.setAttribute(anchor, 'target', '_blank');
  //         this.renderer.listen(anchor, 'click', () => this.handleClick());
  //         anchor.textContent = match; // Set anchor text to the matched keyword

  //         // Return the outerHTML of the anchor element
  //         return anchor.outerHTML;
  //       });
  //     });

  //     return result;
  //   });
  // }

  // processLinks(e) {
  //
  //   const element: HTMLElement = e.target;
  //   if (element.nodeName === 'A') {
  //     e.preventDefault();
  //     const link = element.getAttribute('href');
  //     this.router.navigate([link]);
  //   }
  // }

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
