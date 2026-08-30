export default async ({page}) => {
  const id=process.env.QA_MID, tid=process.env.QA_TID;
  const out={};
  const s = page.locator('[data-testid="call-controls-settings-toggle"]').first();
  if (await s.getAttribute('aria-pressed')!=='true'){ const b=await s.boundingBox(); await page.mouse.click(b.x+b.width/2,b.y+b.height/2); await page.waitForTimeout(2500); }
  const el = page.locator(`[data-testid="${tid}"]`).first();
  out.count = await el.count();
  if(!out.count) return out;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  out.pre = await el.evaluate(e=>{const r=e.getBoundingClientRect();
    const top=document.elementFromPoint(r.x+r.width/2, r.y+r.height/2);
    return {checked:e.getAttribute('aria-checked'), rect:[Math.round(r.x),Math.round(r.y),Math.round(r.width),Math.round(r.height)],
      inViewport: r.y>=0 && r.bottom<=innerHeight && r.x>=0 && r.right<=innerWidth,
      topmostIsSelfOrChild: !!(top && (top===e || e.contains(top)))};});
  if(!out.pre.inViewport || !out.pre.topmostIsSelfOrChild){ out.abort='not clickable: '+JSON.stringify(out.pre); return out; }
  const box = await el.boundingBox();
  await page.mouse.click(box.x+box.width/2, box.y+box.height/2);
  await page.waitForTimeout(4000);
  out.post = await el.getAttribute('aria-checked');
  out.server = await page.evaluate(async(id)=>{const r=await fetch(`/api/v1/meeting/${id}/settings`,{credentials:'include'});
    const j=JSON.parse(await r.text()); return {mic:j.mic_mode,cam:j.camera_mode,share:j.screen_share_mode,chat:j.chat_enabled,react:j.reactions_enabled,mute:j.mute_on_join};}, id);
  return out;
};
