import { NgModule } from '@angular/core';
import { DeleteModalComponent } from './components/delete-modal/delete-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { ToastrModule } from 'ngx-toastr';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { NgFor, AsyncPipe, CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { LanguagesComponent } from './components/languages/languages.component';
import { TranslateToArabicPipe } from '../core/pipes/translate-to-arabic.pipe';
import { PragraphSlicePipe } from '../core/pipes/pragraph-slice.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProfileComponent } from './components/profile/profile.component';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TriStateCheckboxModule } from 'primeng/tristatecheckbox';
import { TreeTableModule } from 'primeng/treetable';
import { MultiSelectModule } from 'primeng/multiselect';
import { CarouselModule } from 'primeng/carousel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmComponent } from './components/confirm/confirm.component';
import { HelpMeComponent } from './components/help-me/help-me.component';
import { PasswordModule } from 'primeng/password';
import { PageInfoComponent } from './components/page-info/page-info.component';
import { AvatarModule } from 'primeng/avatar';
import { TabViewModule } from 'primeng/tabview';
import { FieldsetModule } from 'primeng/fieldset';
import { PanelModule } from 'primeng/panel';
import { VarifacationComponent } from './components/VarifacationPage/varifacation/varifacation.component';
import { PaginatorModule } from 'primeng/paginator';
import { SplitterModule } from 'primeng/splitter';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { NewDeleteModalComponent } from './components/new-delete-modal/new-delete-modal.component';
import { SwitchCompanyComponent } from './components/switch-company/switch-company.component';
import { AttatchmentsComponent } from './components/attatchments/attatchments.component';
import { BasicTableComponent } from './components/basic-table/basic-table.component';
import { BadgeModule } from 'primeng/badge';
import { SkeletonModule } from 'primeng/skeleton';
import { PlaceholderComponent } from './components/Placeholder/Placeholder.component';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { InputFieldComponent } from './components/input-field/input-field.component';
import {MatDividerModule} from '@angular/material/divider'
import { ExportOptionsModalComponent } from './components/export-options-modal/export-options-modal.component';
import { DetailsModule } from './components/details/details.module';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';


@NgModule({
    declarations: [
        DeleteModalComponent,
        LoadingSpinnerComponent,
        LanguagesComponent,
        ProfileComponent,
        ConfirmComponent,
        HelpMeComponent,
        PageInfoComponent,
        VarifacationComponent,
        NewDeleteModalComponent,
        SwitchCompanyComponent,
        AttatchmentsComponent,
        BasicTableComponent,
        PlaceholderComponent,
        TranslateToArabicPipe,
        PragraphSlicePipe,
        InputFieldComponent,
        ExportOptionsModalComponent,

    ],
    imports: [
        TableModule,
        ButtonModule,
        FormsModule,
        MatDialogModule,
        ReactiveFormsModule,
        DropdownModule,
        ToolbarModule,
        InputTextModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTabsModule,
        ToastrModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatSelectModule,
        NgFor,
        AsyncPipe,
        FontAwesomeModule,
        CommonModule,
        MatMenuModule,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        SelectButtonModule,
        ToggleButtonModule,
        TriStateCheckboxModule,
        TreeTableModule,
        MultiSelectModule,
        CarouselModule,
        ConfirmDialogModule,
        CalendarModule,
        InputTextareaModule,
        InputSwitchModule,
        InputNumberModule,
        MatTooltipModule,
        PasswordModule,
        FormsModule,
        ToastModule,
        SplitterModule,
        DialogModule,
        TreeModule,
        ConfirmPopupModule,
        DynamicDialogModule,
        OverlayPanelModule,
        TooltipModule,
        MatToolbarModule,
        FileUploadModule,
        ToastModule,
        CheckboxModule,
        SkeletonModule,
        OrganizationChartModule,
        TabViewModule,
        AvatarModule,
        MatDividerModule,
        DetailsModule,
        RadioButtonModule,
        CardModule,
        
    ],

    exports: [
        ConfirmComponent,
        TableModule,
        ButtonModule,
        FormsModule,
        MatDialogModule,
        ReactiveFormsModule,
        DropdownModule,
        ToolbarModule,
        InputTextModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatTabsModule,
        ToastrModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatSelectModule,
        NgFor,
        AsyncPipe,
        FontAwesomeModule,
        LoadingSpinnerComponent,
        LanguagesComponent,
        MatExpansionModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMenuModule,
        SelectButtonModule,
        ToggleButtonModule,
        TriStateCheckboxModule,
        TreeTableModule,
        MultiSelectModule,
        CarouselModule,
        ConfirmDialogModule,
        CalendarModule,
        InputTextareaModule,
        InputSwitchModule,
        InputNumberModule,
        MatTooltipModule,
        PasswordModule,
        PanelModule,
        FieldsetModule,
        FormsModule,
        PaginatorModule,
        ConfirmPopupModule,
        DynamicDialogModule,
        DialogModule,
        CheckboxModule,
        ToastModule,
        SplitterModule,
        DialogModule,
        TreeModule,
        TooltipModule,
        SwitchCompanyComponent,
        AttatchmentsComponent,
        BasicTableComponent,
        TabViewModule,
        BadgeModule,
        SkeletonModule,
        PlaceholderComponent,
        OrganizationChartModule,
        AvatarModule,
        TranslateToArabicPipe,
        PragraphSlicePipe,
        InputFieldComponent,
        MatDividerModule,
        DetailsModule,
        RadioButtonModule,
        TagModule,
        CardModule
    ],
})
export class SharedModule {}
