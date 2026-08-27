export default async ({page}) => {
  const out={};
  const rv = page.locator('button', {hasText:/^Review$/}).first();
  if (await rv.count()) { await rv.click(); await page.waitForTimeout(2000); out.reviewClicked=true; }
  out.panel = await page.evaluate(()=>{
    const els=[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length);
    return {btns: els.map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()).filter(l=>/admit|deny|waiting|hold|approve/i.test(l))};
  });
  const ad = page.locator('button', {hasText:/^Admit$/}).first();
  if (await ad.count()) { await ad.click(); out.admitted=true; }
  await page.waitForTimeout(6000);
  out.participants = await page.evaluate(async ()=>{
    const cur = await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json();
    return cur.meeting ? {id:cur.meeting.id, participants:(cur.meeting.participants||[]).map(p=>p.user_id||p.id)} : null;
  });
  return out;
};
