import { Conductor } from './conductor';
import { ConductorRequest } from "./common";

const port = 12345;

const args = process.argv.slice(2);
const commandName = args[0];

let request: ConductorRequest = {
  command: commandName,
  request: {}
}

const conductor = new Conductor(port);
conductor.send(request)
  .subscribe(
    x => console.log('data', x),
    e => console.log('error', e),
    () => console.log('completed')
  );
