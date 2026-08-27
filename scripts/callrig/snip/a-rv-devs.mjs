export default async ({ page }) => {
  return await page.evaluate(async () => {
    let devs = [];
    try { devs = await navigator.mediaDevices.enumerateDevices(); } catch(e) { return {err:String(e)}; }
    return { list: devs.map(d=>({kind:d.kind, id:d.deviceId.slice(0,12), label:d.label, group:(d.groupId||'').slice(0,8)})),
             prefs: localStorage.getItem('aloqa-call-device-prefs') };
  });
};
