/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { AnyEventObject, ConditionPredicate } from 'xstate';
import { XStateDecorated } from '../abstracts/xstate-decorated';

export const activityMetadataKey = Symbol('activity');

export const Activity =
  (name: string) =>
  <T extends XStateDecorated<any>>(target: T, propertyKey: string | symbol) => {
    const activities: Record<string, ConditionPredicate<any, AnyEventObject>> = Reflect.getMetadata(activityMetadataKey, target) || {};

    Object.assign(activities, {
      [name]: target[propertyKey],
    });

    Reflect.defineMetadata(activityMetadataKey, activities, target);
  };
