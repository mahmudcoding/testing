export default async ({page}) => {
  const who=process.env.QA_WHO||'QA Alice';
  const ms=await page.$$('[role="dialog"]');
  const m=ms[ms.length-1]; if(!m) return {err:'no dialog'};
  const rows=await m.$$('[role="option"],li,label,button');
  let picked=null;
  for(const r of rows){ const t=((await r.innerText())||'').replace(/\s+/g,' ').trim();
    if(t.includes(who) && !t.includes('In call')){ await r.click(); picked=t.slice(0,30); break; } }
  await page.waitForTimeout(1500);
  const btns=await m.$$('button');
  let inviteLabel=null, clicked=false;
  for(const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim();
    if(/^Invite \(\d+\)$/.test(l)){ inviteLabel=l; if(!(await b.isDisabled())){ await b.click(); clicked=true; } break; } }
  await page.waitForTimeout(4000);
  return {picked, inviteLabel, clicked,
    after: await page.evaluate(()=>{const d=[...document.querySelectorAll('[role="dialog"]')].pop();
      return d?d.innerText.replace(/\n+/g,' | ').slice(0,140):null;})};
};
