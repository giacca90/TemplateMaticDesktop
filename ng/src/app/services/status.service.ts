import { Injectable } from '@angular/core';
import { Status } from '../status/status.component'

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private status:Status[] = []
  
  constructor() { }

  addStatus(data:Status, up?:boolean) {
    if(up && up === true) {
      this.status.unshift(data);
    }else{
      this.status.push(data);
    }
  }

  getStatus() {
    return this.status;
  }

  deleteStatus() {
    this.status = [];
  }
}
