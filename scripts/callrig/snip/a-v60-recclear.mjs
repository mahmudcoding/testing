const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const r=await fetch('/api/v1/auth/me',{credentials:'include'});
    if(r.status!==200) return 'guest'; const j=await r.json().catch(()=>null); return (j?.email||'').split('@')[0];});
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { recAria:[...document.querySelectorAll('[aria-label],[title]')].filter(vis).map(e=>e.getAttribute('aria-label')||e.getAttribute('title')).filter(a=>/record/i.test(a||'')),
      recText:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/record/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,52)).slice(0,5),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)).filter(Boolean) };},VS);
  const poll=[]; for(let i=0;i<14;i++){ poll.push({t:i*1000,...(await read())}); await page.waitForTimeout(1000); }
  const api = await page.evaluate(async()=>{
    const id=location.pathname.includes('/call/')?location.pathname.split('/call/')[1]:'V4OV2MX4P25ZSKK';
    const r=await fetch('/api/v1/meeting/'+id,{credentials:'include'});
    const j=await r.json().catch(()=>null); const m=j?.meeting||j;
    return Object.fromEntries(Object.entries(m||{}).filter(([k])=>/record/i.test(k)));});
  return { who, first:poll[0], last:poll[poll.length-1], apiRecordingFields:api };
};
