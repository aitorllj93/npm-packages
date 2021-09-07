/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ActionObject,
  AnyEventObject,
  BaseActionObject,
  ConditionPredicate,
  createMachine,
  MachineConfig,
  MachineOptions,
  StateSchema,
} from 'xstate';
import { XStateDecorated } from '../abstracts/xstate-decorated';

const bindEntry = (result: Record<string, ConditionPredicate<any, AnyEventObject>>, [name, fn]: [string, unknown], instance: any) =>
  Object.assign(result, {
    [name]: typeof fn === 'function' ? fn.bind(instance) : fn,
  });

export const initializeMachine = <
  TContext = any,
  TStateSchema extends StateSchema<TContext> = StateSchema<TContext>,
  TEvent extends AnyEventObject = AnyEventObject,
  TActionObject extends BaseActionObject = ActionObject<TContext, TEvent>,
>(
  instance: XStateDecorated<TContext, TStateSchema, TEvent, TActionObject>,
  properties: {
    config: MachineConfig<TContext, TStateSchema, TEvent, TActionObject>;
    options: Partial<MachineOptions<any, TEvent>>;
    actions?;
    activities?;
    guards?: Record<string, ConditionPredicate<any, AnyEventObject>>;
    services?;
  },
) => {
  (instance as any).config = properties.config;
  (instance as any).options = properties.options;

  (instance as any).options.activities = Object.entries({
    ...((instance as any).options.activities || {}),
    ...properties.activities,
  }).reduce((result, activityRecord) => bindEntry(result, activityRecord, instance), {});

  (instance as any).options.actions = Object.entries({
    ...((instance as any).options.actions || {}),
    ...properties.actions,
  }).reduce((result, actionRecord) => bindEntry(result, actionRecord, instance), {});

  (instance as any).options.guards = Object.entries({
    ...((instance as any).options.guards || {}),
    ...properties.guards,
  }).reduce((result, guardRecord) => bindEntry(result, guardRecord, instance), {});

  (instance as any).options.services = Object.entries({
    ...((instance as any).options.services || {}),
    ...properties.services,
  }).reduce((result, serviceRecord) => bindEntry(result, serviceRecord, instance), {});

  (instance as any).machine = createMachine((instance as any).config as any, (instance as any).options);
};
