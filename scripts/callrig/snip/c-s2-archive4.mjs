const WS='W4QCF1XTURESO01', CH='C4OWKQTPC7FZ35V';
export default async ({page}) => {
  const out={}; const resp=[];
  page.on('response', r=>{ if(/\/api\/v1\//.test(r.url()) && r.request().method()!=='GET') resp.push({s:r.status(), m:r.request().method(), u:r.url().split('/api/v1')[1].slice(0,50)}); });
  await page.locator('button:visible').filter({hasText:/^Archive channel$/}).last().click({timeout:8000});
  await page.waitForTimeout(4000);
  out.resp = resp;
  out.after = await page.evaluate(async (ch)=>{
    const vis=(el)=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1)return false;
      let n=el,o=1;while(n&&n!==document.documentElement){const s=getComputedStyle(n);o*=parseFloat(s.opacity||'1');
      if(s.display==='none'||s.visibility==='hidden')return false;n=n.parentElement;}return o>0.05;};
    const r=await fetch(`/api/v1/channels/${ch}`,{credentials:'include'});
    const arch=await fetch('/api/v1/users/me/channels/archived',{credentials:'include'});
    let al=null; try{al=await arch.json();}catch(e){}
    return {url:location.href, chan:(await r.text()).slice(0,260),
      archivedList: JSON.stringify(al).slice(0,300),
      sidebar:[...document.querySelectorAll('a')].filter(vis).map(x=>(x.textContent||'').trim()).filter(t=>/QA C2|qa-c2/i.test(t)),
      composer: !!document.querySelector('div[contenteditable="true"][aria-label="Compose message"]'),
      mainText:(document.querySelector('main')?.innerText||'').replace(/\n+/g,' | ').slice(0,150)};
  }, CH);
  return out;
};
