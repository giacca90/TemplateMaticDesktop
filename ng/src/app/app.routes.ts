import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AgregarComponent } from './components/agregar/agregar.component';
import { StatusComponent } from './components/status/status.component';
import { PlantillaComponent } from './components/plantilla/plantilla.component';
import { GuiaComponent } from './components/guia/guia.component';


export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'status', component: StatusComponent },
	{ path: 'agregar', component: AgregarComponent },
	{ path: 'plantilla/:id', component: PlantillaComponent },
	{ path: 'guia', component: GuiaComponent },
];