export class ClienteDinamico {
	private atributos: Map<string, string> = new Map<string, string>();
	private id: number;

	constructor(_claves: string[], _valores: string[]) {

		_claves.map((clave, index) => {
			const valor: string = _valores[index];
			this.atributos.set(clave, valor);
		});

		this.atributos.forEach((val, key) => {
			console.log('CLIENTE: Dato: '+ key +' Valor: '+val);
		});
	}

	getId() {
		return this.id;
	}

	addValores(_valores: string[], _id: number) {
		this.id = _id;
		for (let i = 0; i < _valores.length; i++) {
			this.atributos[i].valor = _valores[i];
		}
	}

	getAtributos() {
		return this.atributos;
	}

	toString() {
		let result: string = '';
		this.atributos.forEach((_val, _key) => {
			result = result + _key + ': ' + _val + '; ';
		});
		return result;
	}

}
