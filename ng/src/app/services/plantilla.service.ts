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

  getPlantillaForId(id: number): File {
    for (let i = 0; i < this.plantillas.length; i++) {
      if (this.plantillas[i].id == id) {
        return this.plantillas[i].file;
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

  constructor(_id: number, _file: File) {
    this.id = _id;
    this.file = _file;
    this.nombre = _file.name;
    this.address = _file.webkitRelativePath;
  }

  toString() {
    return this.id + ': ' + this.nombre;
  }
}
