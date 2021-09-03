
import { StateMachine } from './state-machine.decorator';
import { StateMachineExecutor } from './state-machine.executor';
import { Guard } from './guard.decorator';
import { assign } from 'xstate';

interface DoorMachineContext {
  level?: string;
  alert?: boolean; // alert when intrusions happen
}

class CheckIsAdmin {
  with(context: DoorMachineContext) {
    return context.level === 'admin';
  }
}

const machineConfig = {
  id: 'door',
  initial: 'closed',
  context: {
    level: 'user',
    alert: false,
  },
  states: {
    closed: {
      initial: 'idle',
      states: {
        idle: {},
        error: {},
      },
      on: {
        SET_ADMIN: {
          actions: assign({ level: 'admin' }),
        },
        SET_ALARM: {
          actions: assign({ alert: true }),
        },
        OPEN: [
          // Transitions are tested one at a time.
          // The first valid transition will be taken.
          { target: 'opened', cond: 'isAdmin' },
          { target: '.error', cond: 'shouldAlert' },
          { target: '.idle' },
        ],
      },
    },
    opened: {
      on: {
        CLOSE: { target: 'closed' },
      },
    },
  },
};

@StateMachine<DoorMachineContext>(machineConfig)
class DoorMachineExecutor extends StateMachineExecutor<DoorMachineContext> {

  constructor(
    private checkIsAdmin: CheckIsAdmin
  ) {
    super();
  }

  @Guard('isAdmin')
  isAdmin(context: DoorMachineContext) {
    return this.checkIsAdmin.with(context);
  }

  @Guard('shouldAlert')
  shouldAlert(context: DoorMachineContext) {
    return context.alert === true;
  }

}

@StateMachine<DoorMachineContext>(machineConfig)
class WithoutOptionsdMachineExecutor extends StateMachineExecutor<DoorMachineContext> {

}

describe('GuardDecorator', () => {

  let machine: StateMachineExecutor<DoorMachineContext>;

  describe('When instantiating a machine with guards', () => {

    beforeEach(() => {
      machine = new DoorMachineExecutor(new CheckIsAdmin());
    })

    describe('When using internal context', () => {

      it('should use internal context', () => {
        const result = machine.transition('closed', 'OPEN');

        expect(result.matches('closed.idle')).toBeTruthy();
      });


    });

    describe('When using internal context', () => {

      it('should use externalContext', () => {
        const result = machine.transition('closed', 'OPEN', {
          alert: true,
          level: 'admin'
        });

        expect(result.matches('opened')).toBeTruthy();
      });

    });

  })

  describe('When not defining any option (i.e guards)', () => {

    beforeEach(() => {
      machine = new WithoutOptionsdMachineExecutor();
    })

    it('should throw unable to evaluate due to missing guard', () => {
      expect(() => {
        machine.transition('closed', 'OPEN', {
          alert: true,
          level: 'admin'
        });
      }).toThrow();
    });

  });

})
