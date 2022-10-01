const shelljs = require('shelljs')
const chalk = require('chalk') // 美化控制台输出
const checkBranch = require('./check')
const versionFn = require('./publish.version')

async function publish(newVer) {
  // 拉取最新版本
  shelljs.exec('git pull')
  // 运行测试
  shelljs.exec('npm run test:c') //通过yarn version更新版本号，但不自动添加git tag，而是在构建完成后由cli工具添加
  shelljs.exec(`npm version ${newVer} --no-git-tag-version`)
  await checkBranch() // 发布前确认是否为master分支，并检查是否有未提交文件
  const newVersion = await versionFn()

  // 提交发布代码
  // shelljs.exec('git add . -A')
  // shelljs.exec('yarn commit')
  shelljs.exec(`git tag -a v${newVersion} -m "build: ${newVersion}"`)
  shelljs.exec('git push')

  shelljs.exec('git push --tags')
  // 构建
  shelljs.exec('npm run build')
  // 发布
  shelljs.exec('npm run publish --access=public')
}
publish()
