export default async ({page}) => await page.evaluate(()=>{ window.__wsMark=(window.__wsLog||[]).length; return window.__wsMark; });
