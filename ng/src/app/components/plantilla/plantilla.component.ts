import { Component, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ClienteDinamico } from '../agregar/agregar.component';
import { Status } from '../status/status.component'; 
import { StatusService } from '../../services/status.service'; 
import { Plantilla, PlantillaService } from '../../services/plantilla.service';
import { ClientesService } from '../../services/clientes.service';
import { IpcService } from '../../services/ipc-render.service';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import JSZip from 'jszip';

@Component({
	selector: 'app-plantilla',
	standalone: true,
	imports: [FormsModule, NgSelectModule],
	templateUrl: './plantilla.component.html',
	styleUrl: './plantilla.component.css',
})
export class PlantillaComponent implements OnDestroy{
	route: ActivatedRoute = inject(ActivatedRoute);
	id: number;
	file: File;
	nombre: string;
	ruta: string;
	claves: string[] = [];
	nuevoFile: File;
	path: string;
	selected: string;
	estadoCargaInicial: boolean = true;
	progresoCargaInicial: number = 0;
	estadoCreacionArchivo: boolean = false;
	progresoCreacionArchivo: number = 0;
	worker: Worker | null = null;
	numeroDocumento: boolean = false;
	generos: boolean = false;
	plurales: boolean = false;
	cortina:boolean = false;
	clientesTemporales:Array<ClienteDinamico>;

	constructor(
    public PS: PlantillaService,
    public CS: ClientesService,
    public SS: StatusService,
    public IPC: IpcService,
    private cdr: ChangeDetectorRef
	) {
		IPC.clear();
		this.clientesTemporales = this.CS.clientes;
		this.id = this.route.snapshot.queryParams['id'];

		if(this.id) {
			const plantilla: Plantilla = PS.getPlantillaForId(this.id);
			this.file = plantilla.file;
			if (this.file === null) {
				IPC.send('busca', plantilla.address);
				IPC.on('arraybuffer', (_event, arraybuffer: ArrayBuffer) => {
					this.file = new File([arraybuffer], plantilla.nombre);
					//        this.nuevoFile = this.file;
					this.nombre = plantilla.nombre;
					console.log('nombre: ' + this.nombre);
					this.ruta = plantilla.address;
					console.log('ruta: ' + this.ruta);
  
					this.abrirArchivo();
				});
			} else {
				this.nombre = this.file.name;
				this.ruta = this.file.path;
				this.abrirArchivo();
			}
		}
	}

	ngOnDestroy(): void {
		if(this.worker !== null) {
			this.worker.terminate();
		}
	}

	async abrirArchivo() {
		// Descomprime el archivo
		const zip = await JSZip().loadAsync(this.file);
		// Obtener la lista de archivos
		const archivos = Object.keys(zip.files);
		// Procesar cada archivo
		for (let i = 0; i < archivos.length; i++) {
			if (archivos[i].endsWith('xml')) {
				const contenido = await zip.file(archivos[i]).async('text');
				// Ahora puedes procesar el contenido XML como desees
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(contenido, 'text/xml');
				const serializer = new XMLSerializer();
				const SxmlDoc = serializer.serializeToString(xmlDoc);
				this.buscaClaves(SxmlDoc);
			}
			this.progresoCargaInicial = ((i + 1) / archivos.length) * 100;
			this.cdr.detectChanges();
		}
		this.estadoCargaInicial = false;
		this.cambiaColor();
		this.cdr.detectChanges();

		if (this.file.name.endsWith('odt')) {
			this.vistaOdt();
		}
		if (this.file.name.endsWith('docx')) {
			this.vistaDocx();
		}
	}

	async vistaOdt() {
		let vista = null;
		const zip = await JSZip().loadAsync(this.file);
		const reader = new FileReader();
		vista = await zip.file('Thumbnails/thumbnail.png').async('blob');
		reader.readAsDataURL(vista);
		reader.onload = () => {
			const view = document.getElementById('contentContainer');
			// Crea un elemento de imagen y establece su fuente como los datos de la imagen
			const imgElement = document.createElement('img');
			imgElement.src = reader.result as string;
			imgElement.alt = 'Cargando...';
			// Establece el ancho del elemento img al ancho del div
			imgElement.style.width = '100%';
			// Agrega la imagen al div
			view.innerHTML = '';
			view.appendChild(imgElement);
		};
		this.cdr.detectChanges();
	}

