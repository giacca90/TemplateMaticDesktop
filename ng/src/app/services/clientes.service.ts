import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  //public clientes:Array<Cliente> = [];
  public clientes:Array<ClienteDinamico> = [];
  constructor() { }

 /*  addCliente(cliente:Cliente) {
    this.clientes.push(cliente);
  } */

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

export class Cliente {
  id:number;
  nombre:string;
  apellido:string;
  nombreREML:string;
  numeroREML:string;
  direccion:string;
  correo:string;
  fechaNacimiento:string;

  constructor(_id:number, _nombre:string, _apellido:string, _nombreREML:string, _numeroREML:string, _direccion:string, _correo:string, _fechaNacimiento:string) {
    this.id = _id;
    this.nombre = _nombre;
    this.apellido = _apellido;
    this.nombreREML = _nombreREML;
    this.numeroREML = _numeroREML;
    this.direccion = _direccion;
    this.correo = _correo;
    this.fechaNacimiento = _fechaNacimiento;
  }

  toString(): string {
    return "Nombre: "+this.nombre+" Apellido: "+this.apellido+" Nombre REML: "+this.nombreREML+" Numero REML: "+this.numeroREML+" Dirección: "+this.direccion+" Correo Electronico: "+this.correo+" Fecha de nacimiento: "+this.fechaNacimiento
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
