import { StateMachineInterpreter } from './state-machine.interpreter';

interface DoorMachineContext {
  level?: string;
  alert?: boolean; // alert when intrusions happen
}

class DoorMachineInterpreter extends StateMachineInterpreter<DoorMachineContext> {}

describe('StateMachineInterpreter', () => {
  let doorMachineInterpreter: DoorMachineInterpreter;

  beforeEach(() => {
    doorMachineInterpreter = new DoorMachineInterpreter();
  });

  describe('When not using decorators', () => {
    it('should throw errors when calling methods', async () => {
      expect(() => doorMachineInterpreter.with({})).toThrow('Method not implemented');

      await expect(doorMachineInterpreter.send('OPEN')).rejects.toEqual(new Error('Method not implemented'));
    });
  });
});
