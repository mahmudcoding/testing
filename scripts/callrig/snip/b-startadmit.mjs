export default async ({page}) => {
  const out={};
  const d = await page.$('[role=dialog]');
  if (!d) return {noDialog:true};
  const name = await d.$('input[type=text], input:not([type])');
  if (name) { await name.fill('QA admit test'); out.named=true; }
  // choose Public + Wait for admission
  await page.evaluate(() => {
    const pick = v => { const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value===v); if(r){ r.click(); return true;} return false; };
    window.__pick = {pub: pick('public'), admit: pick('manual_admit')};
  });
  await page.waitForTimeout(600);
  out.picked = await page.evaluate(()=>window.__pick);
  out.checkedNow = await page.evaluate(()=>[...document.querySelectorAll('[role=dialog] input[type=radio]')].filter(r=>r.checked).map(r=>r.value));
  const btns = await d.$$('button');
  for (const b of btns) { const t=(await b.innerText().catch(()=>'')).trim(); if (t==='Start call') { await b.click(); break; } }
  await page.waitForTimeout(5000);
  out.url = page.url();
  out.meetingId = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1] || null;
  out.cur = await page.evaluate(async()=>{ const r=await fetch('/api/v1/meetings/current',{credentials:'include'}); const j=await r.json().catch(()=>null); return {s:r.status, id:j&&(j.id||j.meeting?.id), name:j&&(j.name||j.meeting?.name), access:j&&(j.access_type||j.meeting?.access_type), join:j&&(j.join_mode||j.meeting?.join_mode)}; });
  return out;
};
