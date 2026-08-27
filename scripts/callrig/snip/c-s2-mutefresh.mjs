// Simulate a device that has never seen this mute: drop the local copy, reload, read the control.
export default async ({page}) => {
  const out={};
  out.before = await page.evaluate(()=>({
    ls:String(localStorage.getItem('aloqa.channel.mute')).slice(0,120),
    label:(document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]')||{}).ariaLabel}));
  await page.evaluate(()=>localStorage.removeItem('aloqa.channel.mute'));
  await page.reload(); await page.waitForTimeout(4000);
  out.afterClear = await page.evaluate(()=>({
    ls:String(localStorage.getItem('aloqa.channel.mute')).slice(0,120),
    label:(document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]')||{}).ariaLabel,
    pressed:(document.querySelector('button[aria-label="Mute notifications"],button[aria-label="Unmute notifications"]')||{}).ariaPressed}));
  out.notifTotal = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/notifications?limit=1',{credentials:'include'})).json();
    return j.total ?? -1;
  });
  return out;
};
