/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ActionObject,
  AnyEventObject,
  BaseActionObject,
  Event,
  EventData,
  Interpreter,
  SCXML,
  SingleOrArray,
  State,
  StateMachine as XStateMachine,
  StateSchema,
  Typestate,
} from 'xstate';
import { XStateDecorated } from './xstate-decorated';

export type SkipTransitionEvent = number | 'string' | 'string'[];

export interface InterpretParams<
  TContext = any,
  TStateSchema extends StateSchema<TContext> = StateSchema<TContext>,
  TEvent extends AnyEventObject = AnyEventObject,
> {
  state?: any;
  context?: TContext;
  onTransition?: {
    include?: string | string[] | ((state: State<TContext, TEvent, TStateSchema, Typestate<TContext>>) => boolean);
    omit?: string | string[] | ((state: State<TContext, TEvent, TStateSchema, Typestate<TContext>>) => boolean);
    stopListening?: string | string[] | ((state: State<TContext, TEvent, TStateSchema, Typestate<TContext>>) => boolean);
  };
  stop?: boolean;
}

export abstract class StateMachineInterpreter<
  TContext = any,
  TStateSchema extends StateSchema<TContext> = StateSchema<TContext>,
  TEvent extends AnyEventObject = AnyEventObject,
  TActionObject extends BaseActionObject = ActionObject<TContext, TEvent>,
> extends XStateDecorated<TContext, TStateSchema, TEvent, TActionObject> {
  protected interpreter: Interpreter<TContext, TStateSchema, TEvent, Typestate<TContext>>;

  async send(
    event: SingleOrArray<Event<TEvent>> | SCXML.Event<TEvent>,
    payload?: EventData,
    params?: InterpretParams,
  ): Promise<Array<State<TContext, TEvent, TStateSchema, Typestate<TContext>>>> {
    throw new Error('Method not implemented');
  }

  with(context: TContext): XStateMachine<TContext, any, AnyEventObject> {
    throw new Error('Method not implemented');
  }
}
