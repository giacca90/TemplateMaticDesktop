import { TestBed } from '@angular/core/testing';

import { IpcService } from './ipc-render.service';

describe('IpcRenderService', () => {
	let service: IpcService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(IpcService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
