import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantillaComponent } from '../modelos/plantilla/plantilla.component';
import { PlantillaService, Plantilla } from '../services/plantilla.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PlantillaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  public plantillasBuscadas: Array<Plantilla> = [];

  constructor(public PS: PlantillaService) {  }

  ngOnInit(): void {
    if (this.PS.getTemp()) {
      this.plantillasBuscadas = this.PS.getTemp();
    }
    let input= document.getElementById('input') as HTMLInputElement;
    input.addEventListener('change', () => {
      this.PS.setTemp([]);
      if (input.files) {
        let plantillas:Plantilla[] = [];
        for (let i = 0; i < input.files.length; i++) {
          if (
            input.files[i].name.endsWith('odt') ||
            input.files[i].name.endsWith('docx')
          ) {
            plantillas.push(new Plantilla(i + 1, input.files[i]));
          }
        }
        this.PS.setTemp(plantillas);
        this.plantillasBuscadas = plantillas;
      }
    });
  }

  busca() {
    let buscador: HTMLInputElement = document.getElementById('buscador') as HTMLInputElement;
    this.plantillasBuscadas = [];
    for (let plantilla of this.PS.getTemp()) {
      if (
        plantilla.nombre
          .toLocaleLowerCase()
          .includes(buscador.value.toLocaleLowerCase())
      ) {
        this.plantillasBuscadas.push(plantilla);
      }
    }
  }
}
