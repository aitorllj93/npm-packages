
import { StateMachineExecutor } from './state-machine.executor';

interface DoorMachineContext {
  level?: string;
  alert?: boolean; // alert when intrusions happen
}


class DoorMachineExecutor extends StateMachineExecutor<DoorMachineContext> {

}

describe('GuardDecorator', () => {

  let doorMachineExecutor: DoorMachineExecutor;

  beforeEach(() => {
    doorMachineExecutor = new DoorMachineExecutor();
  })

  describe('When not using decorators', () => {

    it('should throw errors when calling methods', () => {
      expect(() => {
        doorMachineExecutor.with({})
      }).toThrow('Method not implemented');

      expect(() => {
        doorMachineExecutor.transition('closed', 'OPEN');
      }).toThrow('Method not implemented');
    });


  });

})
