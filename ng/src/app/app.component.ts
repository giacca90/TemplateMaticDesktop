import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AgregarComponent } from './agregar/agregar.component';
import { StatusComponent } from './status/status.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HomeComponent, AgregarComponent, StatusComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'TemplateMatic';
routeParameterValue: any;
}
