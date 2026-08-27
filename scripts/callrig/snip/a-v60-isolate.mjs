import { RTC_STATS } from './lib.mjs';
const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const who = await page.evaluate(async()=>{const j=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json().catch(()=>null); return j?.email??j?.data?.email;});
  const a = await page.evaluate(`(${RTC_STATS})()`);
  await page.waitForTimeout(6000);
  const b = await page.evaluate(`(${RTC_STATS})()`);
  const pick = (s)=> (s.stats||[]).flatMap(x=>x.in.filter(i=>i.kind==='audio').map(i=>({bytes:i.bytes,energy:+(i.totalAudioEnergy??0).toFixed(3)})));
  const outb = (s)=> (s.stats||[]).flatMap(x=>x.out.filter(o=>o.kind==='audio').map(o=>o.bytes));
  const A=pick(a), B=pick(b);
  const ui = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    return { panel:(d.innerText||'').replace(/\s+/g,' ').slice(0,220),
             tiles:[...document.body.querySelectorAll('*')].filter(e=>vis(e)&&e.children.length===0&&/QA (Alice|Bob|Carol)/.test(e.innerText||'')).map(e=>e.innerText.trim().slice(0,22)).slice(0,8) };},VS);
  return { who, inboundStreams:B.length, inbound_t0:A, inbound_t6:B,
           rising: B.map((x,i)=> A[i]? (x.bytes>A[i].bytes) : null), outbound:outb(b), ui };
};
