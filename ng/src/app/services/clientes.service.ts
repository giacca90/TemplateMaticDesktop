import { Injectable } from '@angular/core';
import { ClienteDinamico } from '../agregar/agregar.component'

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


