export default async ({page}) => {
  const mid='M4OUVY9J31XBSQY';
  await page.goto(`https://airion-cargo.store/w/W4QBF1XTURESO01/c/C4QBGENERAL0001?thread=${mid}`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(6500);
  return await page.evaluate(()=>{
    const eds=[...document.querySelectorAll('div[contenteditable="true"][aria-label="Compose message"]')];
    const panelOpen = eds.length>=2;
    const txt=(document.body.innerText||'').replace(/\s+/g,' ');
    return {panelOpen, composers:eds.length,
            hasReplies:/Replies \(\d+\)/.test(txt),
            repliesLabel:(txt.match(/Replies \(\d+\)/)||[null])[0]};
  });
};
