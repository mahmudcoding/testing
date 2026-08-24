export default async ({page}) => {
  const read = async () => await page.evaluate(()=>{
    const s=[]; (window.__pcs||[]).forEach(pc=>{ if(pc.connectionState!=='closed') pc.getSenders().forEach(x=>{ if(x.track) s.push(x.track.label+' | id '+x.track.id.slice(0,8)+' | dev '+((x.track.getSettings().deviceId||'').slice(0,10))); }); });
    return {senders:s, gum:(window.__gumCalls||[]).length};
  });
  const r={before: await read()};
  const click = async (lbl)=>{ const b=await page.$(`button[aria-label="${lbl}"]`); if(b){await b.click(); await page.waitForTimeout(3500); return true;} return false; };
  r.muted = await click('Mute');
  r.afterMute = await read();
  r.unmuted = await click('Unmute');
  await page.waitForTimeout(3000);
  r.afterUnmute = await read();
  return r;
};
