/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ActionObject,
  AnyEventObject,
  BaseActionObject,
  MachineConfig,
  MachineOptions,
  StateMachine as XStateMachine,
  StateSchema,
  Typestate,
} from 'xstate';

export abstract class XStateDecorated<
  TContext = any,
  TStateSchema extends StateSchema<TContext> = StateSchema<TContext>,
  TEvent extends AnyEventObject = AnyEventObject,
  TActionObject extends BaseActionObject = ActionObject<TContext, TEvent>,
> {
  protected config: MachineConfig<TContext, TStateSchema, TEvent, TActionObject>;
  protected options: Partial<MachineOptions<any, TEvent>>;

  protected machine: XStateMachine<TContext, TStateSchema, TEvent, Typestate<TContext>, TActionObject>;
}
