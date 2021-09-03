
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

@StateMachine<DoorMachineContext>({
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
})
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

describe('GuardDecorator', () => {

  let doorMachineExecutor: DoorMachineExecutor;

  beforeEach(() => {
    doorMachineExecutor = new DoorMachineExecutor(new CheckIsAdmin());
  })

  describe('When using internal context', () => {

    it('should use internal context', () => {
      const result = doorMachineExecutor.transition('closed', 'OPEN');

      expect(result.matches('closed.idle')).toBeTruthy();
    });


  })

  describe('When using internal context', () => {

    it('should use externalContext', () => {
      const result = doorMachineExecutor.transition('closed', 'OPEN', {
        alert: true,
        level: 'admin'
      });

      expect(result.matches('opened')).toBeTruthy();
    });

  })

})
