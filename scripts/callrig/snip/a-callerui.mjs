export default async ({page}) => {
  return await page.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width>0 && r.height>0 && s.visibility!=='hidden' && s.display!=='none' && Number(s.opacity)>0.01; };
    const hits = [...document.querySelectorAll('div,section,aside,[role="dialog"],[data-testid]')]
      .filter(e => /calling|ringing|outgoing|cancel call|End call/i.test(e.innerText||'') && vis(e) && e.innerText.length < 300)
      .map(e => ({tid:e.getAttribute('data-testid'), t:e.innerText.replace(/\n+/g,' | ').slice(0,120)}));
    return {
      url: location.href,
      fullBodyLen: document.body.innerText.length,
      hits: hits.slice(0,6),
      hasRingWord: /Calling|Ringing|Outgoing call/i.test(document.body.innerText),
      pip: !![...document.querySelectorAll('[data-testid*="pip" i]')].length,
      allTestids: [...new Set([...document.querySelectorAll('[data-testid]')].map(e=>e.getAttribute('data-testid')))].filter(t=>/call|pip|ring|outgo/i.test(t)).slice(0,20)
    };
  });
};
