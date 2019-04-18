#!/usr/bin/env node

const program = require('commander');

var mLocalCreate = require('./src/mtl_localCreate');
var mCreate = require('./src/mtl_create');
var mLogin =  require('./src/mtl_login');
var mConfig = require('./src/mtl_config');
var mTemplate = require('./src/mtl_template');
var mPage = require('./src/mtl_page');
var mComponent = require('./src/mtl_component');
var mViewpage = require('./src/mtl_viewpage');
var mBuild = require('./src/mtl_build');
var mDebug = require('./src/mtl_debug');
var mPlugin = require('./src/mtl_plugin');

const getAutoUpdate = require('./src/update');

//第一时间检测是否有最新版本给出提升自行升级或者是热更新模板

// getAutoUpdate();

program
  .version(require('./package').version)

program
  .command('create [appname] [template]').alias('c') // 命令简写
  .description('根据模板创建项目。\nappname: 工程名称 ；\ntemplate: 模板名称；\n\r使用mtl template list查看模板')
  .action(function (appname,template) {
    mCreate.createApp(appname,template);
  });

program
  .command('localCreate [appname] [template]').alias('lc') // 命令简写
  .description('根据模板创建 本地 项目。\nappname: 工程名称 ；\ntemplate: 模板名称；\n\r使用mtl template list查看模板')
  .action(function (appname,template) {
    mLocalCreate.createApp(appname,template);
  });  

program
  .command('pushRemote').alias('psr') // 命令简写
  .description('本地工程，提交远程。')
  .action(function () {
    mLocalCreate.pushRemote();
  });

program
  .command('pullRemote [gitURL]').alias('plr') // 命令简写
  .description('根据gitUrl下载工程')
  .action(function (gitURL) {
    mLocalCreate.pullRemote(gitURL);
  }); 

program
  .command('import [appname] [source]').alias('ipt') // 命令简写
  .description('导入一个Summer工程')
  .action(function (appname, source) {
    mCreate.importApp(appname, source);
  });

program
  .command('login [username] [password]').alias('l') // 命令简写
  .description('login to yonyou cloud build')
  .action(function (username, password) {
    mLogin.login(username, password);
  });

program
  .command('config [key] [value]').alias('conf') // 命令简写
  .description('Setting your environment variables')
  .action(function (key, value) {
    mConfig.config(key, value);
  });

program
  .command('template [cmd] [name] [file]').alias('tpl') // 命令简写
  .description('管理模板。')
  .action(function (cmd, name, file) {
    mTemplate.run(cmd, name, file);
  });

program
  .command('add-page [name] [tplname]').alias('ap') // 命令简写
  .option("--p,--platform [plat]", "根据平台创建页面", "Default")
  .option("--t,--template [tpl]", "根据平台创建页面", "default")
  .description('添加页面')
  .action(function (name,tplname) {
    console.log("add-page " + name);
    mPage.addView(name,tplname);
  });

program
  .command('add-component [componentname]').alias('ac') // 命令简写
  .description('添加组件。\ncomponentname: 组件名称；\n\r使用mtl plugin list查看组件')
  .action(function (componentname) {
    mComponent.addComponent(componentname);
  });
  
program
  .command('plugin [cmd] [name] [file]').alias('tpl') // 命令简写
  .description('管理插件。')
  .action(function (cmd, name, file) {
    mPlugin.run(cmd, name, file);
  });



program
  .command('build [platform]') // iOS | Android | WX | EApp 。
  .alias('b') // 命令简写
  .description('编译MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 EApp ')
  .action(function (platform) { // 执行命令的的函数
    
    mBuild.build(platform);
  });


// 运行模拟演示
program
  .command('start [platform]') // iOS | Android | WX | EApp 
  .alias('s') // 命令简写
  .description('运行演示MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 EApp ')
  .action(function (platform) { // 执行命令的的函数
    mBuild.start(platform);
  })

program
  .command('debug [platform]') // iOS | Android | WX | EApp 。
  .alias('d') // 命令简写
  .description('运行演示MTL项目，平台为：1 iOS | 2 Android | 3 WX | 4 EApp 。')
  .action(function (platform) { // 执行命令的的函数
    mDebug.start(platform);
  })

program.parse(process.argv)





