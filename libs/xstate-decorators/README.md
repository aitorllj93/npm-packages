<h1 align="center">Welcome to @d3v0ps/xstate-decorators 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/@d3v0ps/xstate-decorators" target="_blank">
    <img src="https://img.shields.io/npm/v/@d3v0ps/xstate-decorators" />
  </a>
  <a href="https://github.com/d3v0ps/npm-packages/tree/main/libs/xstate-decorators" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/d3v0ps/npm-packages/blob/main/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> TypeScript decorators for creating [XState](https://xstate.js.org/docs/) machines

### 🏠 [Homepage](https://github.com/d3v0ps/npm-packages/tree/main/libs/xstate-decorators)

---

- [Install](#install)
- [Usage](#usage)
- [Getting Started](#getting-started)

  - [State Machine Executor](#state-machine-executor)
  - [State Machine Interpreter](#state-machine-interpreter)
  - [Guards](#guards)
  - [Actions](#actions)
  - [Activities](#activities)
  - [Services](#services)
  - [Using different instances on each call (different contexts)](#using-different-instances-on-each-call-different-contexts)

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

#### State Machine Executor

The state machine executor allows you to define a basic state machine with a transition method

```ts
import {
  StateMachine,
  StateMachineExecutor,
} from '@d3v0ps/xstate-decorators';

export interface DoorMachineContext {
  level: string;
  alert: boolean; // alert when intrusions happen
}

@StateMachine<DoorMachineContext>({
  id: 'door',
  initial: 'closed',
  context: {
    level: 'user',
    alert: false,
  },
  states: {
    ...
  },
})
export class DoorMachineExecutor extends StateMachineExecutor<DoorMachineContext> {

  openTheDoor() {
    return this.transition('closed', 'OPEN')
  }
}

const doorMachineExecutor = new StateMachineExecutor();

doorMachineExecutor.transition('closed', 'OPEN');
```

#### State Machine Interpreter

The state machine interpreter allows you to define a state machine interpreter with a send method

```ts
import {
  Interpreter,
  StateMachineInterpreter,
} from '@d3v0ps/xstate-decorators';

export interface DoorMachineContext {
  level: string;
  alert: boolean; // alert when intrusions happen
}

@Interpreter<DoorMachineContext>({
  id: 'door',
  initial: 'closed',
  context: {
    level: 'user',
    alert: false,
  },
  states: {
    ...
  },
})
export class DoorMachineInterpreter extends StateMachineInterpreter<DoorMachineContext> {

  openTheDoor() {
    return this.send('OPEN')
  }
}

const doorMachineInterpreter = new DoorMachineInterpreter();

doorMachineInterpreter.send('OPEN');
```

#### Guards

You can define your guards inside the class using the `@Guard` decorator

```ts
import {
  Interpreter,
  Guard,
  StateMachineInterpreter,
} from '@d3v0ps/xstate-decorators';

...

@Interpreter<DoorMachineContext>({
  ...
})
export class DoorMachineInterpreter extends StateMachineInterpreter<DoorMachineContext> {

  @Guard('isAdmin')
  isAdmin(context: DoorMachineContext) {
    return context.level === 'admin';
  }
}

```

#### Actions

You can define your actions inside the class using the `@Action` decorator

```ts
import {
  Action,
  Interpreter,
  StateMachineInterpreter,
} from '@d3v0ps/xstate-decorators';

...

@Interpreter<DoorMachineContext>({
  ...
})
export class DoorMachineInterpreter extends StateMachineInterpreter<DoorMachineContext> {

  @Action('logEvent')
  logEvent(context: DoorMachineContext, event) {
    console.log(event);
  }
}

```

#### Activities

You can define your activities inside the class using the `@Activity` decorator

```ts
import {
  Activity,
  Interpreter,
  StateMachineInterpreter,
} from '@d3v0ps/xstate-decorators';

...

@Interpreter<DoorMachineContext>({
  ...
})
export class DoorMachineInterpreter extends StateMachineInterpreter<DoorMachineContext> {

  @Activity('sayHello')
  sayHello() {
    this.helloService.sayHello();
  }
}

```

#### Services

You can define your services inside the class using the `@Service` decorator

```ts
import {
  Interpreter,
  Service
  StateMachineInterpreter,
} from '@d3v0ps/xstate-decorators';

...

@Interpreter<DoorMachineContext>({
  ...
})
export class DoorMachineInterpreter extends StateMachineInterpreter<DoorMachineContext> {

  @Service('getDoor')
  async getDoor(context: DoorMachineContext): Promise<DoorMachineContext> {
    return this.doorService.getDoor(context);
  }
}

```

#### Using different instances on each call (different contexts)

i.e loading it from db or/and with Dependency Injection

Executor:

```ts
const doorMachineExecutor = new DoorMachineExecutor();
const doorFromDb = {
  state: 'closed',
  context: {
    level: 'user',
    alert: false,
  },
};

doorMachineExecutor.transition(doorFromDb.state, 'OPEN', doorFromDb.context);
```

Interpreter:

```ts
const doorMachineInterpreter = new DoorMachineInterpreter();
const { state, context } = {
  state: 'closed',
  context: {
    level: 'user',
    alert: false,
  },
};

doorMachineInterpreter.send('OPEN', null, {
  state,
  context,
});
```

### Using with Dependency Injection

Note: If you are using a dependency injection provider you probably will want to use different instances on each call [see Using different instances on each call (different contexts)](#using-different-instances-on-each-call-different-contexts)

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
