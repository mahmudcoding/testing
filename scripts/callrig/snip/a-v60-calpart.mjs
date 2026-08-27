const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/calendar',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(4200);
  for(const b of await page.$$('button')){const t=(await b.innerText().catch(()=>''))||''; if(/^New meeting/i.test(t.trim())){await b.click();break;}}
  await page.waitForTimeout(2200);
  const sm = await page.$('[role="dialog"] input[placeholder="Search members"]');
  await sm.click(); await page.keyboard.type('Bob',{delay:80}); await page.waitForTimeout(2200);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/cal-search-bob.png'});
  // enumerate exactly what is clickable in the suggestion area
  out.candidates = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"]')].filter(vis)[0];
    return [...d.querySelectorAll('button,[role="option"],li')].filter(vis).filter(e=>/bob/i.test(e.innerText||''))
      .map(e=>({tag:e.tagName, role:e.getAttribute('role')||'', txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,34),
                rect:[Math.round(e.getBoundingClientRect().x),Math.round(e.getBoundingClientRect().y),Math.round(e.getBoundingClientRect().width)]}));},VS);
  return out;
};
