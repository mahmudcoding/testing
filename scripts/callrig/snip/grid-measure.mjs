import { RTC_STATS } from './lib.mjs';
export default async ({page}) => {
  const api = await page.evaluate(async () => {
    const j = await (await fetch('/api/v1/meeting/V4OTNMFRI8I1W04/participants',{credentials:'include'})).json();
    return (j.participants||[]).map(p=>p.name+'('+p.type+')');
  });
  const ui = await page.evaluate(() => {
    const s=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    const tiles=[...s.querySelectorAll('[data-testid="participant-tile-card-trigger"]')].map(b=>b.getAttribute('aria-label').replace('Participant actions for ',''));
    const vids=[...s.querySelectorAll('video')].length;
    const pager=[...s.querySelectorAll('button')].map(b=>(b.getAttribute('aria-label')||b.textContent||'').trim()).filter(t=>/page|next|prev|\d+\s*\/\s*\d+|more/i.test(t)).slice(0,8);
    return {tilesShown: tiles.length, tiles, videos: vids, pagerControls: pager,
            headerCount: (s.innerText.match(/(\d+)\s*participants?/)||[])[0]||null,
            text: s.innerText.replace(/\n+/g,' | ').slice(0,300)};
  });
  const rtc = await page.evaluate('('+RTC_STATS+')()');
  const inbound = rtc.stats.flatMap(pc=>pc.in.map(x=>x.kind+' '+(x.w||'')+'x'+(x.h||'')));
  return {apiParticipants: api.length, api, ui, inboundCount: inbound.length, inbound};
};
