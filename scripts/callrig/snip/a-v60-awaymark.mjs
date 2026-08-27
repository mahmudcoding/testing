const VS = `(el)=>{const r=el.getBoundingClientRect();if(r.width<1||r.height<1)return false;let n=el,op=1;while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;}return op>0.05;}`;
export default async ({ page }) => {
  const out={};
  out.urlBefore = await page.evaluate(()=>location.pathname);
  // make sure we're on the in-call view, not a minimized overlay
  await page.goto('https://airion-cargo.store/w/W4QAF1XTURESO01/call/V4OV0O41LELEV7H',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.screenshot({path:'/private/tmp/claude-501/-Users-mahmud-Projects-testing/f92e5e8b-bcc2-441a-8a07-a9ff137b0db6/scratchpad/alice-incall-away.png'});
  // open Participants panel
  await page.locator('button[aria-label="Participants"]').first().click().catch(e=>out.pErr=String(e).slice(0,40));
  await page.waitForTimeout(2800);
  out.state = await page.evaluate((vs)=>{const vis=eval(vs);
    const d=[...document.querySelectorAll('[role="dialog"],aside')].filter(vis).pop()||document.body;
    // every element in the panel that names Bob, with all its attributes
    const bobEls=[...d.querySelectorAll('*')].filter(e=>vis(e)&&/QA Bob/.test(e.innerText||'')&&e.children.length<=4)
      .slice(0,3).map(e=>({ txt:(e.innerText||'').replace(/\s+/g,' ').trim().slice(0,60),
        html:e.outerHTML.replace(/\s+/g,' ').slice(0,340) }));
    return { panelTxt:(d.innerText||'').replace(/\s+/g,' ').slice(0,300), bobEls,
      // any aria-label or title anywhere mentioning away
      awayAttrs:[...document.querySelectorAll('[aria-label],[title]')].filter(vis)
        .map(e=>e.getAttribute('aria-label')||e.getAttribute('title')).filter(a=>/away|right back|brb/i.test(a||'')).slice(0,6),
      tiles:document.querySelectorAll('video').length };},VS);
  return out;
};
