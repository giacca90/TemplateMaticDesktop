import { Component, OnInit } from '@angular/core';
import { Cliente, ClientesService, ClienteDinamico } from '../services/clientes.service';

@Component({
  selector: 'app-agregar',
  standalone: true,
  imports: [],
  templateUrl: './agregar.component.html',
  styleUrl: './agregar.component.css',
})
export class AgregarComponent implements OnInit{
  CSV: File;
  //clientes:Cliente[] = this.CS.clientes;
  clientes:ClienteDinamico[] = [];

  constructor(private CS: ClientesService) {

  }
  ngOnInit(): void {
    this.clientes = this.CS.clientes;
  }
  cargaCSV() {
    let input = <HTMLInputElement>document.getElementById('CSV');
    this.CSV = input.files[0];
    let reader = new FileReader();
    reader.readAsText(this.CSV);
    reader.onload = () => {
      let CSVString:string = reader.result.toString();
//      console.log("CSVString: "+CSVString);
      let rows:string[] = CSVString.split('\n');
//      let count = 0;
      let atributos:string[];
      for(let i=0; i<rows.length; i++) {
        let cliente: ClienteDinamico;
//        console.log("row "+i+": "+ rows[i]);
        let val = rows[i].split(',');
        if(i===0) {
          atributos = val;
        }else{
          cliente = new ClienteDinamico(atributos);
          cliente.addValores(val, i);
          this.CS.clientes.push(cliente);
        } 
      }
      this.clientes = this.CS.clientes;

      /* Versión con Cliente */
      /* rows.forEach((row) => {
        console.log("raw: "+row)
        let val = row.split(',');
        console.log("val[0]: "+val[0]);
        let cliente = new Cliente(
          count,
          val[0],
          val[1],
          val[2],
          val[3],
          val[4],
          val[5],
          val[6]
        );
        count++;
        this.CS.addCliente(cliente);
      }); */
    //  this.clientes = this.CS.clientes;
    };
  }
}
