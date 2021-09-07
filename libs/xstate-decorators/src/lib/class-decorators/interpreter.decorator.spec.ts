import { Observable, Subject } from 'rxjs';
import { StateMachineInterpreter } from '../abstracts/state-machine.interpreter';
import { Interpreter } from '../class-decorators/interpreter.decorator';
import { Action } from '../property-decorators/action.decorator';
import { Activity } from '../property-decorators/activity.decorator';
import { Service } from '../property-decorators/service.decorator';

interface DoorMachineContext {
  level?: string;
  alert?: boolean; // alert when intrusions happen
}

class DoorService {
  sayHello = jest.fn();
  logDoorAsyncResult = jest.fn();
  getDoorAsync = jest.fn((context) => Promise.resolve(context));
  getDoorObservable = jest.fn((context) => {
    const obs = new Subject();
    obs.next({
      data: context,
    });
    obs.complete();

    return obs;
  });
}

@Interpreter<DoorMachineContext>({
  id: 'door',
  initial: 'closed',
  context: {
    level: 'user',
    alert: false,
  },
  states: {
    closed: {
      on: {
        OPEN_WITH_PROMISE: {
          target: 'opening_with_promise',
        },
        OPEN_WITH_OBSERVABLE: {
          target: 'opening_with_observable',
        },
      },
    },
    opening_with_promise: {
      invoke: {
        src: 'getDoorPromise',
        onDone: {
          target: 'opened',
          actions: ['logPromiseResult'],
        },
      },
    },
    opening_with_observable: {
      activities: ['sayHello'],
      invoke: {
        src: 'getDoorObservable',
        onDone: 'opened',
      },
    },
    opened: {
      on: {
        CLOSE: { target: 'closed' },
      },
    },
    final: {
      type: 'final',
    },
  },
})
class DoorMachineInterpreter extends StateMachineInterpreter<DoorMachineContext> {
  constructor(public doorService: DoorService) {
    super();
  }

  @Action('logPromiseResult')
  logPromiseResult(context: DoorMachineContext, event) {
    return this.doorService.logDoorAsyncResult(context, event);
  }

  @Activity('sayHello')
  sayHello() {
    this.doorService.sayHello();
    return;
  }

  @Service('getDoorPromise')
  async getDoorPromise(context: DoorMachineContext): Promise<DoorMachineContext> {
    return this.doorService.getDoorAsync(context);
  }

  @Service('getDoorObservable')
  getDoorObservable(context: DoorMachineContext): Observable<DoorMachineContext> {
    return this.doorService.getDoorObservable(context);
  }
}

describe('InterpreterDecorator', () => {
  let machine: DoorMachineInterpreter;

  describe('When instantiating a machine with services', () => {
    beforeEach(() => {
      machine = new DoorMachineInterpreter(new DoorService());
    });

    it('Should create the service', () => {
      expect(machine).toBeInstanceOf(DoorMachineInterpreter);
    });

    describe('When transitioning with invoke on succesful async service', () => {
      it('should turn into opened state', async () => {
        let eventCount = 0;
        const result = await machine.send('OPEN_WITH_PROMISE', null, {
          state: 'closed',
          onTransition: {
            include: ['opened'],
            stopListening: () => {
              eventCount++;
              return eventCount >= 2;
            },
          },
        });

        expect(result).toHaveLength(1);
        expect(result[0].matches('opened')).toBeTruthy();
        expect(machine.doorService.getDoorAsync).toBeCalledTimes(1);
        expect(machine.doorService.logDoorAsyncResult).toBeCalledTimes(1);
      });
    });

    describe('When transitioning with invoke on succesful observable service', () => {
      it('should turn into opened state', async () => {
        let eventCount = 0;
        const result = await machine.send('OPEN_WITH_OBSERVABLE', null, {
          state: 'closed',
          onTransition: {
            include: ['opened'],
            stopListening: () => {
              eventCount++;
              return eventCount >= 2;
            },
          },
        });

        expect(result).toHaveLength(1);
        expect(result[0].matches('opened')).toBeTruthy();
        expect(machine.doorService.sayHello).toBeCalledTimes(1);
        expect(machine.doorService.getDoorObservable).toBeCalledTimes(1);
      });
    });
  });
});
