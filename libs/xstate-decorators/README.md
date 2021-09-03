<h1 align="center">Welcome to @d3v0ps/xstate-decorators 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/d3v0ps/npm-packages/blob/main/packages/xstate-decorators/README.md" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/d3v0ps/npm-packages/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> TypeScript decorators for creating [XState](https://xstate.js.org/docs/) machines

### 🏠 [Homepage](https://github.com/d3v0ps/npm-packages/tree/main/packages/xstate-decorators)

---

- [Install](#install)
- [Usage](#usage)
- [Getting Started](#getting-started)
  - [Using the decorators](#using-the-decorators)
  - [Running transitions](#running-transitions)
  - [Using with outside context](#using-with-outside-context)
- [Using with Dependency Injection](#using-with-dependency-injection)
  - [Angular](#angular)
  - [NestJS](#nestjs)
- [Run tests](#run-tests)
- [Author](#author)
- [🤝 Contributing](#🤝-contributing)
- [Show your support](#show-your-support)
- [📝 License](#📝-license)

## Install

```sh
npm install @d3v0ps/xstate-decorators
```

## Usage

### Getting Started

Machine Example taken from [XState](https://xstate.js.org/docs/guides/guards.html#multiple-guards)

#### Using the decorators

```ts
import {
  StateMachine,
  Guard,
  StateMachineExecutor,
} from '@d3v0ps/xstate-decorators';

export interface DoorMachineContext {
  level: string;
  alert: boolean; // alert when intrusions happen
}

// Machine Example taken from https://xstate.js.org/docs/guides/guards.html#multiple-guards
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
export class DoorMachineExecutor extends StateMachineExecutor<DoorMachineContext> {
  @Guard('isAdmin')
  isAdmin(context: DoorMachineContext) {
    return context.level === 'admin';
  }

  @Guard('shouldAlert')
  shouldAlert(context: DoorMachineContext) {
    return context.alert === true;
  }
}
```

#### Running transitions

```ts
const doorMachineExecutor = new StateMachineExecutor();

doorMachineExecutor.transition('closed', 'OPEN');
```

#### Using with outside context

i.e loading it from db or/and with Dependency Injection

```ts
const doorMachineExecutor = new StateMachineExecutor();
const doorFromDb = {
  state: 'closed',
  context: {
    level: 'user',
    alert: false,
  },
};

doorMachineExecutor.transition(doorFromDb.state, 'OPEN', doorFromDb.context);
// this internally calls to
//    machine.withContext(context)
//           .withConfig(this.options)
//           .transition(currentState, event)
```

### Using with Dependency Injection

Note: If you are using a dependency injection provider you probably will want to run transitions [using outside context](#using-outside-context)

#### Angular

Just import the `Injectable` decorator and add it before your class

```ts
import { StateMachine, Guard, StateMachineExecutor } from '@d3v0ps/xstate-decorators';
import { Injectable } from '@angular/core';

@StateMachine<DoorMachineContext>({
  ...
})
@Injectable({ providedIn: 'root' })
export class DoorMachineExecutor extends StateMachineExecutor<DoorMachineContext> {

  constructor(private checkIsAdmin: CheckIsAdmin) {
    super();
  }

  @Guard('isAdmin')
  isAdmin(contex: DoorMachineContextt) {
    return this.checkIsAdmin.with(context);
  }

}
```

#### NestJS

Just import the `Injectable` decorator and add it before your class

```ts
import { StateMachine, Guard, StateMachineExecutor } from '@d3v0ps/xstate-decorators';
import { Injectable } from '@nestjs/common';

@StateMachine<DoorMachineContext>({
  ...
})
@Injectable()
export class DoorMachineExecutor extends StateMachineExecutor<DoorMachineContext> {

  constructor(private checkIsAdmin: CheckIsAdmin) {
    super();
  }

  @Guard('isAdmin')
  isAdmin(contex: DoorMachineContextt) {
    return this.checkIsAdmin.with(context);
  }

}
```

## Run tests

```sh
npm test
```

## Author

👤 **d3v0ps**

- Website: aitorllamas.com
- Github: [@d3v0ps](https://github.com/d3v0ps)
- LinkedIn: [@aitor-llamas-jimenez-3b760210a](https://linkedin.com/in/aitor-llamas-jimenez-3b760210a)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/d3v0ps/npm-packages/labels/package%3Axstate-decorators). You can also take a look at the [contributing guide](https://github.com/d3v0ps/npm-packages/blob/main/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

[![Sponsors](https://img.shields.io/github/sponsors/d3v0ps)](https://github.com/sponsors/d3v0ps)

## 📝 License

Copyright © 2021 [d3v0ps](https://github.com/d3v0ps).<br />
This project is [MIT](https://github.com/d3v0ps/npm-packages/blob/main/LICENSE) licensed.
