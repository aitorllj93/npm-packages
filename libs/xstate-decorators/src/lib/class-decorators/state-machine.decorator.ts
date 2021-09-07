/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { ActionObject, AnyEventObject, BaseActionObject, MachineConfig, MachineOptions, StateSchema, StateValue } from 'xstate';
import { StateMachineExecutor } from '../abstracts/state-machine.executor';
import { actionMetadataKey } from '../property-decorators/action.decorator';
import { activityMetadataKey } from '../property-decorators/activity.decorator';
import { guardMetadataKey } from '../property-decorators/guard.decorator';
import { serviceMetadataKey } from '../property-decorators/service.decorator';
import { initializeMachine } from './initialize-machine';

export const StateMachine =
  <
    TContext = any,
    TStateSchema extends StateSchema<TContext> = StateSchema<TContext>,
    TEvent extends AnyEventObject = AnyEventObject,
    TActionObject extends BaseActionObject = ActionObject<TContext, TEvent>,
  >(
    config: MachineConfig<TContext, TStateSchema, TEvent, TActionObject>,
    options: Partial<MachineOptions<any, TEvent>> = {},
  ) =>
  <T extends new (...args: any[]) => StateMachineExecutor<TContext, TStateSchema, TEvent, TActionObject>>(target: T): T => {
    const actions = Reflect.getMetadata(actionMetadataKey, target.prototype) || {};
    const activities = Reflect.getMetadata(activityMetadataKey, target.prototype) || {};
    const guards = Reflect.getMetadata(guardMetadataKey, target.prototype) || {};
    const services = Reflect.getMetadata(serviceMetadataKey, target.prototype) || {};

    return class extends target {
      constructor(...args: any[]) {
        super(...args);

        initializeMachine(this, {
          config,
          options,
          actions,
          activities,
          guards,
          services,
        });
      }

      transition(currentState: StateValue, event: TEvent, context?: TContext) {
        const machine = context ? this.with(context) : this.machine;
        return machine.transition(currentState, event);
      }

      with(context: TContext) {
        return this.machine.withContext(context).withConfig(this.options);
      }
    };
  };
