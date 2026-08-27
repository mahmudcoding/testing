import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const reqs=[];
  page.on('response', async r => { const u=r.url();
    if(u.includes('/api/v1/search')){ let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      reqs.push(r.status()+' q='+(decodeURIComponent(u).match(/[?&]q=([^&]*)/)||['','?'])[1].slice(0,12)+' :: '+b.replace(/\s+/g,' ')); }});
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8500);
  const dlg = `(() => { ${VISFN}
     const strict=el=>{const r=el.getBoundingClientRect(); return r.width>=24&&r.height>=10&&vis(el);};
     const d=[...document.querySelectorAll('[role=dialog]')].filter(e=>e.getBoundingClientRect().width>150).pop();
     if(!d) return {none:true};
     const t=(d.innerText||'').replace(/\\s+/g,' '); const i=t.indexOf('Relevance');
     const notes=[...document.querySelectorAll('[role=alert],[role=status],[data-sonner-toast]')].filter(strict)
       .map(n=>(n.innerText||'').replace(/\\s+/g,' ').trim()).filter(Boolean);
     return {tabs:t.slice(i,i+120), notes:notes.slice(0,2),
             mentionsError:/error|wrong|failed|ошиб/i.test(t)}; })()`;
  const run = async (q,label) => {
    await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelectorAll('button')].filter(vis).find(x=>/^Search /.test(x.getAttribute('aria-label')||''));
       if(b) b.click(); })()`);
    await page.waitForTimeout(2600);
    reqs.length=0;
    await page.keyboard.type(q);
    await page.waitForTimeout(4500);
    const r = {label, q, requests:[...reqs].slice(0,2), ...(await page.evaluate(dlg))};
    await page.keyboard.press('Escape'); await page.waitForTimeout(1400);
    return r;
  };
  out.singleEmoji = await run('📎','one emoji');
  out.emojiPlus   = await run('📎.txt','emoji plus text');
  out.filenameRu  = await run('тест-файл','cyrillic filename fragment');
  return out;
};
