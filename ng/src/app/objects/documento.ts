import JSZip from 'jszip';
import {BehaviorSubject} from 'rxjs';

export class Documento {
	id: number;
	file: File;
	nombre: string;
	address: string;
	contenido: Map<string, string> = new Map<string, string>(); //Cada .xml del File <nombre, contenido>
	referencias: Map<string, {inicio: number; fin: number}[]> = new Map<string, {inicio: number; fin: number}[]>(); //Las llaves <nombreXML, {inicioLlave, finLlave}
	claves: string[] = [];
	worker: Worker | null = null;

	generos: boolean = false;
	plurales: boolean = false;
	numeroDocumento: boolean = false;

	progresoCargaInicial = new BehaviorSubject<number>(0);
	estadoCargaInicial = new BehaviorSubject<boolean>(true);
	vista = new BehaviorSubject<Blob | string>(null);

	//TODO: Buscar las dos invocaciones del constructor
	constructor(_id: number, _file: File, _nombre?: string, _address?: string) {
		this.id = _id;
		this.file = _file;
		if (_file !== null) {
			//versión web
			this.nombre = _file.name;
			this.address = _file.webkitRelativePath;
		} else {
			//versión electron
			this.nombre = _nombre;
			this.address = _address;
		}
	}

	setFile(file: File) {
		this.file = file;
	}

	public async abrirArchivo() {
		console.log('Abrir archivo!!!');
		if (this.file != null) {
			// Descomprime el archivo
			const zip = await JSZip().loadAsync(this.file);
			// Obtener la lista de archivos
			const archivos = Object.keys(zip.files);
			// Procesar cada archivo
			for (let i = 0; i < archivos.length; i++) {
				if (archivos[i].endsWith('xml')) {
					const texto = await zip.file(archivos[i]).async('text');
					// Ahora puedes procesar el contenido XML como desees
					const parser = new DOMParser();
					const xmlDoc: Document = parser.parseFromString(texto, 'text/xml');
					const serializer = new XMLSerializer();
					const SxmlDoc: string = serializer.serializeToString(xmlDoc);
					this.contenido.set(archivos[i], SxmlDoc);
					this.buscaClaves(SxmlDoc, archivos[i]);
				}
				this.progresoCargaInicial.next(((i + 1) / archivos.length) * 100);
			}
			this.estadoCargaInicial.next(false);

			if (this.file.name.endsWith('odt')) {
				this.vista.next(await zip.file('Thumbnails/thumbnail.png').async('blob'));
			}
			if (this.file.name.endsWith('docx')) {
				this.vistaDocx();
			}
		}
	}

	private buscaClaves(fileString: string, nombre: string) {
		let index: number = 0;
		const array: {inicio: number; fin: number}[] = [];
		while (index !== -1) {
			index = fileString.indexOf('{{', index);
			if (index !== -1) {
				const indexEnd = fileString.indexOf('}}', index);
				if (indexEnd !== -1) {
					array.push({inicio: index, fin: indexEnd + 2});
					let clave = fileString.substring(index + 2, indexEnd);
					clave = clave.replace(/<.*?>/g, '');
					
					switch (clave[0]) {
					case '@':
						this.generos = true;
						break;

					case '#':
						this.plurales = true;
						break;

					case '$':
						if (!this.claves.includes(clave)) {
							this.numeroDocumento = true;
							this.claves.push(clave);
						}
						break;

					default:
						if (!this.claves.includes(clave)) {
							this.claves.push(clave);
						}
					}
					index = indexEnd;
				}
			}
		}
		this.referencias.set(nombre, array);
	}

	async vistaDocx() {
		if (typeof Worker !== 'undefined') {
			// Create a new
			this.worker = new Worker(new URL('../../app/workers/vista-docx.worker', import.meta.url));
			this.worker.postMessage(this.file);
			this.worker.onmessage = ({data}) => {
				this.vista.next(data);
			};
		} else {
			this.vista.next('<h3 text-color: red>NO SE PUEDE CARGAR UNA VISTA PREVIA!!!</h3>');
		}
	}

	toString() {
		return 'Nombre Plantilla: '+this.nombre+' Total claves: '+this.claves.length;
	}
}
