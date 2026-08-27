import {VISFN, CLICKDEEPEST, WS, BASE} from './e-p2-helpers.mjs';
const boxVisFn = `const boxVis = el => { const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
    let n=el,op=1; while(n&&n!==document.documentElement){const cs=getComputedStyle(n); if(cs.display==='none'||cs.visibility==='hidden')return false; op*=parseFloat(cs.opacity||'1'); n=n.parentElement;} return op>0.01; };`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { window.__clip=[];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      const o=navigator.clipboard.writeText.bind(navigator.clipboard);
      navigator.clipboard.writeText = async (t) => { window.__clip.push(String(t)); try { return await o(t); } catch(e) { return; } }; }
    const oe=document.execCommand && document.execCommand.bind(document);
    if (oe) document.execCommand = (...a) => { if(a[0]==='copy'){ const s=window.getSelection&&String(window.getSelection()); if(s) window.__clip.push('exec:'+s); } return oe(...a); };
  })()`);
  await page.locator('main button').filter({hasText:'qa-e-image.png'}).first().hover();
  await page.waitForTimeout(1200);
  await page.getByRole('button',{name:'More actions'}).first().click();
  await page.waitForTimeout(2200);
  out.menu = await page.evaluate(`(() => { ${VISFN} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper],[role=dialog]')].filter(boxVis);
    const p=b[b.length-1];
    return p? {items: interactives(p).map(x=>x.label.slice(0,26)).join(' | ')} : 'no menu'; })()`);
  out.clickCopy = await page.evaluate(`(() => { ${VISFN} ${CLICKDEEPEST} ${boxVisFn}
    const b=[...document.querySelectorAll('[role=menu],[data-radix-popper-content-wrapper],[role=dialog]')].filter(boxVis);
    const p=b[b.length-1]; if(!p) return 'no menu';
    return clickDeepest(p, /copy link/i); })()`);
  await page.waitForTimeout(2800);
  out.clipboard = await page.evaluate(`(() => (window.__clip||[]))()`);
  out.fileIds = await page.evaluate(`(async()=>{ const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own',{credentials:'include'});
    const j=await r.json().catch(()=>({})); const a=j.files||j.data||[]; return a.map(f=>(f.name||f.file_name||'?')+'='+f.id); })()`);
  // does the copied link resolve?
  if (out.clipboard.length) {
    out.linkCheck = await page.evaluate(`(async()=>{ const u=${JSON.stringify('PLACEHOLDER')}; return null; })()`);
  }
  return out;
};
