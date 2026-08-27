export default async ({page}) => page.evaluate(async () => {
  const devs=await navigator.mediaDevices.enumerateDevices();
  const byId=Object.fromEntries(devs.filter(d=>d.kind==='audiooutput').map(d=>[d.deviceId,d.label]));
  return {audios:[...document.querySelectorAll('audio')].map(a=>({
      sinkId:(a.sinkId||'(empty=default)').slice(0,12),
      label: byId[a.sinkId]||(a.sinkId?'(unknown)':'default'), paused:a.paused}))
      .slice(0,4)};
});
