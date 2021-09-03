/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { AnyEventObject, MachineConfig, MachineOptions, State, StateMachine as XStateMachine } from 'xstate';

export abstract class StateMachineExecutor<Context = any> {

  protected machine: XStateMachine<Context, any, AnyEventObject>;
  protected config: MachineConfig<Context, any, AnyEventObject>;
  protected options: Partial<MachineOptions<any, AnyEventObject>>;

  with(context: Context): XStateMachine<Context, any, AnyEventObject> {
    throw new Error('Method not implemented');
  }

  transition(currentState: string, event: string, context?: Context): State<Context> {
    throw new Error('Method not implemented');
  }
}
