const read = async (page) => page.evaluate(async () => {
  const out=[];
  for (const pc of (window.__pcs||[])) {
    if (pc.connectionState==='closed') continue;
    pc.getSenders().forEach((s,i)=>{ if(s.track&&s.track.kind==='audio'){ const st=s.track.getSettings();
      out.push({i, trackId:s.track.id.slice(0,8), label:s.track.label, devId:(st.deviceId||'').slice(0,10), state:s.track.readyState, muted:s.track.muted, enabled:s.track.enabled}); } });
  }
  // any <audio>/<video> elements holding local tracks
  return {senders: out, gumCount:(window.__gumCalls||[]).length, lastGum:(window.__gumCalls||[]).slice(-1).map(g=>g.c.slice(0,120))};
});
const openMenu = async (page) => {
  // ensure closed first
  await page.keyboard.press('Escape'); await page.waitForTimeout(400);
  await page.locator('button[aria-label="Select microphone"]').first().click();
  await page.waitForTimeout(1500);
  return await page.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&/^Fake/.test(e.textContent||'')).map(e=>(e.textContent||'').slice(0,30)));
};
const pick = async (page, n) => {
  const items = await openMenu(page);
  const ok = await page.evaluate((name)=>{
    const b=[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length).find(e=>(e.textContent||'').startsWith(name));
    if(!b) return false; b.click(); return true;
  }, n);
  await page.waitForTimeout(5000);
  return {ok, items};
};
export default async ({page}) => {
  const out={};
  out.start = await read(page);
  out.step1 = await pick(page,'Fake Audio Input 1'); out.after1 = await read(page);
  out.step2 = await pick(page,'Fake Audio Input 2'); out.after2 = await read(page);
  out.step3 = await pick(page,'Fake Default Audio Input'); out.after3 = await read(page);
  return out;
};
