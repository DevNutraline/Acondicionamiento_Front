import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CommonModule } from "@angular/common";
import { BrowserModule } from "@angular/platform-browser";

import { AdminLayoutComponent } from "./layouts/admin-layout/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { PresentationComponent } from "./pages/presentation/presentation.component";
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RandomGuard } from "./guards/random.guard";

const routes: Routes = [
  {
    path: "",
    redirectTo: "home",
    pathMatch: "full"
  },
  {
    path: "home",
    component: LoginComponent
  },
  {
    path: "",
    component: AdminLayoutComponent,
    canActivate: [RandomGuard],
    children: [
      {
        path: "dashboards",
        loadChildren: "./pages/dashboards/dashboards.module#DashboardsModule"
      },
      {
        path: "components",
        loadChildren: "./pages/components/components.module#ComponentsModule"
      },
      {
        path: "forms",
        loadChildren: "./pages/forms/forms.module#FormsModules"
      },
      {
        path: "tables",
        loadChildren: "./pages/tables/tables.module#TablesModule"
      },
      {
        path: "maps",
        loadChildren: "./pages/maps/maps.module#MapsModule"
      },
      {
        path: "widgets",
        loadChildren: "./pages/widgets/widgets.module#WidgetsModule"
      },
      {
        path: "charts",
        loadChildren: "./pages/charts/charts.module#ChartsModule"
      },
      {
        path: "calendar",
        loadChildren: "./pages/calendar/calendar.module#CalendarModule"
      },
      {
        path: "examples",
        loadChildren: "./pages/examples/examples.module#ExamplesModule"
      },
      {
        path: "profile",
        component: ProfileComponent
      }
    ]
  },
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      {
        path: "examples",
        loadChildren:
          "./layouts/auth-layout/auth-layout.module#AuthLayoutModule"
      }
    ]
  },
  {
    path: "**",
    redirectTo: "dashboard"
  }
];

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, {
    useHash: true,
    relativeLinkResolution: 'legacy'
})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
