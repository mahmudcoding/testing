export default async ({page}) => {
  return await page.evaluate(() => {
    const all = [...document.querySelectorAll('*')].filter(e=>e.children.length===0 && /participant|waiting|QA Workspace/i.test(e.textContent));
    return {
      lines: all.map(e=>({txt:e.textContent.trim().slice(0,120), tag:e.tagName, tid:e.closest('[data-testid]')?.getAttribute('data-testid')})).slice(0,10),
      apiParticipants: null
    };
  });
};
