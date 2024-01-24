import { Component } from '@angular/core';
import { IpcService } from '../services/ipc-render.service'
import { StatusService } from '../services/status.service';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent {

  constructor(public IPC:IpcService, public SS:StatusService) {
    if(IPC.isElectron()) {
      IPC.send("persistenciaStatus");
      IPC.on("StatusRecuperado", (_event, data:string) => {
        this.cargaStatus(data);
      })
    }   
  }

  importaStatus() {
    if(this.IPC.isElectron()) {
      this.IPC.send("dialogStatus");
      this.IPC.on("StatusCSV", (_event, data:string) => {
        this.cargaStatus(data);
      })
    }else{
      let button = document.getElementById('cargaStatus') as HTMLInputElement;
      if(button.files) {
        let reader = new FileReader();
        reader.readAsArrayBuffer(button.files[0]);
        reader.onload = () => {
          this.cargaStatus(reader.result.toString());
        }
      }
    }
  }

  exportaStatus() {

  }

  cargaStatus (data:string) {
    this.SS.deleteStatus();
    let arrayStatus:string[] = data.split('\n');
    for(let i=0; i<arrayStatus.length; i++) {
      let arrayDetalleStatus:string[] = arrayStatus[i].split(',');

    }
  }
}

export class Status {
  index:number;
  nombrePlantilla:string;
  datosCliente:string[];
  numeroDocumento:string;
  fechaCreacion:string;

  constructor(_index:number, _nombrePlantilla:string, _datosCliente:string[], _numeroDocumento:string, _fechaCreacion:string) {
    this.index = _index;
    this.nombrePlantilla = _nombrePlantilla;
    this.datosCliente = _datosCliente;
    this.numeroDocumento = _numeroDocumento;
    this.fechaCreacion = _fechaCreacion;
  }

  export() {
    let res:string[] = [];
    res.push(this.index.toString());
    res.push(this.nombrePlantilla);
    res.push('{'+this.datosCliente.toString()+'}');
    res.push(this.numeroDocumento);
    res.push(this.fechaCreacion);
    return res;
  }
}
