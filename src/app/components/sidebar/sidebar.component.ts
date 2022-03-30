import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "src/app/models/user";

var misc: any = {
  sidebar_mini_active: true
};

export interface RouteInfo {
  path: string;
  title: string;
  key: string;
  type: string;
  icontype: string;
  collapse?: string;
  isCollapsed?: boolean;
  isCollapsing?: any;
  children?: ChildrenItems[];
}

export interface ChildrenItems {
  path: string;
  title: string;
  type?: string;
  collapse?: string;
  children?: ChildrenItems2[];
  isCollapsed?: boolean;
}
export interface ChildrenItems2 {
  path?: string;
  title?: string;
  type?: string;
}
//Menu Items
export const ROUTES: RouteInfo[] = [
  {
    path: "/dashboards/alternative",
    title: "Home",
    key:"home",
    type: "link",
    icontype: "ni-shop text-primary",
    // isCollapsed: true,
    // children: [
    //   { path: "dashboard", title: "Dashboard", type: "link" },
    //   { path: "alternative", title: "Alternative", type: "link" }
    // ]
  },{
    path: "/dashboards",
    title: "Recepción",
    key:"recepción",
    type: "sub",
    icontype: "ni-app text-primary",
    isCollapsed: true,
    children: [
      { path: "product-reception", title: "Recepción de Productos", type: "link" },
      // { path: "alternative", title: "Alternative", type: "link" }
    ]
  },{
    path: "/dashboards",
    title:"Regulatorio",//title: "Acondicionamiento",
    key:"acondicionamiento",
    type: "sub",
    icontype: "ni-archive-2 text-primary",
    isCollapsed: true,
    children: [
      { path: "folders", title: "Carpetas", type: "link" },
      { path: "products", title: "Productos", type: "link" },
      { path: "product-versions", title: "Versión de Producto", type: "link" },
      { path: "product-brand", title: "Marca de producto", type: "link" },
      { path: "lot", title: "Lote", type: "link" }
    ]
  },{
    path: "/dashboards",
    title: "Insumos",
    key:"insumos",
    type: "sub",
    icontype: "ni-bullet-list-67 text-primary",
    isCollapsed: true,
    children: [
      { path: "supplies", title: "Gestión de Insumos", type: "link" },
      { path: "supplie-inventory", title: "Inventario de Insumo", type: "link" },
      { path: "supplies-versions", title: "Versión de Insumo", type: "link" },
      { path: "groups", title: "Gestión de Grupos", type: "link" },
      { path: "purchase-supplies", title: "Compra de Insumos", type: "link" },
      // { path: "alternative", title: "Alternative", type: "link" }
    ]
  },{
    path: "/dashboards",
    title: "Proceso OVA",
    key:"proceso ova",
    type: "sub",
    icontype: "ni-single-copy-04 text-primary",
    isCollapsed: true,
    children: [
      { path: "ova", title: "Ova", type: "link" },
      { path: "ova-process-types", title: "Tipo Proceso OVA", type: "link" },
      { path: "product-type-ovas", title: "Producto Tipo OVA", type: "link" },
    ]
  },{
    path: "/dashboards",
    title: "Nota de venta",
    key:"nota de venta",
    type: "sub",
    icontype: "ni-ui-04 text-primary",
    isCollapsed: true,
    children: [
      { path: "sale-note", title: "Gestión de nota de ventas", type: "link" },
    ]
  },{
    path: "/dashboards",
    title: "Seguridad",
    key:"seguridad",
    type: "sub",
    icontype: "ni-lock-circle-open text-primary",
    isCollapsed: true,
    children: [
      { path: "users", title: "Administración Usuarios", type: "link" },
      { path: "rols", title: "Administración Roles", type: "link" },
      // { path: "alternative", title: "Alternative", type: "link" }
    ]
  },{
    path: "/dashboards",
    title: "Notificaciones",
    key:"notificaciones",
    type: "sub",
    icontype: "ni-bell-55 text-primary",
    isCollapsed: true,
    children: [
      { path: "recipients", title: "Destinatarios Email", type: "link" },
    ]
  }
  // {
  //   path: "/dashboards",
  //   title: "Dashboards",
  //   type: "sub",
  //   icontype: "ni-shop text-primary",
  //   isCollapsed: true,
  //   children: [
  //     { path: "dashboard", title: "Dashboard", type: "link" },
  //     { path: "alternative", title: "Alternative", type: "link" }
  //   ]
  // },
  // {
  //   path: "/examples",
  //   title: "Examples",
  //   type: "sub",
  //   icontype: "ni-ungroup text-orange",
  //   collapse: "examples",
  //   isCollapsed: true,
  //   children: [
  //     { path: "pricing", title: "Pricing", type: "link" },
  //     { path: "login", title: "Login", type: "link" },
  //     { path: "register", title: "Register", type: "link" },
  //     { path: "lock", title: "Lock", type: "link" },
  //     { path: "timeline", title: "Timeline", type: "link" },
  //     { path: "profile", title: "Profile", type: "link" }
  //   ]
  // },
  // {
  //   path: "/components",
  //   title: "Components",
  //   type: "sub",
  //   icontype: "ni-ui-04 text-info",
  //   collapse: "components",
  //   isCollapsed: true,
  //   children: [
  //     { path: "buttons", title: "Buttons", type: "link" },
  //     { path: "cards", title: "Cards", type: "link" },
  //     { path: "grid", title: "Grid", type: "link" },
  //     { path: "notifications", title: "Notifications", type: "link" },
  //     { path: "icons", title: "Icons", type: "link" },
  //     { path: "typography", title: "Typography", type: "link" },
  //     {
  //       path: "multilevel",
  //       isCollapsed: true,
  //       title: "Multilevel",
  //       type: "sub",
  //       collapse: "multilevel",
  //       children: [
  //         { title: "Third level menu" },
  //         { title: "Just another link" },
  //         { title: "One last link" }
  //       ]
  //     }
  //   ]
  // },
  // {
  //   path: "/forms",
  //   title: "Forms",
  //   type: "sub",
  //   icontype: "ni-single-copy-04 text-pink",
  //   collapse: "forms",
  //   isCollapsed: true,
  //   children: [
  //     { path: "elements", title: "Elements", type: "link" },
  //     { path: "components", title: "Components", type: "link" },
  //     { path: "validation", title: "Validation", type: "link" }
  //   ]
  // },
  // {
  //   path: "/tables",
  //   title: "Tables",
  //   type: "sub",
  //   icontype: "ni-align-left-2 text-default",
  //   collapse: "tables",
  //   isCollapsed: true,
  //   children: [
  //     { path: "tables", title: "Tables", type: "link" },
  //     { path: "sortable", title: "Sortable", type: "link" },
  //     { path: "ngx-datatable", title: "Ngx Datatable", type: "link" }
  //   ]
  // },
  // {
  //   path: "/maps",
  //   title: "Maps",
  //   type: "sub",
  //   icontype: "ni-map-big text-primary",
  //   collapse: "maps",
  //   isCollapsed: true,
  //   children: [
  //     { path: "google", title: "Google Maps", type: "link" },
  //     { path: "vector", title: "Vector Map", type: "link" }
  //   ]
  // },
  // {
  //   path: "/widgets",
  //   title: "Widgets",
  //   type: "link",
  //   icontype: "ni-archive-2 text-green"
  // },
  // {
  //   path: "/charts",
  //   title: "Charts",
  //   type: "link",
  //   icontype: "ni-chart-pie-35 text-info"
  // },
  // {
  //   path: "/calendar",
  //   title: "Calendar",
  //   type: "link",
  //   icontype: "ni-calendar-grid-58 text-red"
  // }
];

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"]
})
export class SidebarComponent implements OnInit {
  public menuItems: any[];
  public isCollapsed = true;
  public user:User=null;

