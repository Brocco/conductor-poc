import * as net from 'net';
import * as path from 'path';

import { Observable } from 'rxjs/Observable';
import { Observer } from "rxjs/Observer";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/empty';

export enum ConnectionStatus {
  connected,
  connecting,
  disconnected
}

export class ConnectionManager {
  private _socket: net.Socket = null;
  private _connected: boolean = false;
  public status: ConnectionStatus;
  private _dataSubject: Subject<Object>;

  constructor(private _port: number, private _host: string = 'localhost') {
    this.status = ConnectionStatus.disconnected;
    this._dataSubject = new Subject<Object>();
  }

  get data(): Observable<object> {
    return this._dataSubject.asObservable();
  }

  get connection () {
    return this._socket;
  }

  connect(): Promise<any> {
    return this._connect();
  }

  send(data: object) {
    this._socket.write(JSON.stringify(data));
  }

  disconnect() {}

  private _connect(): Promise<any> {
    return new Promise ((resolve, reject) => {
      this._socket = net.createConnection(this._port, this._host, () => {
        this.status = ConnectionStatus.connecting;
      });

      this._socket.on('conect', () => {
        this.status = ConnectionStatus.connected;
        resolve();
      });
      this._socket.on('end', () => this.status = ConnectionStatus.disconnected);
      this._socket.on('data', (data: Buffer) => {
        this._dataSubject.next(JSON.parse(data.toString()));
      })
    });
  }
}