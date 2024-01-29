import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { IpcService } from '../services/ipc-render.service'
import { StatusService } from '../services/status.service';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [],
  templateUrl: './status.component.html',
  styleUrl: './status.component.css'
})
export class StatusComponent implements OnInit{

  public status:Status[] = [];

  constructor(public IPC:IpcService, public SS:StatusService, private cdr: ChangeDetectorRef) {
    
  }

  ngOnInit(): void {
    if(this.IPC.isElectron()) {
      console.log("Estas en Electron!!!");
      this.IPC.send("persistenciaStatus");
      this.IPC.on("StatusRecuperado", (_event, data:string) => {
        console.log("se recibe status");
        if(data) {
          this.cargaStatus(data);
        }
      })
    }   
    this.status = this.SS.getStatus();
    this.cdr.detectChanges();
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
          const decoder = new TextDecoder('utf-8');
          let res:string = decoder.decode(reader.result as ArrayBuffer)
          console.log("cargaStatus: "+res);
          this.cargaStatus(res);
        }
      }
    }
  }

  exportaStatus() {
    console.log("Exporta Status");
    let res:string = '';
    this.SS.getStatus().forEach((line) => {
      res = res+line.toString()+'\n';
    });
    const blob = new Blob([res], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    // Crear un elemento <a> invisible
    const a = document.createElement('a');
    a.href = url;
    a.download = 'status.status'; // Nombre del archivo a descargar

    // Anexar el elemento <a> al DOM
    document.body.appendChild(a);

    // Simular un clic en el enlace para iniciar la descarga
    a.click();

    // Eliminar el elemento <a> después de la descarga
    document.body.removeChild(a);

    // Liberar el objeto Blob
    window.URL.revokeObjectURL(url);
  }

  cargaStatus (data:string) {
    console.log("carga status");
    this.SS.deleteStatus();
    let arrayStatus:string[] = data.split('\n');
    arrayStatus.forEach((line) => {
      let datosClienteString:string = line.substring(line.indexOf('{')+1, line.indexOf('}'))
      let datos:string = line.substring(0,line.indexOf('{')-1)+line.substring(line.indexOf('}')+1);
      let arrayDatos:string[] = datos.split(',');
      let arrayDatosClientes:string[] = datosClienteString.split(';');
      let status:Status = new Status(parseInt(arrayDatos[0]),arrayDatos[1],arrayDatosClientes,arrayDatos[2],arrayDatos[3]);
      this.SS.addStatus(status);
    })
    this.status = this.SS.getStatus();
    this.cdr.detectChanges();
  }

  buscaStatus() {
    let buscado = (document.getElementById("buscaStatus") as HTMLInputElement).value.toLowerCase();
    this.status = [];
    this.SS.getStatus().forEach((stat) => {
      if(stat.toString().toLowerCase().includes(buscado)) {
        this.status.push(stat)
      }
    })
    this.cdr.detectChanges();
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

  toString():string {
    return this.index.toString()+','+this.nombrePlantilla+','+'{'+this.datosCliente.toString()+'}'+','+this.numeroDocumento+','+this.fechaCreacion
  }
}
