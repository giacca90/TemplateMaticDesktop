import { Component, OnInit } from '@angular/core';
import { ClientesService, ClienteDinamico } from '../services/clientes.service';

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

  constructor(private CS: ClientesService) {}
  ngOnInit(): void {
    this.clientes = this.CS.clientes;
  }
  cargaCSV() {
    let input = <HTMLInputElement>document.getElementById('CSV');
    this.CSV = input.files[0];
    let reader = new FileReader();
    reader.readAsText(this.CSV);
    reader.onload = () => {
      let CSVString: string = reader.result.toString();
      let rows: string[] = CSVString.split('\n');
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
    };
  }
}
