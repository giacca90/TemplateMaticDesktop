import { Component, inject, ChangeDetectorRef, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plantilla, PlantillaService } from '../../services/plantilla.service';
import {
  ClienteDinamico,
  ClientesService,
} from '../../services/clientes.service';
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
  worker: Worker | null = null
  numeroDocumento: boolean = false;

  constructor(
    public PS: PlantillaService,
    public CS: ClientesService,
    IPC: IpcService,
    private cdr: ChangeDetectorRef
  ) {
    IPC.clear();
    this.id = this.route.snapshot.queryParams['id'];
    console.log('id: ' + this.id);
    let plantilla: Plantilla = PS.getPlantillaForId(this.id);
    this.file = plantilla.file;
    if (this.file === null) {
      IPC.send('busca', plantilla.address);
      IPC.on('arraybuffer', (_event, arraybuffer: ArrayBuffer) => {
        this.file = new File([arraybuffer], plantilla.nombre);
        this.nuevoFile = this.file;
        this.nombre = plantilla.nombre;
        console.log('nombre: ' + this.nombre);
        this.ruta = plantilla.address;
        console.log('ruta: ' + this.ruta);

        this.abrirArchivo();
      });
    } else {
      this.abrirArchivo();
    }
  }
  ngOnDestroy(): void {
//    console.log("ngOnDestroy")
    if(this.worker !== null) {
//      console.log("Destruye en Worker");
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
      let view = document.getElementById('contentContainer');
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
        new URL('./vista-docx.worker', import.meta.url)
      );
      this.worker.postMessage(this.file);
      this.worker.onmessage = ({ data }) => {
        let view = document.getElementById('contentContainer');
        view.innerHTML =
          '<div id="contenido" style="width: 100%; height: 100%; overflow: hidden;">' +
          data +
          '</div>';
      };
    } else {
      let view = document.getElementById('contentContainer');
      view.innerHTML =
        '<h3 text-color: red>NO SE PUEDE CARGAR UNA VISTA PREVIA!!!</h3>';
    }
  }

  buscaClaves(fileString: string) {
    let index: number = 0;
    while (index !== -1) {
      index = fileString.indexOf('{{', index);
      if (index !== -1) {
        let indexEnd = fileString.indexOf('}}', index);
        if (indexEnd !== -1) {
          let clave = fileString.substring(index + 2, indexEnd);
          clave = clave.replace(/<.*?>/g, '');
          if (!this.claves.includes(clave)) {
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
    for (let clave of this.claves) {
      console.log("Clave: "+clave);
      let campo = document.getElementById(clave) as HTMLInputElement
      campo.addEventListener("change", () => {
        if(campo.value.length === 0) {
          campo.classList.remove("campoValido");
          campo.classList.add("campoVacio");
        }else{
          campo.classList.remove("campoVacio");
          campo.classList.add("campoValido");
        }
      })
    }
    let numeroDocAuto = document.getElementById('numeroDocAuto') as HTMLInputElement;
    let campoNumeroDocumento = document.getElementById('$$$');
    if(numeroDocAuto) {
      numeroDocAuto.addEventListener("change", () => {
        if(numeroDocAuto) {
          if(numeroDocAuto.checked === true) {
            if(campoNumeroDocumento) {
              campoNumeroDocumento.classList.remove("campoVacio");
              campoNumeroDocumento.classList.add("campoValido");
            }
          }else{
            if(campoNumeroDocumento) {
              campoNumeroDocumento.classList.remove("campoValido");
              campoNumeroDocumento.classList.add("campoVacio");
            }
          }
        }
      })
    }
  }

  async creaDocumento() {
    console.log('Comienza creaDocumento');
    this.estadoCreacionArchivo = true;
    this.cdr.detectChanges();
    let fecha:Date = new Date()
    let numeroDocumento = fecha.getFullYear().toString()+fecha.getMonth().toString()+fecha.getDate().toString()+fecha.getHours().toString()+fecha.getMinutes().toString()+fecha.getSeconds().toString();
    let parejas: Array<{ clave: string; valor: string }> = [];
    for (let clave of this.claves) {
      let ele = document.getElementById(clave) as HTMLInputElement;
      let val:string
      if(clave === '$$$' && this.numeroDocumento === true) {
        val = numeroDocumento;
      }else {
        val = ele.value;
      }
    let par = { clave: clave, valor: val };
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
    const archivos = Object.keys(zip.files);
    // Procesar cada archivo
    console.log('Comienza a analizar cada archivo');
    for (let i = 0; i < archivos.length; i++) {
      if (archivos[i].endsWith('xml')) {
        const contenido = await zip.file(archivos[i]).async('text');
        // Ahora puedes procesar el contenido XML como desees
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contenido, 'text/xml');
        const serializer = new XMLSerializer();
        const SxmlDoc = serializer.serializeToString(xmlDoc);
        //        console.log("Archivo:\n"+SxmlDoc);
        await this.sustituyeClaves(SxmlDoc, parejas, archivos[i]);
        this.progresoCreacionArchivo = ((i + 1) / archivos.length) * 100;
        this.cdr.detectChanges();
      }
    }
    console.log('Comienza la descarga del documento modificado');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(this.nuevoFile);
    link.download = 'rellenado_' + this.file.name; // Puedes cambiar el nombre según el tipo de archivo
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        let indexEnd = SxmlDoc.indexOf('}}', index);
        if (indexEnd !== -1) {
          let clave = SxmlDoc.substring(index + 2, indexEnd);
          clave = clave.replace(/<.*?>/g, '');
          let valor = '';
          parejas.forEach((par) => {
            if (par.clave === clave) {
              valor = par.valor;
            }
          });
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

  completa() {
    if (this.selected) {
      const seleccionado = parseInt(this.selected);
      const cliente: ClienteDinamico = this.CS.getClienteForId(seleccionado);
      console.log('Cliente obtenido: ' + cliente.toString());
      for (let atributo of cliente.atributos) {
        for (let clave of this.claves) {
          if (clave === atributo.clave) {
            let a = document.getElementById(clave) as HTMLInputElement;
            a.value = atributo.valor;
            a.classList.remove("campoVacio");
            a.classList.add("campoValido");
            a.removeAttribute('placeholder');
          }
        }
      }
    }
  }
}
