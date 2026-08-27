const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return (j?.email??'').split('@')[0];});
  const read = () => page.evaluate((vs)=>{const vis=eval(vs);
    return { awayMentions:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/right back|away|brb/i.test(e.innerText||'')).map(e=>e.innerText.replace(/\s+/g,' ').trim().slice(0,44)).slice(0,6),
      toasts:[...document.querySelectorAll('[data-sonner-toast],[role="status"]')].filter(vis).map(t=>(t.innerText||'').replace(/\s+/g,' ').trim().slice(0,50)).filter(Boolean) };},VS);
  const poll=[]; for(let i=0;i<10;i++){ poll.push({t:i*600,...(await read())}); await page.waitForTimeout(600); }
  return { who, first:poll[0], last:poll[poll.length-1], anyAway:poll.find(p=>p.awayMentions.length)?.awayMentions??null, anyToast:poll.find(p=>p.toasts.length)?.toasts??null };
};
