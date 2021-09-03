/* eslint-disable @typescript-eslint/ban-types */

import { DecoratorStateMachineExecutor } from './decorator-state-machine.executor';
import { StateMachineExecutor } from './state-machine.executor';

export const Guard = (name: string) => {
  return function (target: StateMachineExecutor, propertyKey: string | symbol) {
    const decoratorTargetPrototype = target as unknown as DecoratorStateMachineExecutor;
    decoratorTargetPrototype.options = decoratorTargetPrototype.options || {};
    decoratorTargetPrototype.options.guards = decoratorTargetPrototype.options.guards || {};
    Object.assign(decoratorTargetPrototype.options.guards, {
      [name]: decoratorTargetPrototype[propertyKey]
    });
  };
};