  constructor(private router: Router) {}

  ngOnInit() {
    
    this.router.events.subscribe(event => {
      this.isCollapsed = true;
    });
    this.getUser();
  }
  getUser(){    
    this.user=JSON.parse(localStorage.getItem("user")).user;
    this.buildMenuRoutes();
  }
  buildMenuRoutes(){
    const permissions=this.user.rol.role_permissions;
    this.menuItems = ROUTES.filter(menuItem =>{
      //switch (menuItem.title.toLowerCase()) {
        switch (menuItem.key.toLowerCase()) {
          case "home":
            return menuItem;
            break;
          default:
            for(let element of permissions){
              switch (element.permission.name.toLowerCase()) {
                //case menuItem.title.toLowerCase():
                case menuItem.key.toLowerCase():
                  return menuItem;
                  break;
                default:
                  // code...
                  break;
              }
            }
            break;
      }
       
    });
  }
  onMouseEnterSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.add("g-sidenav-show");
    }
  }
  onMouseLeaveSidenav() {
    if (!document.body.classList.contains("g-sidenav-pinned")) {
      document.body.classList.remove("g-sidenav-show");
    }
  }
  minimizeSidebar() {
    const sidenavToggler = document.getElementsByClassName(
      "sidenav-toggler"
    )[0];
    const body = document.getElementsByTagName("body")[0];
    if (body.classList.contains("g-sidenav-pinned")) {
      misc.sidebar_mini_active = true;
    } else {
      misc.sidebar_mini_active = false;
    }
    if (misc.sidebar_mini_active === true) {
      body.classList.remove("g-sidenav-pinned");
      body.classList.add("g-sidenav-hidden");
      sidenavToggler.classList.remove("active");
      misc.sidebar_mini_active = false;
    } else {
      body.classList.add("g-sidenav-pinned");
      body.classList.remove("g-sidenav-hidden");
      sidenavToggler.classList.add("active");
      misc.sidebar_mini_active = true;
    }
  }
}
