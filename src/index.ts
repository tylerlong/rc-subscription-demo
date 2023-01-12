import {SDK} from '@ringcentral/sdk';
import {Subscriptions} from '@ringcentral/subscriptions';

const rc = new SDK({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});
const subscriptions = new Subscriptions({
  sdk: rc,
});
const platform = rc.platform();

const main = async () => {
  await platform.login({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD,
  });

  // subscribe
  const subscription = subscriptions.createSubscription();
  subscription.on(subscription.events.notification, evt => {
    console.log(JSON.stringify(evt, null, 2));
  });
  await subscription
    .setEventFilters(['/restapi/v1.0/account/~/extension/~/message-store'])
    .register();

  // trigger events
  const r = await platform.get('/restapi/v1.0/account/~/extension/~');
  const ext = await r.json();
  platform.post('/restapi/v1.0/account/~/extension/~/company-pager', {
    from: {extensionId: ext.id},
    to: [{extensionId: ext.id}],
    text: 'Hello world!',
  });
};

main();
