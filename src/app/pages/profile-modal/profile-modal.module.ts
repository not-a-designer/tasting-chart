import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfileModalPageRoutingModule } from './profile-modal-routing.module';

import { ProfileModalPage } from './profile-modal.page';
import { JoyrideModule } from 'ngx-joyride';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    JoyrideModule.forChild(),
    ProfileModalPageRoutingModule
  ],
  declarations: [ProfileModalPage]
})
export class ProfileModalPageModule {}
