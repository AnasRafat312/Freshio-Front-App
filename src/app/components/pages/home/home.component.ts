import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { GeneralConfig } from 'src/app/core/common/generalConfig';
import { LanguageService } from 'src/app/core/languageLocalization/language.service';
import { PrivilegeService } from '../privilege/privilege.service';
import { LanguagesService } from 'src/app/shared/services/languages.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { PageNaming } from 'src/app/shared/components/page-info/core/page-naming';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends GeneralConfig implements OnInit {
  Wallets = false
  BankAccounts = false
  YellowCards = false
  CreditCards = false
  Traders = false
  Phones = false
  Privileges = false
  Breakdown = false
  privilegeList = []
  languageFactor = 'ar'
  constructor(
    private homeService: HomeService,
    languageService: LanguageService,
    private privilegeService: PrivilegeService,
    private language:LanguagesService,
    private layoutService:LayoutService,
    private sharedService: SharedService,
    private cookieService: CookieService,

  ) {
    super(languageService);
    this.language.currentLanguage.subscribe(
      data => {
        this.languageFactor = data
      }
    )
    sharedService.setPageLocalName(PageNaming.HOME_PAGE)
  }
  ngOnInit(): void {
    this.privilegeService.checkedPrivilegeList.subscribe(
      data => {
        this.Wallets = true
        this.BankAccounts = true
        this.YellowCards = true
        this.CreditCards = true
        this.Traders = true
        this.Phones = true
        this.Privileges = true
        this.Breakdown = true
        this.privilegeList = data
        this.privilegeList.forEach(ele => {
          this.showPagesBaseOnPrivilege(ele)
        })
      })
  }
  showPagesBaseOnPrivilege(page) {
    if (page.page == 'Wallets') {
      this.Wallets = true
    }
    if (page.page == 'BankAccounts') {
      this.BankAccounts = true
    }
    if (page.page == 'YellowCards') {
      this.YellowCards = true
    }
    if (page.page == 'CreditCards') {
      this.CreditCards = true
    }
    if (page.page == 'Traders') {
      this.Traders = true
    }
    if (page.page == 'Phones') {
      this.Phones = true
    }
    if (page.page == 'Privileges') {
      this.Privileges = true
    }
    if (page.page == 'Breakdown') {
      this.Breakdown = true
    }
  }
  ngOnDestroy(): void {
    this.privilegeList = []
  }
}
