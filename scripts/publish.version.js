const path = require('path')
const inquirer = require('inquirer') // 9以上版本只支持ES导入
const semver = require('semver')

const { version } = require(path.resolve(__dirname, '../package.json'))
const newVersion = {
  patch: semver.inc(version, 'patch'),
  minor: semver.inc(version, 'minor'),
  major: semver.inc(version, 'major'),
}
module.exports = () =>
  inquirer.prompt([
    {
      type: 'list',
      name: 'version',
      message: '版本号更新方式：',
      choices: [
        { name: `使用当前版本(${version})`, value: version },
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
