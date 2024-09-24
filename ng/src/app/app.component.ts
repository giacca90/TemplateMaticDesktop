import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AgregarComponent } from './components/agregar/agregar.component';
import { StatusComponent } from './components/status/status.component';
import { GuiaComponent } from './components/guia/guia.component';

@Component({
	selector: 'app-root',
	standalone: true,
	//	imports: [CommonModule, RouterModule, HomeComponent, AgregarComponent, StatusComponent, GuiaComponent],
	imports: [CommonModule, RouterModule, HomeComponent, AgregarComponent, StatusComponent, GuiaComponent],

	templateUrl: './app.component.html',
	styleUrl: './app.component.css'
})
export class AppComponent {
	title = 'TemplateMatic';
	routeParameterValue;
}
