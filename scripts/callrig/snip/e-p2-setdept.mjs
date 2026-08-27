import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
export default async ({page}) => {
  const out={}; const api=[];
  page.on('response', async r => { const u=r.url(); const m=r.request().method();
    if(u.includes('/api/v1/')&&m!=='GET'){ let b=''; try{b=(await r.text()).slice(0,200);}catch(e){}
      api.push(r.status()+' '+m+' '+u.split('/api/v1/')[1].slice(0,44)+' | req='+(r.request().postData()||'').slice(0,180)); }});
  await page.goto(BASE+'/w/'+WS+'/settings/profile', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.fields = await page.evaluate(`(() => { ${VISFN}
    const m=document.querySelector('main');
    return [...m.querySelectorAll('input,textarea,select')].filter(vis).map((n,i)=>{
      let lab=''; const id=n.id; if(id){const l=document.querySelector('label[for="'+id+'"]'); if(l) lab=(l.textContent||'').trim();}
      return i+' '+n.tagName.toLowerCase()+' name='+(n.name||'-')+' label="'+lab.slice(0,26)+'" ph="'+((n.getAttribute('placeholder')||'').slice(0,26))+'" val="'+String(n.value||'').slice(0,20)+'"'; }); })()`);
  return out;
};
