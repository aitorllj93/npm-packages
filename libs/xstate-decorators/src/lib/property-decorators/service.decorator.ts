/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { AnyEventObject, ConditionPredicate } from 'xstate';
import { XStateDecorated } from '../abstracts/xstate-decorated';

export const serviceMetadataKey = Symbol('service');

export const Service =
  (name: string) =>
  <T extends XStateDecorated<any>>(target: T, propertyKey: string | symbol) => {
    const services: Record<string, ConditionPredicate<any, AnyEventObject>> = Reflect.getMetadata(serviceMetadataKey, target) || {};

    Object.assign(services, {
      [name]: target[propertyKey],
    });

    Reflect.defineMetadata(serviceMetadataKey, services, target);
  };
