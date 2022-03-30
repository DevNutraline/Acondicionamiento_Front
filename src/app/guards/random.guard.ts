import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { GuardService } from "src/app/services/guard/guard.service";

@Injectable({
  providedIn: "root"
})
export class RandomGuard implements CanActivate  {


  constructor(private guardService: GuardService, private router: Router) {
  }
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.guardService.isLoggedIn()) {
      return true;
    }
    this.removeLocalStorageItems();
    this.router.navigate(["/home"]);
    return false;
  }
  removeLocalStorageItems(){
    localStorage.clear();
  }
}