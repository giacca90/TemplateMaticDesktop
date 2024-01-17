import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Plantilla, PlantillaService } from '../../services/plantilla.service';
import { ClienteDinamico, ClientesService} from '../../services/clientes.service';
import { IpcService } from '../../services/ipc-render.service'
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import * as file2html from 'file2html';
import OOXMLReader from 'file2html-ooxml';
import OdtReader from 'file2html-odf';
import JSZip from 'jszip';

file2html.config({
  readers: [OdtReader, OOXMLReader],
});
@Component({
  selector: 'app-plantilla',
  standalone: true,
  imports: [FormsModule, NgSelectModule],
  templateUrl: './plantilla.component.html',
  styleUrl: './plantilla.component.css',
})
export class PlantillaComponent {
  route: ActivatedRoute = inject(ActivatedRoute);
  id: number;
  file: File;
  nombre: string;
  ruta: string;
  claves: string[] = [];
  SxmlDoc: string;
  path: string;
  selected: string;

  constructor(public PS: PlantillaService, public CS: ClientesService, IPC: IpcService, private cdr: ChangeDetectorRef) {
    IPC.clear();
    this.id = this.route.snapshot.queryParams['id'];
    console.log('id: ' + this.id);
    let plantilla:Plantilla = PS.getPlantillaForId(this.id);
    this.file = plantilla.file;
    if(this.file === null) {
      IPC.send("busca", plantilla.address);
      IPC.on("arraybuffer", (_event, arraybuffer:ArrayBuffer) => {
        this.file = new File ([arraybuffer], plantilla.nombre);
        this.nombre = plantilla.nombre;
        console.log('nombre: ' + this.nombre);
        this.ruta = plantilla.address;
        console.log('ruta: ' + this.ruta);

        this.abrirArchivo();
      });
    }
  }

  
  async abrirArchivo() {;
    // Descomprime el archivo .odt
    const zip = await JSZip().loadAsync(this.file);
    // Obtener la lista de archivos
    const archivos = Object.keys(zip.files);
    // Procesar cada archivo
    archivos.forEach(async (nombreArchivo) => {
      if(nombreArchivo.endsWith('xml')) {
        const contenido = await zip.file(nombreArchivo).async('text');
        // Ahora puedes procesar el contenido XML como desees
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contenido, 'text/xml');
        const serializer = new XMLSerializer();
        this.SxmlDoc = serializer.serializeToString(xmlDoc);
        this.buscaClaves(this.SxmlDoc);
      }
    });

    if(this.file.name.endsWith('odt')) {
      this.vistaOdt();
    }
    if(this.file.name.endsWith('docx')) {
      this.vistaDocx();
    }
  }

  async vistaOdt() {
    let vista = null;
    const zip = await JSZip().loadAsync(this.file);
    const reader = new FileReader();
    vista = await zip.file("Thumbnails/thumbnail.png").async('blob');
    reader.readAsDataURL(vista);
    reader.onload = () => {
      let view = document.getElementById('contentContainer');
      // Crea un elemento de imagen y establece su fuente como los datos de la imagen
      const imgElement = document.createElement('img');
      imgElement.src = reader.result as string
      imgElement.alt = "Cargando..."
      // Establece el ancho del elemento img al ancho del div
      imgElement.style.width = '100%';
      // Agrega la imagen al div
      view.innerHTML = '';
      view.appendChild(imgElement);
    };
    this.cdr.detectChanges();
  }

  async vistaDocx() {
    //prueba con file2html
    try {
      // Espera a que se resuelva la Promesa y obtén el contenido del archivo en formato ArrayBuffer
      const content = await this.file.arrayBuffer();

      // Lee el archivo y conviértelo a HTML
      const fileData = await file2html.read({
        fileBuffer: content,
        meta: {
          mimeType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      });

      // Extrae los estilos y el contenido del archivo
      const { styles, content: fileContent } = fileData.getData();

      // Concatena estilos y contenido
      const html = styles + fileContent;

//      console.log('RESULTADO: \n' + html);

      let view = document.getElementById('contentContainer');
      view.innerHTML = '<div id="contenido" style="width: 100%; height: 100%; overflow: hidden;">'+html+'</div>';
    } catch (error) {
      // Maneja cualquier error que pueda ocurrir durante el proceso
      console.error('Error:', error);

      // Imprime información adicional sobre el error específico
      if (error.code === 'file2html.errors.unsupportedFile') {
        console.error('El formato del archivo no es compatible.');
      }
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
          }
          index = indexEnd;
        }
      }
    }
    this.cdr.detectChanges();
    console.log('Se han encontrado ' + this.claves.length + ' claves');
    for (let clave of this.claves) {
      console.log(clave);
    }
  }

  creaDocumento() {
    let parejas: Array<{ clave: string; valor: string }> = [];
    for (let clave of this.claves) {
      let ele = document.getElementById(clave) as HTMLInputElement;
      let val = ele.value;
      let par = { clave: clave, valor: val };
      parejas.push(par);
    }
    console.log('PAREJAS:');
    for (let pareja of parejas) {
      console.log('Clave: ' + pareja.clave + ' Valor: ' + pareja.valor);
    }

    let documento: string = '';
    let index: number = 0;
    let indexTemp: number = 0;
    while (index !== -1) {
      index = this.SxmlDoc.indexOf('{{', index);
      if (index !== -1) {
        let indexEnd = this.SxmlDoc.indexOf('}}', index);
        if (indexEnd !== -1) {
          let clave = this.SxmlDoc.substring(index + 2, indexEnd);
          clave = clave.replace(/<.*?>/g, '');
          let valor = '';
          parejas.forEach((par) => {
            if (par.clave === clave) {
              valor = par.valor;
            }
          });
          documento =
            documento + this.SxmlDoc.substring(indexTemp, index) + valor;

          index = indexEnd;
          indexTemp = indexEnd + 2;
        }
      }
    }
    documento = documento + this.SxmlDoc.substring(indexTemp);
//    console.log('DOCUMENTO: \n\n' + documento);
    this.replaceXmlInCopy(this.file, documento, this.path);
  }

  replaceXmlInCopy(
    originalBlob: File,
    modifiedXml: string,
    outputPath: string
  ) {
    const zip = new JSZip();

    // Lee el contenido del archivo original
    zip.loadAsync(originalBlob).then((originalZip) => {
      // Sustituye el contenido XML modificado
      originalZip.file(outputPath, modifiedXml);

      // Crea el nuevo archivo
      originalZip.generateAsync({ type: 'blob' }).then((newBlob) => {
        // Puedes usar newBlob como prefieras, por ejemplo, guardarlo o descargarlo
        // Aquí un ejemplo de descarga
        const link = document.createElement('a');
        link.href = URL.createObjectURL(newBlob);
        link.download = 'rellenado_' + this.file.name; // Puedes cambiar el nombre según el tipo de archivo
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  }
  
  completa() {
    if(this.selected) {
      const seleccionado = parseInt(this.selected);
      const cliente: ClienteDinamico = this.CS.getClienteForId(seleccionado);
      console.log("Cliente obtenido: "+cliente.toString());
      for(let atributo of cliente.atributos) {
        for(let clave of this.claves) {
          if(clave === atributo.clave) {
            let a = document.getElementById(clave) as HTMLInputElement;
            a.value = atributo.valor;
            a.removeAttribute('placeholder');
          }
        }
      }
    }
  }

}
