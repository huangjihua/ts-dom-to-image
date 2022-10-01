const shelljs = require('shelljs')
const simpleGit = require('simple-git')

const defaultOption = {
  base: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
}

const git = simpleGit(defaultOption)
async function main(msg = '') {
  console.log(msg)
  await git.init()
  const status = await git.status()
  // 当前不为master分支，才提交推送
  // if (status.current !== 'master') {
  //   shelljs.echo('Error:请在 master 分支上发布')
  //   shelljs.exit(1)
  // }
  // if (status.files.length > 0) {
  //   shelljs.echo('Error:有未提交文件！')
  //   shelljs.exit(1)
  // }
  git.add('./*')
  git.commit(msg)
}
module.exports = main
