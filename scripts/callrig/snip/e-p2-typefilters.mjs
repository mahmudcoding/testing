import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl2';
const boxVis = `const bv = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
   let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n);
     if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const ups=[];
  page.on('response', async r=>{ const u=r.url();
    if(/upload|files/.test(u)&&r.request().method()==='POST'){ let b=''; try{b=(await r.text()).slice(0,120);}catch(e){}
      ups.push(r.status()+' '+u.split('/api/v1/')[1]?.slice(0,40)+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  const readFilters = `(() => { ${VISFN}
     const m=document.querySelector('main');
     return [...m.querySelectorAll('button')].filter(vis)
       .map(b=>(b.innerText||'').replace(/\\s+/g,' ').trim())
       .filter(t=>/^(All files|Images|Documents|Videos|Audio|Archives)/.test(t)); })()`;
  out.before = await page.evaluate(readFilters);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(2500);
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/e2arch.zip', DIR+'/e2audio.wav']);
  await page.waitForTimeout(3500);
  const clicked = await page.evaluate(`(() => { ${VISFN} ${boxVis}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(bv)
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     if(!d) return 'no dialog';
     const b=[...d.querySelectorAll('button')].filter(vis).find(x=>/^Upload \\d+ files?$/.test((x.innerText||'').trim()));
     if(!b) return 'no upload button: '+[...d.querySelectorAll('button')].filter(vis).map(x=>(x.innerText||'').trim()).slice(0,6).join('|');
     b.click(); return 'clicked '+(b.innerText||'').trim(); })()`);
  out.uploadClick = clicked;
  await page.waitForTimeout(9000);
  out.uploadResponses = ups.slice(0,3);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(9500);
  out.after = await page.evaluate(readFilters);
  out.api = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const j=await r.json();
     return (j.files||[]).filter(f=>/e2(arch|audio)/.test(f.filename))
       .map(f=>({n:f.filename, ext:f.extension, mime:f.mime_type, size:f.size})); })()`);
  return out;
};
