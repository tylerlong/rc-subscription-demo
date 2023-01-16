import {SDK} from '@ringcentral/sdk';
import EventEmitter from 'events';
import RingCentral from '@rc-ex/core';
import RcSdkExtension from '@rc-ex/rcsdk';
import WebSocketExtension from '@rc-ex/ws';
import waitFor from 'wait-for-async';

export class Subscription extends EventEmitter {
  subscriptions: Subscriptions;
  events = {
    notification: 'notification',
  };
  eventFilters!: string[];

  constructor(options: {subscriptions: Subscriptions}) {
    super();
    this.subscriptions = options.subscriptions;
  }

  setEventFilters(eventFilters: string[]) {
    this.eventFilters = eventFilters;
    return this;
  }

  async register() {
    await this.subscriptions.init();
    const wsExtension = new WebSocketExtension();
    await this.subscriptions.rc.installExtension(wsExtension);
    wsExtension.subscribe(this.eventFilters, event => {
      this.emit(this.events.notification, event);
    });
  }
}

export class Subscriptions {
  status = 'new'; // new, in-progress, ready
  rc: RingCentral;
  rcSdkExtension: RcSdkExtension;

  constructor(options: {sdk: SDK}) {
    this.rc = new RingCentral();
    this.rcSdkExtension = new RcSdkExtension({rcSdk: options.sdk});
  }

  async init() {
    if (this.status === 'ready') {
      return;
    }
    if (this.status === 'in-progress') {
      await waitFor({
        condition: () => this.status === 'ready',
      });
      return;
    }
    this.status = 'in-progress';
    await this.rc.installExtension(this.rcSdkExtension);
    this.status = 'ready';
  }

  createSubscription(): Subscription {
    return new Subscription({subscriptions: this});
  }
}
