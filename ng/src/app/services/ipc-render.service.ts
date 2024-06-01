import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';

@Injectable({
	providedIn: 'root'
})
export class IpcService {
	private _ipc: IpcRenderer | undefined;

	constructor() {
		if (window.require) {
			try {
				this._ipc = window.require('electron').ipcRenderer;
			} catch (e) {
				throw e;
			}
		} else {
			console.warn('Electron\'s IPC was not loaded');
		}
	}

	public on(channel: string, listener: any): void {
		if (!this._ipc) {
			return;
		}
		this._ipc.on(channel, listener);
	}

	public send(channel: string, ...args): void {
		if (!this._ipc) {
			return;
		}
		this._ipc.send(channel, ...args);
	}

	public isElectron():boolean {
		if(!this._ipc) {
			return false;
		}
		return true;
	}

	public clear() {
		if(!this._ipc) {
			return;
		}
		this._ipc.removeAllListeners('busca');
		this._ipc.removeAllListeners('arraybuffer');

		this._ipc.removeAllListeners('openDialog');
		this._ipc.removeAllListeners('archivos-de-carpeta');
	}

	/*private ipc: IpcRenderer;
  constructor() {
    //If window.require is available, it means that electron is running, then ipc will be loaded.
    if (window.require) {
      try {
        this.ipc = window.require("electron").ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn("Electron IPC was not loaded");
    }
  }

  public on(channel: string, listener: any): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.on(channel, listener);
  }
  
  public once(channel: string, listener: any): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.once(channel, listener);
  }

  public send(channel: string, ...args: any[]): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.send(channel, ...args);
  }

  public removeAllListeners(channel: string): void {
    if (!this.ipc) {
      return;
    }
    this.ipc.removeAllListeners(channel);
  } */
}