import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { ProfileModalPageModule } from '../profile-modal/profile-modal.module';
import { NgChartsModule } from 'ng2-charts'
import { JoyrideModule } from 'ngx-joyride';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NgChartsModule,
    JoyrideModule.forChild(),
    HomePageRoutingModule,
    ProfileModalPageModule,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
