import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => {
  const t = page.locator('[data-testid="call-controls-chat-toggle"]').first();
  if (await t.count() && (await t.getAttribute('aria-pressed'))!=='true'){ await t.click(); await page.waitForTimeout(2000); }
  const box = await page.evaluate((v)=>{ const vis=eval(v);
    const p=document.querySelector('[data-testid="call-side-panel-slot"]');
    const e=[...p.querySelectorAll('textarea,[contenteditable="true"]')].filter(vis)[0];
    return e?{tag:e.tagName.toLowerCase(), maxLength:e.maxLength, attrs:[...e.attributes].map(a=>a.name+'='+String(a.value).slice(0,24))}:null; }, VIS);
  const api = await page.evaluate(async ()=>{
    const id=location.pathname.match(/\/call\/([A-Z0-9]+)/)[1];
    const r=await fetch(`/api/v1/meeting/${id}/messages?limit=3`,{credentials:'include'});
    if(!r.ok) return {s:r.status, b:(await r.text()).slice(0,120)};
    const j=await r.json(); const arr=j.messages||j.data||j.items||[];
    return {s:r.status, last:(Array.isArray(arr)?arr:[]).slice(-3).map(m=>({len:(m.body||m.text||m.content||'').length,
      head:(m.body||m.text||m.content||'').slice(0,30), tail:(m.body||m.text||m.content||'').slice(-25)}))};
  });
  return {composer: box, api};
};
