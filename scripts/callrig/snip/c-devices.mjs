export default async ({page}) => {
  return await page.evaluate(async () => {
    const d = await navigator.mediaDevices.enumerateDevices();
    return d.map(x=>({kind:x.kind, id:x.deviceId.slice(0,20), label:x.label, group:(x.groupId||'').slice(0,10)}));
  });
};
