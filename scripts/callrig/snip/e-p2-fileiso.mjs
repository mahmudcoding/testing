import {VISFN, CLICKDEEPEST, BASE} from './e-p2-helpers.mjs';
const WS1='W4QEF1XTURESO01', WS2='W4OWJSPNXQJYZ5R';
const DIR='/private/tmp/claude-501/-Users-mahmud-Projects-testing/e413bd47-3211-4b38-a986-f622cf2d708c/scratchpad/upl';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<120||r.height<80) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={}; const ups=[];
  page.on('response', async r => { if(/upload/.test(r.url())&&r.request().method()==='POST'){
    let b=''; try{b=(await r.text()).slice(0,140);}catch(e){} ups.push(r.status()+' '+b.replace(/\s+/g,' ')); }});
  // upload into workspace 2
  await page.goto(BASE+'/w/'+WS2+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.getByRole('button',{name:'Upload'}).first().click();
  await page.waitForTimeout(2600);
  await page.locator('input[type=file]').first().setInputFiles([DIR+'/ws2-only.txt']);
  await page.waitForTimeout(3200);
  await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
     const d=[...document.querySelectorAll('[role=dialog]')].filter(boxVis).pop();
     clickDeepest(d, /^Upload \\d+ files?$/); })()`);
  await page.waitForTimeout(8000);
  out.upload = ups[0]||'(none)';
  await page.keyboard.press('Escape'); await page.waitForTimeout(1500);
  const filesIn = async (ws,label) => {
    await page.goto(BASE+'/w/'+ws+'/files', {waitUntil:'domcontentloaded'});
    await page.waitForTimeout(9000);
    const ui = await page.evaluate(`(() => { ${VISFN}
       const m=document.querySelector('main'); const t=(m.innerText||'').replace(/\\s+/g,' ');
       return {hasWs2File:/ws2-only/.test(t), summary:(t.match(/\\d+ files? · [^·]+ · [^ ]+/)||['(none)'])[0], head:t.slice(0,150)}; })()`);
    const api = await page.evaluate(`(async () => {
       const r=await fetch('/api/v1/users/me/files?workspace_id='+'`+ws+`'+'&scope=own&limit=100',{credentials:'include'});
       const t=await r.text(); let d=null; try{d=JSON.parse(t);}catch(e){return {raw:t.slice(0,100)};}
       const a=d.files||d.data||[];
       return {n:a.length, names:a.map(f=>f.filename||f.name).slice(0,12)}; })()`);
    return {label, ui, api};
  };
  out.ws2 = await filesIn(WS2,'workspace 2 — owns the file (positive control)');
  out.ws1 = await filesIn(WS1,'workspace 1 — must not see it');
  return out;
};
