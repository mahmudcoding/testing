import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const dump = `(() => { ${VISFN}
  const m=document.querySelector('main');
  return [...m.querySelectorAll('button')].filter(b=>vis(b)&&/^(Date|Name|Size)$/.test((b.textContent||'').trim()))
    .map(b=>{const cs=getComputedStyle(b);
      return (b.textContent||'').trim()
        +' | aria-pressed='+(b.getAttribute('aria-pressed')??'-')
        +' data-state='+(b.getAttribute('data-state')??'-')
        +' | color='+cs.color+' bg='+cs.backgroundColor+' weight='+cs.fontWeight
        +' | cls='+String(b.className||'').split(' ').filter(c=>/bg-|text-|font-|border|ring/.test(c)).join('.').slice(0,70); }); })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(7000);
  out.defaultSort = await page.evaluate(dump);
  await page.getByRole('button',{name:'Size', exact:true}).first().click();
  await page.waitForTimeout(2500);
  out.afterSize = await page.evaluate(dump);
  await page.getByRole('button',{name:'Name', exact:true}).first().click();
  await page.waitForTimeout(2500);
  out.afterName = await page.evaluate(dump);
  return out;
};
