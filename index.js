const fs = require('fs');
const { exec } = require("child_process");
const {exit} = require('process');
const db = require('monk')('localhost/stripcode');
const answersdb = db.get('answers 4');
const answersnewdb = db.get('answers 5');
const puppeteer = require('puppeteer');

const userDataDir = process.argv[2] || 'PrivateChromeSessions';
(async () => {
  const browser = await puppeteer.launch({headless: false, defaultViewport: {width: 1280, height: 720}, userDataDir: userDataDir});
  const page = await browser.newPage();
  await page.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0'})

  // check if connected
  // if (page.url().includes("github.com")) {
  //   const shownBrowser = await puppeteer.launch({headless: false, defaultViewport: null, userDataDir: userDataDir});
  //   const shownPage = await shownBrowser.newPage();
  //   await shownPage.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0'});
  //   console.log("you need to connect to your github account")
  //   await shownPage.waitForSelector('.text-oblack', {timeout: 0})
  //   console.log("connected to github")
  //   await shownBrowser.close()
  //   await page.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0'})
  // }

  async function select(repo) {
    let repolistel = await page.$$('[class*=text-bblack]')
    for (repoel of repolistel) {
      if (await repoel.evaluate(el => el.textContent) == repo) {
        await repoel.click()
      }
    }
  }

  if (!await answersdb.findOne({name: "stats"})) {
    answersdb.insert({name: "stats"})
  }

  while (true) {
    fs.existsSync('stop') && process.exit()
    console.log("---------------------------------------")
    await page.waitForSelector('[class*=text-bblack]')
    await page.waitForSelector('h1[class*=my-8]')

    let repolist = await page.$$eval('[class*=text-bblack]', el => el.map(el => el.textContent))
    let file = await page.$eval('h1[class*=my-8]', el => el.textContent)
    let content = await page.$eval('[id="main-code-block"]', el => el.textContent)
    console.log(file)
    console.log(repolist)

    let isbreak = false
    answers = await answersdb.find({file: file, repolist: repolist, content: content})
    if (answers.length > 0) {
      for (answer of answers) {
        for (repo of repolist) {
          if (repo == answer.repo) {
            console.log("repo selected with repolist:", answer.repo)
            await answersdb.update({name: "stats"}, {$inc: {withrepolist: 1}})
            await select(answer.repo)
            isbreak = true
          }
          if (isbreak) { break }
        }
        if (isbreak) { break }
      }
    } else {
      answers = await answersdb.find({file: file, content: content})
      if (answers.length > 0) {
        for (answer of answers) {
          for (repo of repolist) {
            if (answer.repo == repo) {
              console.log("repo selected:", answers[0].repo)
              await answersdb.update({name: "stats"}, {$inc: {withoutrepolist: 1}})
              await select(answers[0].repo)
            }
          }
        }
      }
    }
    // if (answers) {
    //   // await answersnewdb.update({file: file, content: content}, {$set: {repolist: repolist}})
    //   if (repolist.indexOf(answers.repo) != -1) {
    //     for (answer of answers) {
    //       if (repolist.indexOf(answer.repo) != -1) {
    //         console.log(answer.repo, "found question in answersDB without repolist")
    //         await answersdb.update({name: "stats"}, {$inc: {withoutrepolist: 1}})
    //         await select(answer.repo)
    //       }
    //     }
    //   }
    // }
    // }

    await page.waitForSelector('[phx-click="nextQuestion"]', {timeout: 2000})
      .catch(async e => {
        console.log("SELECTIONNED FIRST REPO")
        await select(repolist[0])
        await page.waitForSelector('[phx-click="nextQuestion"]', {timeout: 2000})
          .catch(async e => await page.reload({waitUntil: 'networkidle0'}))
      })
    if (await page.$('button[class*=bg-red-100]:not([class*=bg-green-100])')) {
      console.log("FAILED")
      await page.screenshot({path: 'failed.png', fullPage: true})
      let rightrepo = await page.$eval('button[class*=bg-green-100]:not([class*=bg-red-100]) > span', el => el.textContent)
      console.log(rightrepo)
      await answersnewdb.insert({file: file, content: content, repo: rightrepo, repolist: repolist})
      await answersdb.update({name: "stats"}, {$inc: {failed: 1}})
      exec(`notify-send 'failed ${userDataDir}'`)
    } else {
      await answersdb.update({name: "stats"}, {$inc: {success: 1}})
    }
    await answersdb.update({name: "stats"}, {$inc: {total: 1}})

    await page.click('[phx-click="nextQuestion"]')
      .catch(async e => await page.reload({waitUntil: 'networkidle0'}))

    await page.waitForTimeout(1000)
  }
})();
