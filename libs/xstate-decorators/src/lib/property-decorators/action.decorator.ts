/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { AnyEventObject, ConditionPredicate } from 'xstate';
import { XStateDecorated } from '../abstracts/xstate-decorated';

export const actionMetadataKey = Symbol('action');

export const Action =
  (name: string) =>
  <T extends XStateDecorated<any>>(target: T, propertyKey: string | symbol) => {
    const actions: Record<string, ConditionPredicate<any, AnyEventObject>> = Reflect.getMetadata(actionMetadataKey, target) || {};

    Object.assign(actions, {
      [name]: target[propertyKey],
    });

    Reflect.defineMetadata(actionMetadataKey, actions, target);
  };
