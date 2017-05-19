import { orchestraStart } from './orchestra';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { ConductorResponse } from './common';

const orchestra = orchestraStart();

const numToTake = 5;

orchestra.registerCommand('build', (req) => {
  const id = req.id;
  return Observable.interval(250)
    .map(idx => ({
      id: id,
      result: (new Date()).toISOString(),
      completed: idx === (numToTake - 1)
    }))
    .do(res => console.log('result', res))
    .take(numToTake);
})
