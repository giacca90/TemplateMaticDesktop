import { Injectable } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class PlantillaService {
	private plantillas: Plantilla[];
	constructor() {}

	setTemp(_plantillas: Plantilla[]) {
		this.plantillas = _plantillas;
	}

	getTemp() {
		return this.plantillas;
	}

	getPlantillaForId(id: number): Plantilla {
		for (let i = 0; i < this.plantillas.length; i++) {
			if (this.plantillas[i].id == id) {
				return this.plantillas[i];
			}
		}
		return null;
	}
}

export class Plantilla {
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