	async vistaDocx() {
		if (typeof Worker !== 'undefined') {
			// Create a new
			this.worker = new Worker(
				new URL('../../workers/vista-docx.worker', import.meta.url)
			);
			this.worker.postMessage(this.file);
			this.worker.onmessage = ({ data }) => {
				const view = document.getElementById('contentContainer');
				view.innerHTML =
          '<div id="contenido" style="width: 100%; height: 100%; overflow: hidden;">' +
          data +
          '</div>';
			};
		} else {
			const view = document.getElementById('contentContainer');
			view.innerHTML =
        '<h3 text-color: red>NO SE PUEDE CARGAR UNA VISTA PREVIA!!!</h3>';
		}
	}

	buscaClaves(fileString: string) {
		let index: number = 0;
		while (index !== -1) {
			index = fileString.indexOf('{{', index);
			if (index !== -1) {
				const indexEnd = fileString.indexOf('}}', index);
				if (indexEnd !== -1) {
					let clave = fileString.substring(index + 2, indexEnd);
					clave = clave.replace(/<.*?>/g, '');
					if(clave[0] === '@') {
						this.generos = true;
					}else if(clave[0] ==='#') {
						this.plurales = true;
					}else if (!this.claves.includes(clave)) {
						this.claves.push(clave);
						if(clave === '$$$') {
							this.numeroDocumento = true;
						}
					}
					index = indexEnd;
				}
			}
		}
		this.cdr.detectChanges();
		console.log('Se han encontrado ' + this.claves.length + ' claves');
	}

	cambiaColor() {
		for (const clave of this.claves) {
			console.log('Clave: '+clave);
			const campo = document.getElementById(clave) as HTMLInputElement;
			campo.addEventListener('change', () => {
				if(campo.value.length === 0) {
					campo.classList.remove('campoValido');
					campo.classList.add('campoVacio');
				}else{
					campo.classList.remove('campoVacio');
					campo.classList.add('campoValido');
				}
			});
		}
		const numeroDocAuto = document.getElementById('numeroDocAuto') as HTMLInputElement;
		const campoNumeroDocumento = document.getElementById('$$$');
		if(numeroDocAuto) {
			numeroDocAuto.addEventListener('change', () => {
				if(numeroDocAuto) {
					if(numeroDocAuto.checked === true) {
						if(campoNumeroDocumento) {
							campoNumeroDocumento.classList.remove('campoVacio');
							campoNumeroDocumento.classList.add('campoValido');
						}
					}else{
						if(campoNumeroDocumento) {
							campoNumeroDocumento.classList.remove('campoValido');
							campoNumeroDocumento.classList.add('campoVacio');
						}
					}
				}
			});
		}
	}

	async creaDocumento() {
		console.log('Comienza creaDocumento');
		this.nuevoFile = this.file;
		this.estadoCreacionArchivo = true;
		this.cdr.detectChanges();
		const fecha:Date = new Date();
		let numeroDocumento = ''; 
		const parejas: Array<{ clave: string; valor: string }> = [];
		const parejaStringArray:string[] = [];
		for (const clave of this.claves) {
			const ele = document.getElementById(clave) as HTMLInputElement;
			let val:string;
			if(clave === '$$$' && this.numeroDocumento === true) {
				numeroDocumento = fecha.getFullYear().toString()+(fecha.getMonth()+1).toString()+fecha.getDate().toString()+fecha.getHours().toString()+fecha.getMinutes().toString()+fecha.getSeconds().toString();
				val = numeroDocumento;
			}else if (clave === '$$$' && this.numeroDocumento === false) {
				val = ele.value;
				numeroDocumento = ele.value;
			}
			else {
				val = ele.value;
				parejaStringArray.push(clave+': '+val);
			}
			const par = { clave: clave, valor: val };
			parejas.push(par);
		}
		/*     console.log('PAREJAS:');
    for (let pareja of parejas) {
      console.log('Clave: ' + pareja.clave + ' Valor: ' + pareja.valor);
    }
 */
		// Descomprime el archivo
		console.log('Comienza a abrir el archivo');
		const zip = await JSZip().loadAsync(this.file);
		// Obtener la lista de archivos
		console.log('Obtiene lista de archivos');
		const archivos: string[] = Object.keys(zip.files);
		//    archivos.forEach(ar => console.log(ar));
		// Procesar cada archivo
		console.log('Comienza a analizar cada archivo:');
		for (let i = 0; i < archivos.length; i++) {
			if (archivos[i].endsWith('xml')) {
				console.log('ARCHIVO INTERNO: '+ archivos[i]);
				const contenido = await zip.file(archivos[i]).async('text');
				// Ahora puedes procesar el contenido XML como desees
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(contenido, 'text/xml');
				const serializer = new XMLSerializer();
				const SxmlDoc = serializer.serializeToString(xmlDoc);
				//        console.log("Archivo:\n"+SxmlDoc);
				await this.sustituyeClaves(SxmlDoc, parejas, archivos[i]);
			}
			this.progresoCreacionArchivo = ((i + 1) / archivos.length) * 100;
			this.cdr.detectChanges();
		}
		console.log('Comienza la descarga del documento modificado');
		const link = document.createElement('a');
		link.href = URL.createObjectURL(this.nuevoFile);
		let nombreFinal:string = '';
		if(this.claves.includes('$$$')) {
			nombreFinal = numeroDocumento+'_'+this.file.name;
		}else{
			nombreFinal = 'rellenado_' + this.file.name;
		}
		link.download = nombreFinal; 
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		const status = new Status((this.SS.getStatus().length+1), this.file.name, parejaStringArray, numeroDocumento, Date()); 
		this.SS.addStatus(status, true);
		if(this.IPC.isElectron())
			this.IPC.send('addStatus', status.toString());
	} 

