import fs from 'fs/promises'
import inquirer from 'inquirer'
import shelljs from 'shelljs'
import semver from 'semver'
import simpleGit from 'simple-git'
import chalk from 'chalk' // 美化控制台输出

const { version } = JSON.parse(
  await fs.readFile(new URL('../package.json', import.meta.url)),
)
const newVersion = {
  patch: semver.inc(version, 'patch'),
  minor: semver.inc(version, 'minor'),
  major: semver.inc(version, 'major'),
}
inquirer
  .prompt([
    {
      type: 'list',
      name: 'version',
      message: '版本号更新方式：',
      choices: [
        {
          name: `v${newVersion.patch}:when you make backwards compatible bug fixes`,
          value: newVersion.patch, //表示修订号,向后兼容的 bug 修正;
        },
        {
          name: `v${newVersion.minor}: when you add functionality in a backwards compatible manner`,
          value: newVersion.minor, // 表示次版本号，向后兼容的功能性改变；
        },
        {
          name: `v${newVersion.major}: when you make incompatible API changes`,
          value: newVersion.major, // 表示主版本号，非兼容性的重大API修改；
        },
      ],
    },
  ])
  .then((res) => {
    const { version: newVer } = res
    // console.log('result:', newVer)
    // publish(newVer)
  })

function publish(newVer) {
  // 拉取最新版本
  // shelljs.exec('git pull')
  // 运行测试
  // shelljs.exec('npm run test')
  //通过yarn version更新版本号，但不自动添加git tag，而是在构建完成后由cli工具添加
  shelljs.exec(`npm version ${newVer} --no-git-tag-version`)

  // 提交发布代码
  shelljs.exec('git add . -A')
  shelljs.exec('yarn commit')
  shelljs.exec(`git tag -a v${newVer} -m "build: ${newVer}"`)
  shelljs.exec('git push')
  shelljs.exec('git push --tags')
  // 构建
  // shelljs.exec('npm run build')
  //发布
  // shelljs.exec('npm run publish --access=public')
}
