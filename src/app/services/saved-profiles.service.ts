import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SavedProfilesService {

  private _profiles: Array<any> = [];

  constructor() { }

  get allProfiles() { return this._profiles }

  addProfile(profile: any) {
    this._profiles.push(profile);
  }

  removeProfile(index: number) {
    this._profiles.splice(index, 1);
  }

  updateProfile(index: number, profile: any) {
    this._profiles.splice(index, 1, profile)
  }
}
