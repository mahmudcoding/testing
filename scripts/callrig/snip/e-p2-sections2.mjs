import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const st = `(() => { ${VISFN}
  const hdr=[...document.querySelectorAll('button')].filter(b=>vis(b)&&/^(Channels|Direct messages)$/.test((b.textContent||'').trim()))
    .map(b=>(b.textContent||'').trim()+'='+(b.getAttribute('aria-expanded')??'-'));
  return hdr.join(' ')+' | links='+[...document.querySelectorAll('a[href*="/c/"]')].filter(vis).length; })()`;
export default async ({page}) => {
  const out=[];
  const rec = async t => out.push(t+' :: '+await page.evaluate(st));
  await page.goto(BASE+'/w/'+WS+'/c/C4QEGENERAL0001', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  await rec('1 fresh');
  await page.getByRole('button',{name:'Channels', exact:true}).first().click(); await page.waitForTimeout(2000);
  await page.getByRole('button',{name:'Direct messages', exact:true}).first().click(); await page.waitForTimeout(2000);
  await rec('2 both collapsed');
  // in-app navigation
  await page.locator('button[aria-label="Calendar"]').first().click(); await page.waitForTimeout(4000);
  await page.locator('button[aria-label="Chat"]').first().click(); await page.waitForTimeout(4500);
  await rec('3 rail round-trip');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  await rec('4 reload #1');
  await page.getByRole('button',{name:'Channels', exact:true}).first().click(); await page.waitForTimeout(2000);
  await rec('5 collapsed again');
  await page.reload({waitUntil:'domcontentloaded'}); await page.waitForTimeout(6500);
  await rec('6 reload #2');
  return {trace: out};
};
