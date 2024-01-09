import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlantillaService } from '../../services/plantilla.service';
import { ClienteDinamico, ClientesService} from '../../services/clientes.service';
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
export class PlantillaComponent implements OnInit {
  route: ActivatedRoute = inject(ActivatedRoute);
  id: number;
  file: File;
  nombre: string;
  ruta: string;
  claves: string[] = [];
  SxmlDoc: string;
  path: string;
  selected: string;

  constructor(public PS: PlantillaService, public CS: ClientesService) {
    
    this.id = this.route.snapshot.queryParams['id'];
    console.log('id: ' + this.id);
    this.file = PS.getPlantillaForId(this.id);
    this.nombre = this.file.name;
    console.log('nombre: ' + this.nombre);
    this.ruta = this.file.webkitRelativePath;
    console.log('ruta: ' + this.ruta);

    if (this.ruta.endsWith('odt')) {
      this.EditOdt(this.file);
    } else if ( this.ruta.endsWith('docx')) {
      this.EditDocx(this.file);
    }
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
  ngOnInit(): void {}

  async EditOdt(file: File) {
    console.log('Desde EditOdt');
    //prueba con XML
    let vista = null;
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      // Descomprime el archivo .odt
      const zip = await JSZip().loadAsync(this.file);

      // Accede al contenido del archivo content.xml
      const contentXml = await zip.file('content.xml').async('text');
      vista = await zip.file("Thumbnails/thumbnail.png").async('blob');
      reader.onload = () => {
        // Crea un elemento de imagen y establece su fuente como los datos de la imagen
        const imgElement = document.createElement('img');
        imgElement.src = reader.result as string
        // Establece el ancho del elemento img al ancho del div
        imgElement.style.width = '100%';
        // Agrega la imagen al div
        view.innerHTML = '';
        view.appendChild(imgElement);
      };
      reader.readAsDataURL(vista);
        
      this.path = 'content.xml';

      // Ahora puedes procesar el contenido XML como desees
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(contentXml, 'text/xml');
      const serializer = new XMLSerializer();
      this.SxmlDoc = serializer.serializeToString(xmlDoc);

//      console.log('Resultado XML: \n' + this.SxmlDoc);

      this.buscaClaves(this.SxmlDoc);
      let view = document.getElementById('contentContainer');
      const imgElement = document.createElement('img');
        imgElement.src = vista;
        imgElement.alt = "Cargando..."
      view.innerHTML = '';
      view.appendChild(imgElement);
    };

    reader.readAsArrayBuffer(file);

/*     //prueba con file2html
    try {
      // Espera a que se resuelva la Promesa y obtén el contenido del archivo en formato ArrayBuffer
      const content = await file.arrayBuffer();

      // Lee el archivo y conviértelo a HTML
      const fileData = await file2html.read({
        fileBuffer: content,
        meta: { mimeType: 'application/vnd.oasis.opendocument.text' },
      });

      // Extrae los estilos y el contenido del archivo
      const { styles, content: fileContent } = fileData.getData();

      // Concatena estilos y contenido
      const html = styles + fileContent;

//      console.log('RESULTADO: \n' + html);
      let view = document.getElementById('contentContainer');
      view.innerHTML = html;
    } catch (error) {
      // Maneja cualquier error que pueda ocurrir durante el proceso
      console.error('Error:', error);

      // Imprime información adicional sobre el error específico
      if (error.code === 'file2html.errors.unsupportedFile') {
        console.error('El formato del archivo no es compatible.');
      }
    }
 */  }

  EditDocx(file: File) {
    console.log('Desde EditDocx');
    //prueba con XML
    const reader = new FileReader();

    reader.onload = async (e: ProgressEvent<FileReader>) => {
      // Descomprime el archivo .odt
      const zip = await JSZip().loadAsync(this.file);
      // Accede al contenido del archivo document.xml
      const documentXml = await zip.file('word/document.xml').async('text');
      this.path = 'word/document.xml';
      // Ahora puedes procesar el contenido XML como desees
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(documentXml, 'text/xml');
      const serializer = new XMLSerializer();
      this.SxmlDoc = serializer.serializeToString(xmlDoc);

//      console.log('Resultado XML: \n' + this.SxmlDoc);

      this.buscaClaves(this.SxmlDoc);
    };
    reader.readAsArrayBuffer(file);

    this.creaVistaDocx(file);
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

  async creaVistaDocx(file:File) {
    //prueba con file2html
    try {
      // Espera a que se resuelva la Promesa y obtén el contenido del archivo en formato ArrayBuffer
      const content = await file.arrayBuffer();

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
}
