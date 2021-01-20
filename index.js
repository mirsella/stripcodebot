this index.js is from the choosebyname branch beacause this one i accidentally deleted it with a git reset --hard, i'm so sad. 

// const db = require('monk')('localhost/stripcode');
// const dbrepo = db.get('repofiles');
// const puppeteer = require('puppeteer');
// const axios  = require('axios');
// require('dotenv').config();
// 
// const userDataDir = process.argv[2] || 'PrivateChromeSessions';
// (async () => {
//   const browser = await puppeteer.launch({headless: true, defaultViewport: {width: 1280, height: 720}, userDataDir: userDataDir});
//   const page = await browser.newPage();
//   await page.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0'})
// 
//   // check if connected
//   if (page.url().includes("github.com")) {
//     const shownBrowser = await puppeteer.launch({headless: false, defaultViewport: null, userDataDir: userDataDir});
//     const shownPage = await shownBrowser.newPage();
//     await shownPage.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0'});
//     console.log("you need to connect to your github account")
//     await page.waitForSelector('.text-oblack', {timeout: 0})
//     console.log("connected to github")
//     await shownBrowser.close()
//     await page.reload({waitUntil: 'networkidle0'})
//   }
// 
//   async function select(repo) {
//     repofound = true
//     let repolistel = await page.$$('[class*=text-bblack]')
//     for (repoel of repolistel) {
//       if (await repoel.evaluate(el => el.textContent) == repo) {
//         await repoel.click()
//       }
//     }
//   }
// 
//   while (true) {
//     console.log("---------------------------------------")
//     await page.waitForSelector('[class*=text-bblack]')
//     await page.waitForSelector('h1[class*=my-8]')
// 
//     let repolist = await page.$$eval('[class*=text-bblack]', el => el.map(el => el.textContent))
//     let file = await page.$eval('h1[class*=my-8]', el => el.textContent)
//     console.log("file :", file)
// 
//     for (repo of repolist) {
//       let repocache = await dbrepo.findOne({repo: repo})
//       if (repocache) { // if repo in db
//         let repofiles = repocache.files
//         if (repofiles.indexOf(file) != -1) {
//           console.log(repo, "from DB")
//           await select(repo)
//           break
//           console.log("after break")
//         }
//       } else {
//         let mainres = await axios.get(`https://api.github.com/repos/${repo}`, {headers: {'Authorization': 'token '+process.env.token}})
//         let res = await axios.get(`https://api.github.com/repos/${repo}/git/trees/${mainres.data.default_branch}?recursive=true`, {headers: {'Authorization': 'token '+process.env.token}})
//         repofiles = res.data.tree.map(file => file.path.replace(/^.*\//, ""))
//         dbrepo.insert({repo: repo, files: repofiles})
//         if (repofiles.indexOf(file) != -1) {
//           console.log("repo :", repo, "from github API")
//           await select(repo)
//           break
//           console.log("after break")
//         }
//       }
// 
//     }
// 
//     await page.waitForSelector('[phx-click="nextQuestion"]', {timeout: 1000})
//     .then(el => el.click())
//     .catch(async e => {
//       console.error(e)
//       select(repolist[0])
//       await page.waitForSelector('[phx-click="nextQuestion"]', {timeout: 2000})
//       .then(el => el.click())
//       .catch(async e => await page.reload({waitUntil: 'networkidle0'}))
//     })
//     await page.waitForTimeout(500)
//   }
// })();
