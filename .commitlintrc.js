module.exports = {
  extends: ['@commitlint/config-conventional'],
  // 校验规则
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', //新功能（feature）
        'fix', //修补bug
        'docs', //文档（documentation）
        'style', //格式（不影响代码运行的变动）
        'refactor', //重构（即不是新增功能，也不是修改bug的代码变动）
        'perf', //性能提升（提高性能的代码改动）
        'test', //测试
        'chore', // 不修改src或测试文件的其他更改
        'revert', //撤退之前的commit
        'build', //构建过程或辅助工具的变动（webpack等)
        'ci', //  更改持续集成软件的配置文件和package中的scripts命令，例如scopes: Travis, Circle等
      ],
    ],
    'scope-case': [
      2,
      'always',
      ['module', 'utils', 'config', 'test', 'demo', 'empty', 'custom'],
    ],
    'type-case': [0],
    'type-empty': [0],
    'scope-empty': [0],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'header-max-length': [0, 'always', 72],
  },
}
