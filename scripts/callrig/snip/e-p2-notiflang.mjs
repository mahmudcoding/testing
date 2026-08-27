import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  out.uiLang = await page.evaluate(`(() => ({htmlLang:document.documentElement.lang||'(unset)'}))()`);
  out.payload = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/notifications?limit=10',{credentials:'include'});
     const d=await r.json();
     return (d.notifications||[]).slice(0,6).map(n=>({
       title_key:n.title_key, title:n.title, body:(n.body||'').slice(0,70),
       category:n.category, event:n.event_type })); })()`);
  await page.locator('button[aria-label^="Уведомления"], button[aria-label^="Notifications"]').first().click();
  await page.waitForTimeout(3500);
  out.rendered = await page.evaluate(`(() => { ${VISFN}
     const c=[...document.querySelectorAll('[role=dialog],[data-state=open],aside')]
       .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>150;});
     const d=c.pop(); if(!d) return {none:true};
     const rows=[...d.querySelectorAll('button')].filter(vis)
       .map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\\s+/g,' ').trim())
       .filter(t=>t.length>12);
     return rows.slice(0,6); })()`);
  return out;
};
