import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const t0=Date.now(), tl=[];
  while (Date.now()-t0 < Number(process.env.QA_MAX||60000)) {
    const r = await page.evaluate('('+RTC_STATS+')()');
    const st=(r.stats||[])[0]||{};
    const sum=(a,k)=>(a||[]).reduce((x,y)=>x+(y[k]||0),0);
    const tiles = await page.evaluate(()=>
      [...document.querySelectorAll('[data-testid="participant-tile"]')]
        .filter(t=>!/\(you\)/.test(t.innerText))
        .map(t=>[...t.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid'))
              .filter(x=>/mut|mic|audio/i.test(x)).join(','))[0]||'');
    tl.push({t:((Date.now()-t0)/1000).toFixed(0)+'s',
      inB:sum(st.in,'bytes'), energy:+(sum(st.in,'totalAudioEnergy')).toFixed(3), icons:tiles});
    await page.waitForTimeout(5000);
  }
  return {timeline: tl};
};
