import { StateMachineExecutor } from './state-machine.executor';

/** Internal interface to be used as a reference on the decorators */
export class DecoratorStateMachineExecutor {
  machine: StateMachineExecutor['machine'];
  config: StateMachineExecutor['config'];
  options: StateMachineExecutor['options'];
  with: StateMachineExecutor['with'];
  transition: StateMachineExecutor['transition'];
}
