import {SDK} from '@ringcentral/sdk';
import EventEmitter from 'events';
import RingCentral from '@rc-ex/core';
import RcSdkExtension from '@rc-ex/rcsdk';
import WebSocketExtension from '@rc-ex/ws';

export class Subscription extends EventEmitter {
  sdk: SDK;
  events = {
    notification: 'notification',
  };
  eventFilters!: string[];

  constructor(options: {sdk: SDK}) {
    super();
    this.sdk = options.sdk;
  }

  setEventFilters(eventFilters: string[]) {
    this.eventFilters = eventFilters;
    return this;
  }

  async register() {
    const rc = new RingCentral();
    const rcSdkExtension = new RcSdkExtension({rcSdk: this.sdk});
    await rc.installExtension(rcSdkExtension);
    const wsExtension = new WebSocketExtension();
    await rc.installExtension(wsExtension);
    wsExtension.subscribe(this.eventFilters, event => {
      this.emit(this.events.notification, event);
    });
  }
}

export class Subscriptions {
  sdk: SDK;
  constructor(options: {sdk: SDK}) {
    this.sdk = options.sdk;
  }

  createSubscription(): Subscription {
    return new Subscription({sdk: this.sdk});
  }
}
