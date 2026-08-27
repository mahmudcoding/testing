import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const r = await page.evaluate('('+RTC_STATS+')()');
  const out=[];
  for (const pc of r.stats) for (const o of pc.out) if(o.kind==='video') out.push({w:o.w,h:o.h,fps:o.fps,bytes:o.bytes,framesEnc:o.framesEnc});
  return {outboundVideo: out};
};
