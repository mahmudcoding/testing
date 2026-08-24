export default async ({page}) => {
  const seen=[];
  for (let i=0;i<24;i++){
    await page.waitForTimeout(500);
    const s = await page.evaluate(()=>{
      const ov=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
      return [...ov.querySelectorAll('*')].filter(e=>e.children.length===0 && /🎉|👏|👍|❤️|😂|😮/.test(e.textContent||'')).map(e=>e.textContent.trim().slice(0,12)).slice(0,5);
    });
    if (s.length) seen.push(`t+${(i+1)*500}ms: ${JSON.stringify(s)}`);
  }
  return {seenOnReceiver: seen};
};
