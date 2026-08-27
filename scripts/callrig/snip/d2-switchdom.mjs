export default async ({page}) => {
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/notifications',{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect(); return r.width>2&&r.height>2;};
    const desc=e=>({tag:e.tagName.toLowerCase(), role:e.getAttribute('role')||'', type:e.type||'',
      checked:e.getAttribute('aria-checked')||(e.checked!==undefined?String(e.checked):''),
      w:Math.round(e.getBoundingClientRect().width), h:Math.round(e.getBoundingClientRect().height),
      visible:vis(e), cls:(typeof e.className==='string'?e.className:'').slice(0,40)});
    const combined=[...document.querySelectorAll('[role=switch],input[type=checkbox]')];
    const switches=[...document.querySelectorAll('[role=switch]')];
    const out={combinedOrder: combined.map(desc), switchesOnly: switches.map(desc)};
    // for the first switch: what is at its centre, and does it contain an input?
    if (switches[0]) {
      const r=switches[0].getBoundingClientRect();
      const top=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2);
      out.firstSwitch={
        topAtCentre: top?desc(top):null,
        containsInput: switches[0].querySelectorAll('input').length,
        parentHasInput: switches[0].parentElement?switches[0].parentElement.querySelectorAll('input[type=checkbox]').length:0,
        isSameAsTop: top===switches[0]
      };
    }
    return out;
  });
};
