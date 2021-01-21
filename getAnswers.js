
const fs = require('fs')
const db = require('monk')('localhost/stripcode');
const answers = db.get('answers');
const puppeteer = require('puppeteer');

const userDataDir = process.argv[2] || 'PrivateChromeSessions';
(async () => {
  const browser = await puppeteer.launch({headless: false, defaultViewport: {width: 1280, height: 720}, userDataDir: userDataDir});
  const page = await browser.newPage();
  await page.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0'})

  while (true) {
    fs.existsSync('stop') && process.exit()
    console.log("---------------------------------------")
    await page.waitForSelector('[class*=text-bblack]')
    await page.waitForSelector('h1[class*=my-8]')

    let repolist = await page.$$eval('[class*=text-bblack]', el => el.map(el => el.textContent))
    let file = await page.$eval('h1[class*=my-8]', el => el.textContent)
    console.log("file :", file)

    await page.click('[class*=text-bblack]')
    await page.waitForSelector('[phx-click="nextQuestion"]', {timeout: 3000})
      .catch(async e => {
        await page.click('[class*=text-bblack]')
        await page.waitForTimeout(3000)
      })
    let rightrepo = await page.$eval('button[class*=bg-green-100] > span', el => el.textContent)
    let content = await page.$eval('[id="main-code-block"]', el => el.textContent)
    console.log(rightrepo, content.length)
    // await answers.update({ file: file }, { $set: { content: content } })
    await answers.insert({file: file, repo: rightrepo, content: content, repolist: repolist})
    await page.click('[phx-click="nextQuestion"]')
    await page.waitForTimeout(500)
  }
})();
