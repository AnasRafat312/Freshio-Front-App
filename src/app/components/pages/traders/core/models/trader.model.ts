import { BaseEntityModel } from 'src/app/core/common/basic.model';

export interface TraderModel extends BaseEntityModel {
  Name: string;
  PhoneNumber: number;
  NationalID: number;
}
