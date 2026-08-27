export default async ({page}) => {
  const title=process.env.QA_TITLE||'QA Sched Private';
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && (r.url().includes('calendar')||r.url().includes('meeting'))){ let b=''; try{b=(await r.text()).slice(0,320);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  const ms=await page.$$('[role="dialog"]');
  const m=ms[ms.length-1];
  // title
  const t=await m.$('input[placeholder="Add title"]');
  await t.fill(title);
  // set start time to ~3 minutes from now
  const picked=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')]; const m=ms[ms.length-1];
    // choose Private
    const labels=[...m.querySelectorAll('label')];
    let priv=null;
    for (const l of labels){ if(/^Private/.test(l.innerText.trim())){ const i=l.querySelector('input'); if(i){ i.click(); priv=l.innerText.replace(/\n+/g,' ').slice(0,40);} else { l.click(); priv='label'; } break; } }
    return {priv};
  });
  await page.waitForTimeout(800);
  // submit
  const btns=await m.$$('button');
  let submitted=null;
  for (const b of btns){ const l=((await b.getAttribute('aria-label'))||(await b.innerText())||'').trim(); if(/^(Schedule|Create|Save)/.test(l)){ if(!(await b.isDisabled())){ await b.click(); submitted=l; } else submitted='DISABLED:'+l; break; } }
  await page.waitForTimeout(6000);
  const after=await page.evaluate(()=>{
    const ms=[...document.querySelectorAll('[role="dialog"]')];
    const m=ms[ms.length-1];
    return {dialogStillOpen: !!m && /Schedule meeting/.test(m.innerText||''), toasts:[...document.querySelectorAll('[role="status"],[role="alert"]')].map(e=>e.innerText.replace(/\n+/g,' ').slice(0,120)).filter(Boolean)};
  });
  return {title, picked, submitted, net, after};
};
