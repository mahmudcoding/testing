import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
const LONG='a'.repeat(200)+'.txt';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
const dlg = `(() => { ${VISFN} ${boxVisFn}
  const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
  if(!d) return {closed:true};
  return {text:(d.innerText||'').replace(/\\n+/g,' | ').slice(0,420),
    ctrls: interactives(d).map(x=>x.label.slice(0,26)+(x.disabled?'[D]':'')).join(' | ').slice(0,300)}; })()`;
export default async ({page}) => {
  const out={}; const writes=[];
  page.on('response', async r=>{ const u=r.url(); if(/upload|files/.test(u)&&r.request().method()!=='GET'){
    let b=''; try{b=(await r.text()).slice(0,170);}catch(e){}
    writes.push(r.request().method()+' '+u.replace(/^https:\/\/[^/]+/,'').slice(0,48)+' -> '+r.status()+' '+b); }});
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(2500);
  out.uploadDialog = await page.evaluate(dlg);
  out.fileInputs = await page.locator('input[type=file]').count();
  const files = ['empty.txt','normal.txt',LONG,'тест-файл-📎.txt','fake.png'].map(f=>DIR+'/'+f);
  try { await page.locator('input[type=file]').first().setInputFiles(files, {timeout:15000}); out.setFiles='ok'; }
  catch(e){ out.setFiles='ERR '+String(e).replace(/\s+/g,' ').slice(0,130); }
  await page.waitForTimeout(3500);
  out.queue = await page.evaluate(dlg);
  writes.length=0;
  out.clickUpload = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
    return clickDeepest(d, /^Upload \\d+ files?$|^Upload$/); })()`);
  await page.waitForTimeout(9000);
  out.writes = writes.slice(0,8);
  out.afterUpload = await page.evaluate(dlg);
  out.apiFiles = await page.evaluate(`(async()=>{const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.files||[];
    return a.map(f=>({name:String(f.filename||'').slice(0,44)+(String(f.filename||'').length>44?'…('+String(f.filename).length+'ch)':''), size:f.size, ext:f.extension, mime:f.mime_type})); })()`);
  return out;
};
