import simpleGit from 'simple-git'

const defaultOption = {
  base: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
}

const git = simpleGit(defaultOption)
await git.init()
const status = await git.status()
console.log(status)
// 当前不为master分支，才提交推送
if (status.current !== 'master') {
  console.log(status.current)
}

// staged.length>0 需要要 commit
// not_added.length>0 => git add .
