import {WS, BASE} from './e-p2-helpers.mjs';
const state = () => {
  const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;};
  const m=document.querySelector('main')||document.body;
  const inp=[...m.querySelectorAll('input')].filter(vis)[0];
  const tabs=[...m.querySelectorAll('button')].filter(vis).filter(e=>/^(People|Channels)$/.test((e.textContent||'').trim()))
    .map(e=>`${e.textContent.trim()}:${e.getAttribute('aria-selected')}`);
  return {q: inp?inp.value:null, tabs, url:location.search,
          text:m.innerText.replace(/\s+/g,' ').slice(0,130)};
};
async function trial(page, query, label){
  await page.goto(`${BASE}/w/${WS}/directories?tab=people`, {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4500);
  if(query){ const i=page.locator('main input').first(); await i.click(); await i.type(query,{delay:50}); await page.waitForTimeout(2500); }
  const before = await page.evaluate(state);
  const tab = page.locator('main button', {hasText:/^Channels$/}).first();
  const box = await tab.boundingBox();
  await tab.click();                       // real Playwright click
  await page.waitForTimeout(2800);
  const after = await page.evaluate(state);
  return {label, query, clickTargetBox: box? {x:Math.round(box.x),y:Math.round(box.y),w:Math.round(box.width)} : null, before, after,
          switched: after.tabs.includes('Channels:true')};
}
export default async ({page}) => ({
  A_emptyQuery: await trial(page,'','no query [control]'),
  B_channelName: await trial(page,'qa-empty','query "qa-empty"'),
  C_shortQuery: await trial(page,'qa','query "qa"'),
});
