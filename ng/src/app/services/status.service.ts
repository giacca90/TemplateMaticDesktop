import { Injectable } from '@angular/core';
import { Status } from '../status/status.component'

@Injectable({
  providedIn: 'root'
})
export class StatusService {
  private status:Status[] = []
  
  constructor() { }

  addStatus(data:Status) {
    this.status.push(data);
  }

  getStatus() {
    return this.status;
  }

  deleteStatus() {
    this.status = [];
  }
}
