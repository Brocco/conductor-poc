import * as net from 'net';
import { Observable } from "rxjs/Observable";
import { ConductorRequest, ConductorResponse } from './common';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';

type CommandHandlerResponse = Observable<ConductorResponse>
type CommandHandler = (request: ConductorRequest) => CommandHandlerResponse;

class Orchestra {
  private _commands = new Map<string, CommandHandler>();

  static instance: Orchestra;
  static start(): Orchestra {
    console.error('starting...');
    if (!Orchestra.instance) {
      Orchestra.instance = new Orchestra();
      startServer(Orchestra.instance);
    }
    return Orchestra.instance;
  }

  registerCommand(
    name: string,
    handler: CommandHandler): void {
      this._commands.set(name, handler);
  }

  executeCommand(request: ConductorRequest): CommandHandlerResponse {
    const handler = this._commands.get(request.command);
    if (!handler) {
      const response: ConductorResponse = {
        id: request.id,
        error: {msg:`Command ${request.command} is not supported`}
      }
      return Observable.of(response);
    }
    return handler(request);
  }

  getCommands(): string[]{
    return [...this._commands.keys()];
  }
}

function startServer(orchestra: Orchestra) {
  console.error('startServer....');
  const server = net.createServer((socket: net.Socket) => {
    socket.on('data', (data: Buffer) => {
      const request: ConductorRequest = JSON.parse(data.toString('utf-8'));
      console.log('data received', request);
      orchestra.executeCommand(request)
        .map(response => JSON.stringify(response))
        .subscribe(response => socket.write(response));
    });
    socket.on('listening', ()=>{ console.log('server listening')});
    socket.on('connection', ()=>{ console.log('server connection')});
  });

  server.listen(12345, 'localhost', () => {
    const address = server.address();
    console.log('running: ', `${address.address}:${address.port}`)
  });
}

// export a var to promote a single orchestra instance
export var orchestraStart = Orchestra.start;