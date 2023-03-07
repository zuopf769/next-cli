const inquirer = require('inquirer')
const { chalk } = require('@vue/cli-shared-utils')
const { vuePresets } = require('./util/preset')
const PromptModuleAPI = require('./PromptModuleAPI')
const { getPromptModules } = require('./util/prompt')
const { defaults } = require('./util/preset')

class Creator {
    constructor (name, context) {
        // 项目名称
        this.name = name
        // 项目路径，含名称
        this.context = process.env.VUE_CLI_CONTEXT = context
        // package.json 数据
        this.pkg = {}
        // 包管理工具
        this.pm = null;

        // 预设提示选项
        this.presetPrompt = this.resolvePresetPrompts()
        // 自定义特性提示选项（复选框）
        this.featurePrompt = this.resolveFeaturePrompts()
        // 保存相关提示选项
        this.outroPrompts = this.resolveOutroPrompts()
        // 其他提示选项
        this.injectedPrompts = []
        // 回调
        this.promptCompleteCbs = []


        const promptAPI = new PromptModuleAPI(this)
        const promptModules = getPromptModules()
        promptModules.forEach(m => m(promptAPI))

        // 测试（仅为测试代码，用完需删除）
        // inquirer.prompt(this.resolveFinalPrompts()).then(res => {
        //     console.log('选择的选项：')
        //     console.log(res)
        // })

    }
  
    async create() {
        const preset = await this.promptAndResolvePreset();

        // 测试（仅为测试代码，用完需删除）
        console.log('preset 值：')
        console.log(preset);
    }

    // 获得预设的选项
    resolvePresetPrompts() {
        const presetChoices = Object.entries(defaults.presets).map(([name, preset]) => {
            return {
                name: `${name}(${Object.keys(preset.plugins).join(',')})`, // 将预设的插件放到提示
                value: name
            }
        })
    
        return {
            name: 'preset', // preset 记录用户选择的选项值。
            type: 'list', // list 表单选
            message: `Please pick a preset:`,
            choices: [
                ...presetChoices, // Vue2 默认配置，Vue3 默认配置
                {
                name: 'Manually select features', // 手动选择配置，自定义特性配置
                value: '__manual__'
                }
            ]
        }
    }

    resolveFinalPrompts() {
        const prompts = [
          this.presetPrompt,
          this.featurePrompt,
          ...this.outroPrompts,
          ...this.injectedPrompts
        ]
        return prompts
    }

    // 自定义特性复选框
    resolveFeaturePrompts() {
        return {
            name: 'features', // features 记录用户选择的选项值。
            when: answers => answers.preset === '__manual__', // 当选择"Manually select features"时，该提示显示
            type: 'checkbox',
            message: 'Check the features needed for your project:',
            choices: [], // 复选框值，待补充
            pageSize: 10
        }
    }

    // 保存相关提示选项
    resolveOutroPrompts() {
        const outroPrompts = [
            // useConfigFiles 是单选框提示选项。
            {
                name: 'useConfigFiles',
                when: answers => answers.preset === '__manual__',
                type: 'list',
                message: 'Where do you prefer placing config for Babel, ESLint, etc.?',
                choices: [
                {
                    name: 'In dedicated config files',
                    value: 'files'
                },
                {
                    name: 'In package.json',
                    value: 'pkg'
                }
                ]
            },
            // 确认提示选项
            {
                name: 'save',
                when: answers => answers.preset === '__manual__',
                type: 'confirm',
                message: 'Save this as a preset for future projects?',
                default: false
            },
            // 输入提示选项
            {
                name: 'saveName',
                when: answers => answers.save,
                type: 'input',
                message: 'Save preset as:'
            }
        ]
        return outroPrompts
    }

    async promptAndResolvePreset () {
        try {
          let preset;
          const { name } = this
          const answers = await inquirer.prompt(this.resolveFinalPrompts());
          
          // answers 得到的值为 { preset: 'Default (Vue 2)' }
          
          if (answers.preset && answers.preset === 'Default (Vue 2)') {
            if (answers.preset in vuePresets) {
              preset = vuePresets[answers.preset]
            }
          } else {
            // 暂不支持 Vue3、自定义特性配置情况
            throw new Error('哎呀，出错了，暂不支持 Vue3、自定义特性配置情况')
          }
          
          // 添加 projectName 属性
          preset.plugins['@vue/cli-service'] = Object.assign({
            projectName: name
          }, preset)
        
          return preset;
        } catch (err) {
          console.log(chalk.red(err));
          process.exit(1);
        }
      }


}
  
module.exports = Creator;