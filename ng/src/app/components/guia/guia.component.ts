import { Component } from '@angular/core';

@Component({
	selector: 'app-guia',
	standalone: true,
	imports: [],
	templateUrl: './guia.component.html',
	styleUrl: './guia.component.css'
})
export class GuiaComponent {
	cambiaEstilo() {
		console.log('Estilo actual: ' + document.body.classList);
		if (document.body.classList.toString() === 'modo-oscuro') {
			document.body.classList.remove('modo-oscuro');
		} else {
			document.body.classList.add('modo-oscuro');
		}
	}
}
