import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AgregarComponent } from './agregar/agregar.component';
import { StatusComponent } from './status/status.component';
import { PlantillaComponent } from './modelos/plantilla/plantilla.component'


export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'status', component: StatusComponent },
    { path: 'agregar', component: AgregarComponent },
    { path: 'plantilla/:id', component: PlantillaComponent },
];