import { VIS } from './a-nb-lib.mjs';
export default async ({page}) => await page.evaluate(async ()=>{
  const ws='W4QAF1XTURESO01';
  const r=await fetch(`/api/v1/workspace/${ws}/meetings/active`,{credentials:'include'});
  const t=await r.text();
  const cur=await fetch('/api/v1/meetings/current',{credentials:'include'});
  return {active:{s:r.status,b:t.slice(0,300)}, current:{s:cur.status,b:(await cur.text()).slice(0,200)}};
});
