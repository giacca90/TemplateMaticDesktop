export class Documento {
	id: number;
	file: File;
	nombre: string;
	address: string;

	constructor(_id: number, _file: File, _nombre?: string, _address?: string) {
		this.id = _id;
		this.file = _file;
		if(_file !== null) {
			this.nombre = _file.name;
			this.address = _file.webkitRelativePath;
		}else{
			this.nombre = _nombre;
			this.address = _address;
		}
	}

	toString() {
		return this.id + ': ' + this.nombre;
	}
}