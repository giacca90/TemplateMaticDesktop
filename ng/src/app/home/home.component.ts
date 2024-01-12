import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantillaComponent } from '../modelos/plantilla/plantilla.component';
import { PlantillaService, Plantilla } from '../services/plantilla.service';
import { IpcService } from '../services/ipc-render.service'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PlantillaComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  public plantillasBuscadas: Array<Plantilla> = [];

  constructor(public PS: PlantillaService, private ipcRenderer: IpcService) {  }

  ngOnInit(): void {
    if (this.PS.getTemp()) {
      this.plantillasBuscadas = this.PS.getTemp();
    }
    let input= document.getElementById('input') as HTMLInputElement;
    input.addEventListener('change', () => {
      this.PS.setTemp([]);
      if (input.files) {
        
        /* let reader = new FileReader();
        reader.readAsArrayBuffer(input.files[0]);
        reader.onload = () => {
         let res:ArrayBuffer = reader.result as ArrayBuffer;
         console.log("FileReader: "+typeof res+"\n"+res.toString() )
          this.ipcService.send("Files", {res, name: input.files[0].name});
        }; */
        
        let plantillas:Plantilla[] = [];
        for (let i = 0; i < input.files.length; i++) {
          if (
            input.files[i].name.endsWith('odt') ||
            input.files[i].name.endsWith('docx')
          ) {
            plantillas.push(new Plantilla(i + 1, input.files[i]));
            let reader = new FileReader();
            reader.readAsDataURL(input.files[i]);
            reader.onload = () => {
              this.ipcRenderer.send("Files", reader.result);              
            }
            
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
