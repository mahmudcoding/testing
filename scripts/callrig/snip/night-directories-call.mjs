export default async ({page}) => {
  const who=process.env.QA_WHO||'QA Admin';
  const net=[];
  page.on('response', async r=>{ if(r.request().method()!=='GET' && (r.url().includes('meeting')||r.url().includes('/dm'))){ let b=''; try{b=(await r.text()).slice(0,260);}catch(e){} net.push(`${r.request().method()} ${r.status()} ${r.url().replace('https://airion-cargo.store','')} :: ${b}`);} });
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6000);
  const rows=await page.evaluate((who)=>{
    const m=document.querySelector('main');
    const cands=[...m.querySelectorAll('div,li,tr')].filter(e=>e.innerText && e.innerText.includes(who) && e.querySelectorAll('button').length);
    if(!cands.length) return {err:'no row for '+who, sample:(m.innerText||'').slice(0,250)};
    const row=cands[cands.length-1];
    row.setAttribute('data-qa-row','1');
    return {rowText: row.innerText.replace(/\n+/g,' | ').slice(0,120),
      buttons:[...row.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26))};
  }, who);
  return {rows, net};
};
