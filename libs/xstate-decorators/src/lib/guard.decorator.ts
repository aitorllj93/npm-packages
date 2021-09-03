/* eslint-disable @typescript-eslint/ban-types */

import { DecoratorStateMachineExecutor } from './decorator-state-machine.executor';

export const Guard = (name: string) => {
  return function (target: unknown, propertyKey: string | symbol) {
    const decoratorTargetPrototype = target as DecoratorStateMachineExecutor;
    decoratorTargetPrototype.options = decoratorTargetPrototype.options || {};
    decoratorTargetPrototype.options.guards = decoratorTargetPrototype.options.guards || {};
    Object.assign(decoratorTargetPrototype.options.guards, {
      [name]: decoratorTargetPrototype[propertyKey]
    });
  };
};
