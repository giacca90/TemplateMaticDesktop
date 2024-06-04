import { Component, OnInit,  ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlantillaComponent } from '../components/plantilla/plantilla.component';
import { PlantillaService } from '../services/plantilla.service';
import { Documento } from '../objects/documento';
import { AgregarComponent } from '../components/agregar/agregar.component';
import { StatusComponent } from '../components/status/status.component';
import { IpcService } from '../services/ipc-render.service';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [RouterLink, PlantillaComponent, AgregarComponent, StatusComponent],
	templateUrl: './home.component.html',
	styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
	public plantillasBuscadas: Array<Documento> = [];

	constructor(public PS: PlantillaService, public ipcRenderer: IpcService, private cdr: ChangeDetectorRef) {  }

	ngOnInit(): void {
		if (this.PS.getTemp()) {
			this.plantillasBuscadas = this.PS.getTemp();
		} 
		if(this.ipcRenderer.isElectron()) { 
			const plantillas:Documento[] = [];
			this.ipcRenderer.send('PersistenciaCarpeta');
			this.ipcRenderer.on('Carpeta', (_event, files:string[]) => {
				for(let i=0; i<files.length; i++) {
					if(files[i].endsWith('odt') || files[i].endsWith('docx')) 
						plantillas.push(new Documento(i+1, null, files[i].split('/').slice(-1)[0], files[i]));
				}
				this.PS.setTemp(plantillas);
				this.plantillasBuscadas = plantillas;
				this.cdr.detectChanges();
			});
			const selector = document.createElement('button');
			selector.type = 'submit';
			selector.id = 'plantilla';
			selector.innerText = 'Elige una carpeta';
			selector.addEventListener('click', () => this.abreDialog());
			const dom = document.getElementById('selector');
			dom.appendChild(selector);
		} else {
			const selector = document.createElement('input');
			selector.type = 'file';
			selector.name = 'plantillas';
			selector.id = 'plantilla';
			selector.webkitdirectory = true;
			selector.multiple = true;
			selector.onchange = () => {
				this.PS.setTemp([]);
				if (selector.files) {  
					const plantillas:Documento[] = [];
					for (let i = 0; i < selector.files.length; i++) {
						if (
							selector.files[i].name.endsWith('odt') ||
                selector.files[i].name.endsWith('docx')
						) {
							plantillas.push(new Documento(i + 1, selector.files[i]));
						}
					}
					this.PS.setTemp(plantillas);
					this.plantillasBuscadas = plantillas;
					this.cdr.detectChanges();
				}
			};
			const dom = document.getElementById('selector');
			dom.appendChild(selector);
		}
	}

	busca() {
		const buscador: HTMLInputElement = document.getElementById('buscador') as HTMLInputElement;
		this.plantillasBuscadas = [];
		for (const plantilla of this.PS.getTemp()) {
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
		this.ipcRenderer.send('openDialog');
		this.ipcRenderer.on('archivos-de-carpeta', (event, files) => {
			const plantillas: Documento[] = [];
			for(let i=0; i<files.length; i++) {
				if (
					files[i].name.endsWith('odt') ||
          files[i].name.endsWith('docx')
				) {
					plantillas.push(new Documento(i+1,null,files[i].name,files[i].ruta));
				}
			}
			this.PS.setTemp(plantillas);
			this.plantillasBuscadas = plantillas;
			this.cdr.detectChanges();
		});
	}
}
