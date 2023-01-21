import RingCentral from '@rc-ex/core';
import WebSocketExtension from '@rc-ex/ws';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});
const wsExtension = new WebSocketExtension();

const main = async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });
  // install the WebSocket extension
  await rc.installExtension(wsExtension);

  // subscribe
  await wsExtension.subscribe(
    ['/restapi/v1.0/account/~/extension/~/message-store'],
    evt => {
      console.log(JSON.stringify(evt, null, 2));
    }
  );

  // trigger an event, optional
  const ext = await rc.restapi().account().extension().get();
  await rc
    .restapi()
    .account()
    .extension()
    .companyPager()
    .post({
      from: {extensionId: ext.id?.toString()},
      to: [{extensionId: ext.id?.toString()}],
      text: 'Hello world!',
    });
};

main();
