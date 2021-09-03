/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { AnyEventObject, ConditionPredicate, createMachine, EventObject, MachineConfig, MachineOptions } from 'xstate';
import { StateMachineExecutor } from './state-machine.executor';
import { guardMetadataKey } from './guard.decorator';

export const StateMachine = <Context = unknown>(
  config: MachineConfig<Context, any, EventObject>,
  options: Partial<MachineOptions<any, EventObject>> = {},
) =>
  <T extends new (...args: any[]) => StateMachineExecutor<Context>>(target: T): T => {

    const existingGuardParameters: Record<string, ConditionPredicate<any, AnyEventObject>> = Reflect.getMetadata(guardMetadataKey, target.prototype) || {};

    const decoratedClass = class extends target {
      constructor(...args: any[]) {
        super(...args);

        this.config = config;
        this.options = options;
        this.options.guards = Object.entries({
          ...(this.options.guards || {}),
          ...existingGuardParameters
        }).reduce(
          (result, [name, guard]) =>
            Object.assign(result, {
              [name]: typeof guard === 'function' ? guard.bind(this) : guard
            }),
          {},
        );

        this.machine = createMachine<Context>(this.config as any, this.options);
      }

      with(context: Context) {
        return this.machine.withContext(context).withConfig(this.options);
      }

      transition(currentState: string, event: string, context?: Context) {
        const machine = context ? this.with(context) : this.machine.withConfig(this.options);
        return machine.transition(currentState, event);
      }
    };

    return decoratedClass;

  };
