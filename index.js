const db = require('monk')('localhost/stripcode');
const dbrepo = db.get('repofiles');
const puppeteer = require('puppeteer');
const axios  = require('axios');
require('dotenv').config();

(async () => {
  const browser = await puppeteer.launch({headless: false, defaultViewport: {width: 1280, height: 720}, userDataDir: 'PrivateChromeSessions'});
  const page = await browser.newPage();
  await page.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0', timeout: 60000})

  // check if connected
  if (page.url().includes("github.com")) {
    const shownBrowser = await puppeteer.launch({headless: false, defaultViewport: null, userDataDir: 'PrivateChromeSessions'});
    const shownPage = await shownBrowser.newPage();
    await shownPage.goto('https://stripcode.dev/ranked', {waitUntil: 'networkidle0', timeout: 60000});
    console.log("you need to connect to your github account")
    // await shownPage.waitForNavigation({waitUntil: 'networkidle0', timeout: 0})
    await page.waitForSelector('.text-oblack', {timeout: 0})
    shownBrowser.close()
    await page.reload({waitUntil: 'networkidle0'})
  }
  console.log("connected to github")

  // while (true) {
  await page.waitForTimeout(1000)

  let repolist = await page.$$eval('[class*=text-bblack]', el => el.map(el => el.textContent))
  let file = await page.$eval('h1[class*=my-8]', el => el.textContent)
  console.log(file, repolist)

  let reposfiles = {}
  let branch = {}
  let fetch_default_branch = []
  let fetch_repofiles = []
  for ([index, repo] of repolist.entries()) {
    let repocache = await dbrepo.findOne({repo: repo})
    if (repocache) { // if repo in db
      reposfiles[index] = repocache.files
    } else {
      fetch_default_branch.push(
        axios.get(`https://api.github.com/repos/${repo}`, {headers: {'Authorization': 'token '+process.env.token}})
        .then(res => {
          console.log("branch", res.data.full_name, res.data.default_branch)
          branch[repo] = res.data.default_branch
          fetch_repofiles.push(
            axios.get(`https://api.github.com/repos/${repo}/git/trees/${branch[repo]}?recursive=true`, {headers: {'Authorization': 'token '+process.env.token}})
          )
        })
      )
    }
  }
  await Promise.all(fetch_default_branch)
  await Promise.all(fetch_repofiles)
    .then(ress => {
      for ([index, res] of ress.entries()) {
        repofiles = res.data.tree.map(file => file.path.replace(/^.*\//, ""))
        reposfiles[index] = repofiles
        // console.log(reposfiles, repofiles, index)
        console.log(ress[0].data, "\n", ress[1].data)
        console.log(repolist[index], res.data.url)
        dbrepo.insert({repo: repolist[index], files: repofiles})
      }
    })

  // console.log(repolist, reposfiles)
  for (repo in repolist) {
    if (reposfiles[repo].indexOf(file) != -1) {
      let isfound = repo
      break
    }
  }
  repolistel = await page.$$('[class*=text-bblack]')
  console.log("isfound : ", typeof isfound)
  if (typeof isfound != 'undefined') {
    console.log("in if statement")
    console.log(isfound)
    for (repoel of repolistel) {
      if (await repoel.evaluate(el => el.textContent) == isfound) {
        await repoel.click()
      }
    }
  } else {
    repolistel[0].click()
  }
  // for (repo of repolist) {
  //   let repocache = await dbrepo.findOne({repo: repo})
  //   if (repocache) { // if repo in db
  //     let repofiles = repocache.files
  //     if (repofiles.indexOf(file) != -1) {
  //       console.log(file, "for", repo, "(db)")
  //       await select(repo)
  //     }
  //   } else {
  //     let mainres = await axios.get(`https://api.github.com/repos/${repo}`, {auth: {username: "process.env.github_username", password: "process.env.github_password"}})
  //     console.log(repo, mainres.data.default_branch)
  //     let res = await axios.get(`https://api.github.com/repos/${repo}/git/trees/${mainres.data.default_branch}?recursive=true`, {auth: {username: "process.env.github_username", password: "process.env.github_password"}})
  //     repofiles = res.data.tree.map(file => file.path.replace(/^.*\//, ""))
  //     // console.log(repofiles.indexOf(file))
  //     dbrepo.insert({repo: repo, files: repofiles})
  //     if (repofiles.indexOf(file) != -1) {
  //       console.log(file, "for", repo, "(from api.github)")
  //       await select(repo)
  //       // dbrepo.insert({repo: repo, files: repofiles})
  //     }
  //   }
  //   console.log("break")
  //   if (repofound) { break; }
  // }
  console.log(" at click nextQuestion")
  // await page.click('[phx-click="nextQuestion"]')
  // }
})();


// const pendingXHR = new PendingXHR(page);
// await pendingXHR.waitForAllXhrFinished();


