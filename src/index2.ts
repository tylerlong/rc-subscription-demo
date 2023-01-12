import {SDK} from '@ringcentral/sdk';
import RingCentral from '@rc-ex/core';
import WebSocketExtension from '@rc-ex/ws';
import RcSdkExtension from '@rc-ex/rcsdk';

const sdk = new SDK({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});
const platform = sdk.platform();
const rc = new RingCentral();
const rcsdkExtension = new RcSdkExtension({rcSdk: sdk});
const wsExtension = new WebSocketExtension();

const main = async () => {
  await platform.login({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD,
  });

  // install the extensions
  await rc.installExtension(rcsdkExtension);
  await rc.installExtension(wsExtension);

  // subscribe
  await wsExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/message-store'],
    evt => {
      console.log(JSON.stringify(evt, null, 2));
    }
  );

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
