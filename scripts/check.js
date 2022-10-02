const shelljs = require('shelljs')
const simpleGit = require('simple-git')
const chalk = require('chalk') // 美化控制台输出
const defaultOption = {
  base: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
}

const git = simpleGit(defaultOption)
async function main() {
  await git.init()
  const status = await git.status()
  // 当前不为master分支，才提交推送
  if (status.current !== 'master') {
    console.log(chalk`{red error:}  请在 master 分支上发布`)
    shelljs.exit(1)
  }
  if (status.files.length > 0) {
    console.log(chalk`{red error：}{blue 有未提交文件！}`)
    shelljs.exit(1)
  }
  // await git.add('./*')
  // await git.commit()
}
module.exports = main
