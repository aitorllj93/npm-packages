/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ActionObject,
  AnyEventObject,
  BaseActionObject,
  State,
  StateMachine as XStateMachine,
  StateSchema,
  StateValue,
  Typestate,
} from 'xstate';
import { XStateDecorated } from './xstate-decorated';

export abstract class StateMachineExecutor<
  TContext = any,
  TStateSchema extends StateSchema<TContext> = StateSchema<TContext>,
  TEvent extends AnyEventObject = AnyEventObject,
  TActionObject extends BaseActionObject = ActionObject<TContext, TEvent>,
> extends XStateDecorated<TContext, TStateSchema, TEvent, TActionObject> {
  transition(
    currentState: StateValue,
    event: TEvent | string,
    context?: TContext,
  ): State<TContext, TEvent, TStateSchema, Typestate<TContext>> {
    throw new Error('Method not implemented');
  }

  with(context: TContext): XStateMachine<TContext, any, AnyEventObject> {
    throw new Error('Method not implemented');
  }
}
