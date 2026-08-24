import { RTC_STATS } from './lib.mjs';
export default async ({page, ctx}) => {
  const cdp = await ctx.newCDPSession(page);
  const detail = async () => {
    const s = await page.evaluate('('+RTC_STATS+')()');
    return s.stats.flatMap(pc=>[
      ...pc.out.filter(o=>o.kind==='video').map(o=>({dir:'out', wh:`${o.w}x${o.h}`, fps:o.fps, bytes:o.bytes, enc:o.framesEnc})),
      ...pc.in.filter(o=>o.kind==='video').map(o=>({dir:'in', wh:`${o.w}x${o.h}`, fps:o.fps, bytes:o.bytes, dec:o.framesDec}))
    ]);
  };
  const window = async (label, secs) => {
    const a = await detail(); await page.waitForTimeout(secs*1000); const b = await detail();
    const ui = await page.evaluate(()=>{const e=document.querySelector('[data-testid="call-network-indicator"]'); return {quality: e? e.innerText.replace(/\n+/g,' ').trim():null};});
    return {label, before:a.map(x=>`${x.dir} ${x.wh}@${x.fps}`), after:b.map(x=>`${x.dir} ${x.wh}@${x.fps}`),
      dOutFrames: (b.filter(x=>x.dir==='out').reduce((s,x)=>s+(x.enc||0),0)) - (a.filter(x=>x.dir==='out').reduce((s,x)=>s+(x.enc||0),0)),
      dInFrames: (b.filter(x=>x.dir==='in').reduce((s,x)=>s+(x.dec||0),0)) - (a.filter(x=>x.dir==='in').reduce((s,x)=>s+(x.dec||0),0)),
      ...ui};
  };
  const out=[];
  out.push(await window('baseline 1x', 10));
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 20});
  out.push(await window('cpu 20x', 12));
  await cdp.send('Emulation.setCPUThrottlingRate', {rate: 1});
  out.push(await window('restored 1x', 10));
  return out;
};
