/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { AnyEventObject, ConditionPredicate } from 'xstate';
import { XStateDecorated } from '../abstracts/xstate-decorated';

export const guardMetadataKey = Symbol('guard');

export const Guard =
  (name: string) =>
  <T extends XStateDecorated<any>>(target: T, propertyKey: string | symbol) => {
    const guards: Record<string, ConditionPredicate<any, AnyEventObject>> = Reflect.getMetadata(guardMetadataKey, target) || {};

    Object.assign(guards, {
      [name]: target[propertyKey],
    });

    Reflect.defineMetadata(guardMetadataKey, guards, target);
  };
