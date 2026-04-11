import { Component } from '@angular/core';
import { LayoutService } from "./service/app.layout.service";
import { SharedModule } from '../shared/shared.module';
import { MatDialog } from '@angular/material/dialog';
import { HelpMeComponent } from '../shared/components/help-me/help-me.component';
import { PageInfoComponent } from '../shared/components/page-info/page-info.component';
import { PageNaming } from '../shared/components/page-info/core/page-naming';
import { LanguagesService } from '../shared/services/languages.service';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html',
    styleUrls: ['./app.footer.component.scss']
})
export class AppFooterComponent {
    dialogRef: any;
    languageFactor:any;
    currentYear: number = new Date().getFullYear();

    constructor(public layoutService: LayoutService,public dialog: MatDialog,private languageService: LanguagesService) { }
    ngOnInit() {
        this.languageService.currentLanguage.subscribe((data) => {
            this.languageFactor = data;
        });



    }
    openHelpForm() {
        this.dialogRef = this.dialog.open(HelpMeComponent,{
            position:{right:'0',bottom:'0'},
            width:'400px',
            height: '110vh',
        });
      }
      openInfo(){
        if(this.languageFactor=='en')
        {
            this.dialogRef = this.dialog.open(PageInfoComponent,{
                data : {PageName : PageNaming.TESTING},
                position:{left:'0',bottom:'0'},
                width:'800px',
                height: '100vh',
                maxHeight: '100%',
            });
        }
        else
        {
            this.dialogRef = this.dialog.open(PageInfoComponent,{
                data : {PageName : PageNaming.TESTING},
                position:{right:'0',bottom:'0'},
                width:'800px',
                height: '100vh',
                maxHeight: '100%',
            });
        }


      }
}
