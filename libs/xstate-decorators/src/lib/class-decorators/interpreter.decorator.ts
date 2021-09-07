/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import {
  ActionObject,
  AnyEventObject,
  BaseActionObject,
  createMachine,
  Event,
  EventData,
  interpret,
  InterpreterStatus,
  MachineConfig,
  MachineOptions,
  SCXML,
  SingleOrArray,
  State,
  StateSchema,
  Typestate,
} from 'xstate';
import { InterpretParams, StateMachineInterpreter } from '../abstracts/state-machine.interpreter';
import { actionMetadataKey } from '../property-decorators/action.decorator';
import { activityMetadataKey } from '../property-decorators/activity.decorator';
import { guardMetadataKey } from '../property-decorators/guard.decorator';
import { serviceMetadataKey } from '../property-decorators/service.decorator';
import { initializeMachine } from './initialize-machine';

export const Interpreter =
  <
    TContext = any,
    TStateSchema extends StateSchema<TContext> = StateSchema<TContext>,
    TEvent extends AnyEventObject = AnyEventObject,
    TActionObject extends BaseActionObject = ActionObject<TContext, TEvent>,
  >(
    config: MachineConfig<TContext, TStateSchema, TEvent, TActionObject>,
    options: Partial<MachineOptions<any, TEvent>> = {},
  ) =>
  <T extends new (...args: any[]) => StateMachineInterpreter<TContext, TStateSchema, TEvent, TActionObject>>(target: T): T => {
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
        this.machine = createMachine(this.config as any, this.options);
        this.interpreter = interpret(this.machine);
      }

      async send(
        event: SingleOrArray<Event<TEvent>> | SCXML.Event<TEvent>,
        payload?: EventData,
        params?: InterpretParams,
      ): Promise<Array<State<TContext, TEvent, TStateSchema, Typestate<TContext>>>> {
        const useInstance = !params?.context && !params?.state;
        const machine = !useInstance ? this.with(params.context) : this.machine;
        const interpreter = !useInstance ? interpret(machine) : this.interpreter;
        const mustStart = interpreter.status === InterpreterStatus.NotStarted;

        const mustListenToEvents = params?.onTransition?.include || params?.onTransition?.omit || params?.onTransition?.stopListening;

        const mustStop = params && 'stop' in params ? params.stop : true;

        if (!mustListenToEvents) {
          if (mustStart) {
            interpreter.start(useInstance ? interpreter.state : params?.state || this.config.initial);
          }

          const state = interpreter.send(event, payload);

          if (mustStop) {
            interpreter.stop();
          }

          return [state];
        }

        return new Promise<Array<State<TContext, TEvent, TStateSchema, Typestate<TContext>>>>((resolve) => {
          const omit = params?.onTransition?.omit || (() => false);
          const include = params?.onTransition?.include || (() => true);
          const stopListening = params?.onTransition?.stopListening || (() => true);
          const states = [];
          let isFirstEvent = true;

          const onTransition = (state) => {
            if (mustStart && isFirstEvent) {
              isFirstEvent = false;
              return;
            }

            const mustOmit =
              (typeof omit === 'string' && state.value === omit) ||
              (Array.isArray(omit) && omit.includes(state.value.toString())) ||
              (typeof omit === 'function' && omit(state));

            const mustInclude =
              (typeof include === 'string' && state.value === include) ||
              (Array.isArray(include) && include.includes(state.value.toString())) ||
              (typeof include === 'function' && include(state));

            const mustStopListening =
              (typeof stopListening === 'string' && state.value === stopListening) ||
              (Array.isArray(stopListening) && stopListening.includes(state.value.toString())) ||
              (typeof stopListening === 'function' && stopListening(state));

            if (!mustOmit && mustInclude) {
              states.push(state);
            }

            if (mustStopListening) {
              interpreter.off(onTransition);

              if (mustStop) {
                interpreter.stop();
              }

              resolve(states);
            }
          };

          interpreter.onTransition(onTransition);

          if (mustStart) {
            interpreter.start(useInstance ? interpreter.state : params?.state || this.config.initial);
          }

          interpreter.send(event, payload);
        });
      }

      with(context: TContext) {
        return this.machine.withContext(context).withConfig(this.options);
      }
    };
  };
