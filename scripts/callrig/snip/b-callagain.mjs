export default async ({page}) => {
  const WS='W4QBF1XTURESO01';
  const out={};
  // start a short call
  await page.goto(`https://airion-cargo.store/w/${WS}/calls`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>(x.innerText||'').trim()==='Start now'); if(b) b.click(); });
  await page.waitForTimeout(2500);
  const nm = await page.$('[role=dialog] input[type=text]'); if (nm) await nm.fill('QA callagain test');
  await page.evaluate(()=>{ const pick=v=>{const r=[...document.querySelectorAll('[role=dialog] input[type=radio]')].find(x=>x.value===v); if(r) r.click();}; pick('public'); pick('open'); });
  await page.waitForTimeout(500);
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('[role=dialog] button')].find(x=>(x.innerText||'').trim()==='Start call'); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.first = (page.url().match(/\/call\/([A-Za-z0-9]+)/)||[])[1]||null;
  // end it
  await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].find(x=>/End for everyone/i.test((x.innerText||x.getAttribute('aria-label')||''))); if(b) b.click(); });
  await page.waitForTimeout(2000);
  await page.evaluate(()=>{ const b=document.querySelector('[data-testid="call-end-confirm-submit"]')||[...document.querySelectorAll('[role=dialog] button,[role=alertdialog] button')].find(x=>/^End for everyone$/i.test((x.innerText||'').trim())); if(b) b.click(); });
  await page.waitForTimeout(7000);
  out.summaryPresent = await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role=dialog]')].filter(x=>x.getBoundingClientRect().width>0).pop();
    return d? (d.innerText.replace(/\s+/g,' ').match(/Call ended.{0,90}/)||[d.innerText.replace(/\s+/g,' ').slice(0,90)])[0] : null;
  });
  // click Call again
  out.clicked = await page.evaluate(()=>{ const b=[...document.querySelectorAll('button')].filter(x=>x.getBoundingClientRect().width>0).find(x=>/^Call again$/i.test((x.innerText||'').trim())); if(b){b.click(); return true;} return false; });
  await page.waitForTimeout(8000);
  out.after = await page.evaluate(async()=>{
    const j=await (await fetch('/api/v1/meetings/current',{credentials:'include'})).json().catch(()=>null);
    const m=j&&j.meeting;
    return { url:location.href, cur: m?{id:m.id,name:m.name,priv:m.is_private,pw:m.password_protected,appr:m.requires_approval}:null,
      txt: document.body.innerText.replace(/\s+/g,' ').slice(0,220) };
  });
  return out;
};
