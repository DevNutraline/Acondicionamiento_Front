import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { BsDropdownModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { TagInputModule } from 'ngx-chips';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbPaginationModule, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxGalleryModule } from '@kolkov/ngx-gallery';


import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { ProfileComponent } from './pages/profile/profile.component';

import { AppRoutingModule } from './app-routing.module';
import { ComponentsModule } from './components/components.module';
import { PresentationModule } from './pages/presentation/presentation.module';

import { GuardService } from './services/guard/guard.service';
import { TokenInterceptor } from 'src/app/interceptors/token.interceptor';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    AppRoutingModule,
    NgbModule,
    NgbPaginationModule,
    NgbAlertModule,
    TagInputModule,
    PresentationModule,
    NgxSpinnerModule,
    NgxGalleryModule,
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot(),
    CollapseModule.forRoot(),
  ],
  declarations: [AppComponent, AdminLayoutComponent, AuthLayoutComponent, LoginComponent, ProfileComponent],
  providers: [
    GuardService,
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: TokenInterceptor
    }
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
