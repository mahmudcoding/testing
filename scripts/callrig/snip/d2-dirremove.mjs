// Inspect (and optionally use) the Remove control on a Directories person row.
export default async ({page}) => {
  const who=process.env.QA_WHO;
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/directories?tab=people',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  const out={};
  out.rowControls = await page.evaluate(w=>{
    const nameNode=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0&&(e.textContent||'').trim()===w)[0];
    if(!nameNode) return {err:'name not found'};
    let p=nameNode;
    for(let i=0;i<8&&p;i++,p=p.parentElement){
      const btns=[...p.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.innerText||'').replace(/\s+/g,' ').trim()).filter(Boolean);
      const uniq=[...new Set((p.innerText||'').match(/QA [A-Z]\w+/g)||[])];
      if(btns.length && uniq.length===1 && uniq[0]===w) return {row:(p.innerText||'').replace(/\s+/g,' ').slice(0,60), buttons:btns};
    }
    return {err:'no single-person row with buttons'};
  }, who);
  if (process.env.QA_GO!=='1') return out;
  const reqs=[]; const on=r=>{try{const u=new URL(r.url()); if(r.request().method()!=='GET') reqs.push(`${r.request().method()} ${u.pathname} -> ${r.status()}`);}catch{}};
  page.on('response', on);
  out.clicked = await page.evaluate(w=>{
    const nameNode=[...document.querySelectorAll('main *')].filter(e=>e.children.length===0&&(e.textContent||'').trim()===w)[0];
    let p=nameNode;
    for(let i=0;i<8&&p;i++,p=p.parentElement){
      const b=[...p.querySelectorAll('button')].find(x=>/^Remove/i.test((x.getAttribute('aria-label')||x.innerText||'').trim()));
      const uniq=[...new Set((p.innerText||'').match(/QA [A-Z]\w+/g)||[])];
      if(b && uniq.length===1 && uniq[0]===w){ b.scrollIntoView({block:'center'}); b.click(); return (b.getAttribute('aria-label')||b.innerText).trim(); }
    } return null;
  }, who);
  await page.waitForTimeout(2200);
  out.dialog = await page.evaluate(()=>{const d=document.querySelector('[role=dialog],[role=alertdialog]');
    return d?{txt:(d.innerText||'').replace(/\s+/g,' ').slice(0,220), btns:[...d.querySelectorAll('button')].map(b=>b.innerText.trim()).filter(Boolean)}:null;});
  page.off('response', on);
  out.reqs=reqs;
  return out;
};
