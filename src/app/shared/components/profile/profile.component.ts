import { UserProfileService } from './../../services/user-profile.service';
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { fadeInOut } from 'src/app/core/animnations/animations';
import { Constant } from 'src/app/core/constants/constant';
import { LanguagesService } from '../../services/languages.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations:[fadeInOut]
})
export class ProfileComponent implements OnInit {
  imagePath!: any
  imageName:any
  userData: any = {};
  isUserInfo: boolean = true
  // language
    languageFactor = 'ar'
  constructor(
        private constant: Constant,
    private userProfileService: UserProfileService,
    private messageService: MessageService,
    public dialoge: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private language:LanguagesService,
  ) {
    this.initializeLanguage()
  }

  ngOnInit(): void {
    this.fetchUserProfileData();

  }
  initializeLanguage() {
    this.language.currentLanguage.subscribe(data => {this.languageFactor = data})
}
  fetchUserProfileData(): void {
    const routeParameters = {

      UserID: JSON.parse(localStorage.getItem('userId')),
      RoleID: JSON.parse(localStorage.getItem('roleId')),
      CompanyID: JSON.parse(localStorage.getItem('companyId'))

    };

    this.userProfileService.getUserProfileData(routeParameters)
      .subscribe({
        next: (data) => {
          this.userData = data;
          this.getImageSRC(this.userData?.UserImage)
          this.imageName = this.userData?.UserImage
          this.imagePath = this.constant.USER_PROFILE_IMAGE_SOURCE + this.imageName;
        localStorage.setItem('userImage',this.userData?.UserImage)
        this.userProfileService.setImageName(this.userData?.UserImage)
        },
        error: (error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error fetching user data',
            });
        }
      });

  }

  onCancel(): void {
    this.dialoge.close();
  }
  selectedFile: File | null = null;

  onImageSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    const reader = new FileReader();
    reader.onload = () => {
      this.userData.imageUrl = reader.result as string;
      this.imagePath = reader.result as string;

    };
    reader.readAsDataURL(this.selectedFile);
    this.saveChanges()
  }
  saveChanges() {
    if (this.selectedFile) {
      this.uploadProfilePicture();
    }
  }

  getImageSRC(imageName: string) {
    this.userProfileService.setImageName(imageName)
    //this.imagePath = this.constant.USER_PROFILE_IMAGE_SOURCE + imageName;

  }

  uploadProfilePicture() {
    const formData = new FormData();
    formData.append('UserID', localStorage.getItem('userId'));
    formData.append('ProfileImage', this.selectedFile.name);
    formData.append('ProfileImageFile', this.selectedFile);

    this.userProfileService.changeProfilePicture(formData)
      .subscribe({

        next: (data) => {
          
          this.userProfileService.imageSignal.set(this.selectedFile.name)
          localStorage.setItem('userImage',this.selectedFile.name)
        },
        error: (error) => {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Error updating profile picture',
            });
        }
      });
  }
  formatEmploymentDate(dateString: string): string {
    if (dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString(); // Adjust the date format as needed
    }
    return '';
  }



}
