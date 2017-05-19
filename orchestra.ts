import * as net from 'net';
import { Observable } from "rxjs/Observable";
import { ConductorRequest, ConductorResponse } from './common';

type CommandHandlerResponse = Observable<ConductorResponse>
type CommandHandler = (request: ConductorRequest) => CommandHandlerResponse;

class Orchestra {
  private _commands = new Map<string, CommandHandler>();
  registerCommand(
    name: string,
    handler: CommandHandler): void {
      this._commands.set(name, handler);
  }

  executeCommand(request: ConductorRequest): CommandHandlerResponse {
    const handler = this._commands.get(request.command);
    return handler(request);
  }

  getCommands(): string[]{
    return [...this._commands.keys()];
  }
}