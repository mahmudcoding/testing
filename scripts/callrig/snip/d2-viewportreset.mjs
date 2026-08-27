export default async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('https://airion-cargo.store/w/W4QDF1XTURESO01/settings/appearance', { waitUntil:'networkidle' });
  await page.waitForTimeout(2000);
  return await page.evaluate(() => {
    let a=null; try{a=JSON.parse(localStorage.getItem('aloqa.appearance'));}catch{}
    return { viewport:[innerWidth,innerHeight],
             appearance: a && {theme:a.theme,density:a.density,msgLayout:a.msgLayout,sidebarSide:a.sidebarSide,
                               showRoles:a.showRoles,linkPreviews:a.linkPreviews,markdownPreviewPanel:a.markdownPreviewPanel,animations:a.animations} };
  });
};
