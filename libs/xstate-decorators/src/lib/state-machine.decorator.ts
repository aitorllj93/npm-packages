/* eslint-disable @typescript-eslint/no-explicit-any */
import { createMachine, EventObject, MachineConfig, MachineOptions } from 'xstate';
import { DecoratorStateMachineExecutor } from './decorator-state-machine.executor';
import { StateMachineExecutor } from './state-machine.executor';

export const StateMachine = <Context = unknown>(
  config: MachineConfig<Context, any, EventObject>,
  options?: Partial<MachineOptions<any, EventObject>>,
) => {
  return function (target: { new(...args: any[]): StateMachineExecutor<Context>;[key: string]: any }) {
    // save a reference to the original constructor
    const original = target;

    const prototype = target.prototype as DecoratorStateMachineExecutor;

    // Apply class methods
    prototype.with = function (context: Context) {
      return this.machine.withContext(context).withConfig(this.options);
    }

    prototype.transition = function (currentState: string, event: string, context?: Context) {
      const machine = context ? this.with(context) : this.machine.withConfig(this.options);
      return machine.transition(currentState, event);
    }

    const result = function (...args: any) {
      const executor = new target(...args);

      // Write private values
      (executor as any).config = Object.assign(prototype.config || {}, config);
      (executor as any).options = Object.assign(prototype.options || {}, options);

      // Bind instance
      (executor as any).options.guards = Object.entries(((executor as any).options.guards || {}) as [string, any]).reduce(
        (result, [name, fn]) => Object.assign(result, {
          [name]: fn.bind(executor)
        }),
        {}
      );

      (executor as any).machine = createMachine((executor as any).config, (executor as any).options);

      return executor;
    };

    // copy prototype so intanceof operator still works
    result.prototype = original.prototype;

    return result as any;
  };
};
