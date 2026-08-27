import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const s = await page.evaluate('('+RTC_STATS+')()');
  const sum = {pcs:s.pcs, gum:s.gum, gdm:s.gdm, conns:[]};
  for (const p of s.stats) {
    sum.conns.push({conn:p.conn, ice:p.ice,
      out: p.out.map(o=>`${o.kind} b=${o.bytes} fenc=${o.framesEnc??'-'}`),
      in: p.in.map(i=>`${i.kind} b=${i.bytes} fdec=${i.framesDec??'-'} lvl=${i.audioLevel!==undefined?Number(i.audioLevel).toFixed(3):'-'}`)});
  }
  return sum;
}
