/* eslint-disable @typescript-eslint/no-unused-vars */

import { EventObject, MachineConfig, MachineOptions, State, StateMachine as XStateMachine } from 'xstate';

export abstract class StateMachineExecutor<Context = unknown> {

  private machine: XStateMachine<Context, unknown, EventObject>;
  private config: MachineConfig<Context, unknown, EventObject>;
  private options: Partial<MachineOptions<unknown, EventObject>>;

  with(context: Context): XStateMachine<Context, unknown, EventObject> {
    throw new Error('Method not implemented');
  }

  transition(currentState: string, event: string, context?: Context): State<Context> {
    throw new Error('Method not implemented');
  }
}
