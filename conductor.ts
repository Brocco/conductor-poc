import * as net from 'net';
import * as path from 'path';
import { Observable } from 'rxjs/Observable';
import { Observer } from "rxjs/Observer";
import { Subject } from "rxjs/Subject";
import { ConductorRequest, ConductorResponse } from './common';

export class Conductor {
  private _lastId = 0;
  private _requestMap = new Map<number, Observer<any>>();
  private _requestQueue = new Set<ConductorRequest>();
  private _connection: net.Socket;
  private _connected = false;
  private _connecting = false;

  constructor(private _port: number, private _host: string = 'localhost') {
    this._connect();
  }

  send<T extends ConductorRequest, U extends ConductorResponse>(request: T): Observable<U> {
    return new Observable<U>((observer: Observer<U>) => {
      if (this._connected) {
        this._send(request, observer);
      } else {
        this._queueRequest(request, observer);
      }
    });
  }

  private _queueRequest<T extends ConductorRequest, U extends ConductorResponse>(request: T, observer: Observer<U>) {
    this._requestQueue.add(request);
  }

  private _processQueuedRequests() {
    this._requestQueue.forEach((request) => {
      const observer = this._requestMap.get(request.id);
      this._send(request, observer);
    });
    this._requestMap.clear();
  }

  private _send<T extends ConductorRequest, U extends ConductorResponse>(request: T, observer: Observer<U>) {
    request.id = this._lastId++;

    this._requestMap.set(request.id, observer);

    if (!this._connected) {
      this._connect();
      this._queueRequest(request, observer);
      return;
    }

    this._connection.write(JSON.stringify(request));
  }

  private _connect () {
    if (this._connected || this._connecting) {
      return;
    }

    this._connection = net.createConnection(this._port, this._host, (socket: net.Socket) => {
      this._connecting = true;
      socket.on('data', (data: Buffer) => {
        this._handleResult(JSON.parse(data.toString('utf-8')));
      });
      socket.on('connect', () => {
        this._connecting = false;
        this._connected = true;
        this._processQueuedRequests();
      });
      socket.on('close', () => {
        this._connected = false;
      });
    })
  }

  private _handleResult(response: ConductorResponse): void {
    const observer = this._requestMap.get(response.id);
    if (response.error) {
      observer.error(response.error);
      this._requestMap.delete(response.id);
    } else {
      if (response.result) {
        observer.next(response.result);
      }
      if (response.completed) {
        observer.complete();
        this._requestMap.delete(response.id);
      }
    }
  }
}
