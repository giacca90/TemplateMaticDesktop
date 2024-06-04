import { Injectable } from '@angular/core';
import { ClienteDinamico } from '../objects/cliente';

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
		for(const cliente of this.clientes) {
			if(cliente.getId() === id) {
				return cliente;
			}
		}
		return null;
	}
}


