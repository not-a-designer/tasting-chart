import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { RouteReuseStrategy } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { NgChartsModule} from 'ng2-charts';
import { environment } from '../environments/environment'
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { SavedProfilesService } from './services/saved-profiles.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)), 
    IonicModule.forRoot(), 
    BrowserAnimationsModule, 
    AppRoutingModule
  ],
  providers: [
    SavedProfilesService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
