export default async ({page}) => {
  await page.keyboard.press('Escape'); await page.waitForTimeout(700);
  const ok = await page.evaluate(()=>{const b=[...document.querySelectorAll('button[aria-label="Meeting settings"]')].find(x=>x.getClientRects().length); if(!b) return false; b.click(); return true;});
  await page.waitForTimeout(2500);
  const d = await page.evaluate(()=>{
    const ds=[...document.querySelectorAll('[role="dialog"]')].filter(e=>e.getClientRects().length);
    const dd=ds[ds.length-1]; if(!dd) return null;
    return {switches:[...dd.querySelectorAll('[role="switch"]')].map(s=>({l:(s.getAttribute('aria-label')||'').slice(0,40), on:s.getAttribute('aria-checked')})),
      name: (dd.querySelector('input[type="text"]')||{}).value,
      header: (document.querySelector('header')||document.body).innerText.replace(/\n+/g,' | ').slice(0,80)};
  });
  const srv = await page.evaluate(async ()=>{
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    if(!cur.meeting) return null;
    const s = await (await fetch(`/api/v1/meeting/${cur.meeting.id}`,{credentials:'include'})).json();
    return {name: s.meeting?s.meeting.name:s.name, reactions: JSON.stringify(s).match(/"reactions_enabled":(true|false)/)?.[1]};
  });
  return {clicked: ok, panel: d, server: srv};
};
