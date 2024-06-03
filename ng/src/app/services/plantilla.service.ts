import { Injectable } from '@angular/core';
import { Documento } from '../objects/documento';

@Injectable({
	providedIn: 'root',
})
export class PlantillaService {
	private plantillas: Documento[];
	constructor() {}

	setTemp(_plantillas: Documento[]) {
		this.plantillas = _plantillas;
	}

	getTemp() {
		return this.plantillas;
	}

	getPlantillaForId(id: number): Documento {
		for (let i = 0; i < this.plantillas.length; i++) {
			if (this.plantillas[i].id == id) {
				return this.plantillas[i];
			}
		}
		return null;
	}
}
