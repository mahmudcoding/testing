import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET'){ let b=''; try{b=(await r.text()).slice(0,160);}catch(e){}
      api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,40)+' | req='+(r.request().postData()||'').slice(0,150)); }});
  await page.goto(BASE+'/w/'+WS+'/settings/profile', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const ins=[...m.querySelectorAll('input')].filter(vis);
    const set=(el,v)=>{ const p=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      p.call(el,v); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); };
    set(ins[1],'QA Engineer'); set(ins[2],'Quality'); })()`);
  await page.waitForTimeout(1500);
  api.length=0;
  out.save = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    const b=[...m.querySelectorAll('button')].filter(vis).find(x=>/^(Save|Save changes|Save profile|Save preferences)$/i.test((x.textContent||'').trim()));
    if(!b) return 'no save: '+[...m.querySelectorAll('button')].filter(vis).map(x=>(x.textContent||'').trim().slice(0,20)).join(' | ');
    if(b.disabled) return 'disabled'; b.click(); return 'clicked "'+(b.textContent||'').trim()+'"'; })()`);
  await page.waitForTimeout(6000);
  out.saveReq = api.slice(0,3);
  // positive control: is it really stored?
  out.me = await page.evaluate(`(async () => { const r=await fetch('/api/v1/auth/me',{credentials:'include'}); const t=await r.text();
     const m=t.match(/"department"\\s*:\\s*"[^"]*"/); const j=t.match(/"jobTitle"\\s*:\\s*"[^"]*"/);
     return {st:r.status, dept:m?m[0]:'(absent)', job:j?j[0]:'(absent)'}; })()`);
  // now the directory, freshly loaded
  await page.goto(BASE+'/w/'+WS+'/directories?tab=people', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(8000);
  out.members = await page.evaluate(`(async () => { const r=await fetch('/api/v1/workspaces/'+'${WS}'+'/members?limit=50',{credentials:'include'});
     const d=await r.json(); const arr=d.members||[]; const me=arr.find(x=>x.name==='QA Alice')||arr[0];
     return { keys:Object.keys(me||{}).join(','), hasUser:me?.user!==undefined,
              dept:me?.department??'(absent)', pos:me?.position??'(absent)' }; })()`);
  out.grouping = await page.evaluate(`(() => { const t=((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ');
     return t.slice(0,200); })()`);
  // second symptom: search the directory by the department that is genuinely set
  const search = async q => { await page.evaluate(`(() => { ${VISFN}
      const i=[...document.querySelectorAll('input')].filter(vis).find(x=>/Search directories/i.test(x.getAttribute('placeholder')||''));
      const p=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set;
      p.call(i,'`+q+`'); i.dispatchEvent(new Event('input',{bubbles:true})); })()`);
    await page.waitForTimeout(2500);
    return await page.evaluate(`(() => { const t=((document.querySelector('main')||document.body).innerText||'').replace(/\\s+/g,' ');
       return t.slice(0,170); })()`); };
  out.searchDept = await search('Quality');
  out.searchJob  = await search('QA Engineer');
  out.searchName = await search('Alice');
  return out;
};
