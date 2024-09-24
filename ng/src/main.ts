import {bootstrapApplication, provideProtractorTestingSupport} from '@angular/platform-browser';
import {provideRouter} from '@angular/router';
import {AppComponent} from './app/app.component';
import {routes} from './app/app.routes';

bootstrapApplication(AppComponent, {
	providers: [provideProtractorTestingSupport(), provideRouter(routes)],
}).catch((err) => console.error(err));

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
	document.body.classList.add('modo-oscuro');
	document.documentElement.classList.add('modo-oscuro');
}

// Slider modo oscuro en Angular
const observer = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (mutation.attributeName === 'class') {
			if (document.body.classList.contains('modo-oscuro')) {
				document.documentElement.classList.add('modo-oscuro');
			} else {
				document.documentElement.classList.remove('modo-oscuro');
			}
		}
	});
});

// Comenzar a observar el elemento <body> para cambios en los atributos
observer.observe(document.body, {
	attributes: true, // Observar cambios en los atributos
});
