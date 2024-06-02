/// <reference lib="webworker" />
import * as file2html from 'file2html';
import OOXMLReader from 'file2html-ooxml';

file2html.config({
	readers: [OOXMLReader],
});

addEventListener('message', async ({ data }) => {
	const content = await data.arrayBuffer();

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

	postMessage(html);
});