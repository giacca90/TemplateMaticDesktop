export class ClienteDinamico {
	public atributos:{clave:string, valor:string}[] = [];
	id:number;

	constructor(_claves:string[]) {
		for(const _clave of _claves) {
			this.atributos.push({clave: _clave, valor:''});
		}
	}

	addValores(_valores:string[], _id:number) {
		this.id = _id;
		for(let i=0; i<_valores.length; i++) {
			this.atributos[i].valor = _valores[i];
		}
	}

	toString() {
		let result:string = '';
		for(const valor of this.atributos) {
			result = result + valor.clave + ': ' + valor.valor + '; ';
		}
		return result;
	}
}
