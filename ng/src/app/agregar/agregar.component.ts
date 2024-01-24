import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ClientesService} from '../services/clientes.service';
import { IpcService } from '../services/ipc-render.service'

@Component({
  selector: 'app-agregar',
  standalone: true,
  imports: [],
  templateUrl: './agregar.component.html',
  styleUrl: './agregar.component.css',
})
export class AgregarComponent implements OnInit {
  CSV: File;
  clientes: ClienteDinamico[] = [];

  constructor(private CS: ClientesService, public ipc: IpcService, private cdr: ChangeDetectorRef) {
    if(this.clientes.length === 0 && ipc.isElectron()) {
      ipc.send('PersistenciaCSV');
      ipc.on('CSVRecuperado', (_event, file) => {
        if(file.length > 0) {
          this.cargaCSV(file);
        }
      })
    }
  }
  
  ngOnInit(): void {
    this.clientes = this.CS.clientes;
  }

  precargaCSV() {
    if(this.ipc.isElectron()) {
      this.ipc.send("DialogCSV");
      this.ipc.on("CSV", (_event, file: string) => {
        console.log("CSV recibido: \n"+file);
        this.cargaCSV(file);
      })
    }else{
      let input = <HTMLInputElement>document.getElementById('CSV');
      this.CSV = input.files[0];
      let reader = new FileReader();
      reader.readAsText(this.CSV);
      reader.onload = () => {
        this.cargaCSV(reader.result.toString());
      }
    }
  }
  
  cargaCSV(file: string) {
    this.CS.clientes = [];
    let rows: string[] = file.split('\n');
    let atributos: string[];
    for (let i = 0; i < rows.length; i++) {
      let cliente: ClienteDinamico;
      let val = rows[i].split(',');
      if (i === 0) {
        atributos = val;
      } else {
        cliente = new ClienteDinamico(atributos);
        cliente.addValores(val, i);
        this.CS.clientes.push(cliente);
      }
    }
    this.clientes = this.CS.clientes;
    this.cdr.detectChanges();
  };
}

export class ClienteDinamico {
  public atributos:{clave:string, valor:string}[] = [];
  id:number;

  constructor(_claves:string[]) {
    for(let _clave of _claves) {
      this.atributos.push({clave: _clave, valor:""});
    }
  }

  addValores(_valores:string[], _id:number) {
      this.id = _id;
      for(let i=0; i<_valores.length; i++) {
        this.atributos[i].valor = _valores[i];
      }
  }

  toString() {
    let result:string = "";
    for(let valor of this.atributos) {
      result = result + valor.clave + ": " + valor.valor + "; ";
    }
    return result;
  }

}

