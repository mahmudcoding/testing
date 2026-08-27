export default async ({page}) => {
  const rows=await page.$$('main button');
  const cands=[];
  for(const b of rows){ const t=((await b.innerText())||'').replace(/\s+/g,' ').trim();
    if(/Ended|Outbound|Incoming/.test(t)) cands.push({b,t:t.slice(0,60)}); }
  if(!cands.length) return {err:'no recent rows', sample:(await Promise.all(rows.slice(0,10).map(async b=>((await b.innerText())||'').replace(/\s+/g,' ').trim().slice(0,30))))};
  await cands[0].b.click();
  await page.waitForTimeout(6000);
  return {clicked:cands[0].t, panel: await page.evaluate(()=>{
    const d=[...document.querySelectorAll('[role="dialog"],aside')].pop();
    return d?{text:d.innerText.replace(/\n+/g,' | ').slice(0,320),
      buttons:[...d.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim().slice(0,26)).slice(0,12)}:null;})};
};