	async sustituyeClaves(
		SxmlDoc: string,
		parejas: Array<{ clave: string; valor: string }>,
		nombreArchivo: string
	) {
		console.log('Comienza sustituyeClaves');
		let documento: string = '';
		let index: number = 0;
		let indexTemp: number = 0;
		while (index !== -1) {
			index = SxmlDoc.indexOf('{{', index);
			if (index !== -1) {
				const indexEnd = SxmlDoc.indexOf('}}', index);
				if (indexEnd !== -1) {
					let clave = SxmlDoc.substring(index + 2, indexEnd);
					clave = clave.replace(/<.*?>/g, '');
					let valor = '';
					if(clave[0] === '@') {
						const generos:string = (document.querySelector('input[name="generos"]:checked') as HTMLInputElement).value;
						if(generos === 'masculino') {
							valor = clave.substring(1,clave.indexOf('/'));
						}else{
							valor = clave.substring(clave.indexOf('/')+1);
						}
					}else if(clave[0] === '#') {
						const plurales:string = (document.querySelector('input[name="plurales"]:checked') as HTMLInputElement).value;
						if(plurales === 'singular') {
							valor = clave.substring(1,clave.indexOf('/'));
						}else{
							valor = clave.substring(clave.indexOf('/')+1);
						}
					}else{
						parejas.forEach((par) => {
							if (par.clave === clave) {
								valor = par.valor;
							}
						});
					}
          
					documento = documento + SxmlDoc.substring(indexTemp, index) + valor;

					index = indexEnd;
					indexTemp = indexEnd + 2;
				}
			}
		}
		documento = documento + SxmlDoc.substring(indexTemp);
		//    console.log('DOCUMENTO: \n\n' + documento);
		await this.replaceXmlInCopy(this.nuevoFile, documento, nombreArchivo);
	}

	async replaceXmlInCopy(
		originalBlob: File,
		modifiedXml: string,
		outputPath: string
	) {
		const zip = new JSZip();
		console.log('Comienza replaceXml');
		// Lee el contenido del archivo original
		const originalZip = await zip.loadAsync(originalBlob);
		// Sustituye el contenido XML modificado
		console.log('Sustituye el contenido XML modificado');
		originalZip.file(outputPath, modifiedXml);
		// Crea el nuevo archivo
		this.nuevoFile = (await originalZip.generateAsync({
			type: 'blob',
		})) as File;
		console.log('crea nuevo archivo');
	}

	completa(id:number) {
		const cliente: ClienteDinamico = this.CS.getClienteForId(id);
		console.log('Cliente obtenido: ' + cliente.toString());
		for (const atributo of cliente.atributos) {
			for (const clave of this.claves) {
				if (clave === atributo.clave) {
					const a = document.getElementById(clave) as HTMLInputElement;
					a.value = atributo.valor;
					a.classList.remove('campoVacio');
					a.classList.add('campoValido');
					a.removeAttribute('placeholder');
				}
			}
		}
		this.cortina = false;
		this.cdr.detectChanges();
	}

	buscaCliente() {
		const val:string = (document.getElementById('opciones') as HTMLInputElement).value;
		console.log('buscaCliente: '+val);
		this.clientesTemporales = [];
		this.CS.clientes.forEach((cliente) => {
			if(cliente.toString().toLowerCase().includes(val.toLowerCase())){
				this.clientesTemporales.push(cliente);
			}
		});
		this.cdr.detectChanges();
	}

	abreCortina() {
		this.cortina = true;
		this.cdr.detectChanges();
	}
  
}
