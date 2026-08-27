import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const st = `(() => { ${VISFN}
  const hdr=[...document.querySelectorAll('button')].filter(b=>vis(b)&&/^(Channels|Direct messages)$/.test((b.textContent||'').trim()))
    .map(b=>(b.textContent||'').trim()+' expanded='+(b.getAttribute('aria-expanded')??b.getAttribute('data-state')??'-'));
  return {headers:hdr,
    channelLinks:[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).map(a=>(a.textContent||'').trim().slice(0,16)),
    dmLinks:[...document.querySelectorAll('a[href*="/d/"]')].filter(vis).length}; })()`;
export default async ({page}) => {
  const out=[];
  const rec = async t => out.push(t+' :: '+JSON.stringify(await page.evaluate(st)));
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await rec('1 fresh');
  await page.getByRole('button',{name:'Channels', exact:true}).first().click();
  await page.waitForTimeout(2200);
  await rec('2 collapsed Channels');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  await rec('3 after reload');
  await page.getByRole('button',{name:'Channels', exact:true}).first().click();
  await page.waitForTimeout(2200);
  await rec('4 expanded again');
  return {trace: out};
};
