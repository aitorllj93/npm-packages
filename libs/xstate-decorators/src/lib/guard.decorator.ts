/* eslint-disable @typescript-eslint/no-explicit-any */
import "reflect-metadata";
import { AnyEventObject, ConditionPredicate } from "xstate";
import { StateMachineExecutor } from "./state-machine.executor";

export const guardMetadataKey = Symbol("guard");

export const Guard = (name: string) =>
  <T extends StateMachineExecutor<any>>(target: T, propertyKey: string | symbol) => {
    const existingGuardParameters: Record<string, ConditionPredicate<any, AnyEventObject>> = Reflect.getMetadata(guardMetadataKey, target) || {};

    Object.assign(existingGuardParameters, {
      [name]: target[propertyKey]
    });

    Reflect.defineMetadata(guardMetadataKey, existingGuardParameters, target);
  };
