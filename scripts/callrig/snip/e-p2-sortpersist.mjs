import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const st = `(() => { ${VISFN}
  const m=document.querySelector('main');
  const btns=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/^(Date|Name|Size)$/.test((b.textContent||'').trim()))
    .map(b=>(b.textContent||'').trim()+'='+(b.getAttribute('aria-pressed')??b.getAttribute('data-state')??'-'));
  const view=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/view$/i.test(b.getAttribute('aria-label')||'')&&b.getAttribute('aria-pressed')==='true')
    .map(b=>b.getAttribute('aria-label'))[0]||'?';
  const names=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/\\.(txt|png)/.test(b.textContent||''))
    .map(b=>(b.innerText||'').replace(/\\s+/g,' ').trim().slice(0,16));
  const fav=[...m.querySelectorAll('button')].filter(b=>vis(b)&&/^Favorites$/.test((b.textContent||'').trim()))
    .map(b=>'Favorites='+(b.getAttribute('aria-pressed')??'-'))[0]||'-';
  return {sort:btns.join(' '), view, fav, order:names}; })()`;
export default async ({page}) => {
  const out=[];
  const rec = async t => out.push(t+' :: '+JSON.stringify(await page.evaluate(st)));
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  await rec('1 fresh');
  await page.getByRole('button',{name:'Size', exact:true}).first().click(); await page.waitForTimeout(2500);
  await rec('2 sort by Size');
  await page.locator('button[aria-label="Calendar"]').first().click(); await page.waitForTimeout(4500);
  await page.locator('button[aria-label="Files"]').first().click(); await page.waitForTimeout(5000);
  await rec('3 rail round-trip');
  await page.getByRole('button',{name:'Size', exact:true}).first().click(); await page.waitForTimeout(2500);
  await rec('4 sort by Size again');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(7000);
  await rec('5 reload');
  return {trace: out};
};
