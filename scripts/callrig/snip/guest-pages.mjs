import { RTC_STATS } from './lib.mjs';
export default async ({ctx}) => {
  const pages = ctx.pages().filter(p=>p.url().includes('guest/meeting'));
  const out=[];
  for (const p of pages) {
    try {
      const st = await p.evaluate(()=>{
        const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
        const me=[...s.querySelectorAll('*')].filter(e=>e.children.length===0 && /\(you\)/.test(e.textContent)).map(e=>e.textContent.trim().slice(0,30));
        return {url: location.href.slice(-20), me, inCall: !!document.querySelector('[data-testid="call-toolbar"]'),
                text: s.innerText.replace(/\n+/g,' | ').slice(0,180)};
      });
      const rtc = await p.evaluate('('+RTC_STATS+')()');
      out.push({...st, pcs: rtc.pcs, conn: rtc.stats.map(x=>x.conn)});
    } catch(e) { out.push({err:String(e).slice(0,80)}); }
  }
  return out;
};
