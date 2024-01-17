import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  public clientes:Array<ClienteDinamico> = [];
  constructor() { }

  addCliente(cliente:ClienteDinamico) {
    this.clientes.push(cliente);
  }

  getClienteForId(id:number) {
    for(let cliente of this.clientes) {
      if(cliente.id === id) {
        return cliente;
      }
    }
    return null;
  }
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
      result = result + valor.clave + ": " + valor.valor + " ";
    }
    return result;
  }

}
