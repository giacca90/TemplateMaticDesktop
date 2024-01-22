import { Component, OnInit,  ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantillaComponent } from '../modelos/plantilla/plantilla.component';
import { PlantillaService, Plantilla } from '../services/plantilla.service';
import { AgregarComponent } from '../agregar/agregar.component'
import { IpcService } from '../services/ipc-render.service'

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, PlantillaComponent, AgregarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  public plantillasBuscadas: Array<Plantilla> = [];

  constructor(public PS: PlantillaService, public ipcRenderer: IpcService, private cdr: ChangeDetectorRef) {  }

  ngOnInit(): void {
    if (this.PS.getTemp()) {
      this.plantillasBuscadas = this.PS.getTemp();
    } 
    if(this.ipcRenderer.isElectron()) { 
      let selector = document.createElement("button");
      selector.innerText = "Elige una carpeta"
      selector.addEventListener("click", () => this.abreDialog())
//      selector.click = () => this.abreDialog();
      let dom = document.getElementById("selector");
      dom.appendChild(selector);
    } else {
      let selector = document.createElement("input");
      selector.type = "file";
      selector.name = "plantillas";
      selector.webkitdirectory = true;
      selector.multiple = true;
      selector.onchange = () => {
        this.PS.setTemp([]);
          if (selector.files) {  
            let plantillas:Plantilla[] = [];
            for (let i = 0; i < selector.files.length; i++) {
              if (
                selector.files[i].name.endsWith('odt') ||
                selector.files[i].name.endsWith('docx')
              ) {
                plantillas.push(new Plantilla(i + 1, selector.files[i]));
                /* let reader = new FileReader();
                reader.readAsDataURL(selector.files[i]);
                reader.onload = () => {
                  this.ipcRenderer.send("Files", reader.result);              
                } */
              }
            }
            this.PS.setTemp(plantillas);
            this.plantillasBuscadas = plantillas;
            this.cdr.detectChanges();
          }
      }
      let dom = document.getElementById('selector');
      dom.appendChild(selector);
    }
         /* if (this.PS.getTemp()) {
        this.plantillasBuscadas = this.PS.getTemp();
      }else{
        let plantillas:Plantilla[] = [];
        this.ipcRenderer.send("PersistenciaCarpeta");
        this.ipcRenderer.on("Carpeta", (_event, files:string[]) => {
          for(let i=0; i<files.length; i++) {
//            console.log("Prueba: "+files[i]);
            if(files[i].endsWith("odt") || files[i].endsWith("docx")) 
            plantillas.push(new Plantilla(i+1, null, files[i].split('/').slice(-1)[0], files[i]));
          }
          this.PS.setTemp(plantillas);
          this.plantillasBuscadas = plantillas;
          this.cdr.detectChanges();
        })
      }
    }else{
      let input = document.getElementById('input') as HTMLInputElement;
      console.log("Elemento input: "+input);
      if(input !== null) {
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
                let reader = new FileReader();
                reader.readAsDataURL(input.files[i]);
                reader.onload = () => {
                  this.ipcRenderer.send("Files", reader.result);              
                }
              }
            }
            this.PS.setTemp(plantillas);
            this.plantillasBuscadas = plantillas;
            this.cdr.detectChanges();
          }
        });
      }    
    } */
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
    this.cdr.detectChanges();
  }

  abreDialog() {
    this.ipcRenderer.send("openDialog");
    this.ipcRenderer.on('archivos-de-carpeta', (event, files) => {
      let plantillas: Plantilla[] = [];
      for(let i=0; i<files.length; i++) {
        if (
          files[i].name.endsWith('odt') ||
          files[i].name.endsWith('docx')
        ) {
          plantillas.push(new Plantilla(i+1,null,files[i].name,files[i].ruta))
        }
      }
      this.PS.setTemp(plantillas);
      this.plantillasBuscadas = plantillas;
      this.cdr.detectChanges();
    })
  }
}
