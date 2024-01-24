import { Component } from '@angular/core';
import { IpcService } from '../services/ipc-render.service'

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent {

  constructor(public IPC:IpcService) {
    
  }

  importaStatus() {
    
  }
}
