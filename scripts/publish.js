const shelljs = require('shelljs')
const inquirer = require('inquirer')
const simpleGit = require('simple-git')
const chalk = require('chalk') // 美化控制台输出
const ora = require('ora') // 6.1.2版本只支持ES Module
const child_process = require('child_process')
const versionFn = require('./publish.version')

const defaultOption = {
  base: process.cwd(),
  binary: 'git',
  maxConcurrentProcesses: 6,
  trimmed: false,
}
const git = simpleGit(defaultOption)
const spinner = ora()

async function publish() {
  // 初始化
  await git.init()
  // 拉取最新版本
  await git.pull('origin', 'master')
  // 运行测试
  // execSyncCmd('npm run test:c')
  await checkCommit()
  const { version: newVersion } = await versionFn()
  //通过version更新版本号，但不自动添加git tag，而是在构建完成后由cli工具添加await checkBranch() // 发布前确认是否为master分支，并检查是否有未提交文件
  execSyncCmd(`npm version ${newVersion} --no-git-tag-version`)

  // 提交发布代码
  await git.add('./*')
  execSyncCmd('npm run commit')
  await git.tag([`v${newVersion}`])
  await git.push()
  await git.push(['--tags'])
  // 构建
  shelljs.exec('npm run build')
  // 发布
  shelljs.exec('npm run publish')
}
/**
 * 同步执行bash命令
 *
 * @param {*} cmd
 */
function execSyncCmd(cmd) {
  try {
    const res = child_process.execSync(cmd, { stdio: 'inherit' })
    console.log('cmd:', res)
  } catch (error) {
    spinner.fail(chalk`{red error：}{blue execSync action ！}${error}`)
    shelljs.exit(1)
  }
}

/**
 *  发布前拉取并确认是否为master分支，并检查是否有未提交文件，询问是否提交文件
 *
 */
async function checkCommit() {
  // await git.init()
  const status = await git.status()
  // 拉取最新版本
  await git.pull()
  // 当前不为master分支，才提交推送
  if (status.current !== 'master') {
    spinner.fail(chalk`{red error:}  请在 master 分支上发布`)
    shelljs.exit(1)
  }
  if (status.files.length > 0) {
    spinner.fail(chalk`{red error：}{blue 有未提交文件！}`)
    const { commitflag } = await inquirer.prompt([
      {
        type: 'list',
        name: 'commitflag',
        message: '是否提交所有未提交文件',
        choices: [
          { name: '提交', value: 1 },
          { name: '不提交', value: 0 },
          { name: '退出', value: 2 },
        ],
      },
    ])
    if (commitflag === 1) {
      await git.add('.')
    } else if (commitflag === 2) {
      shelljs.exit(1)
    }
  }
}
publish()
