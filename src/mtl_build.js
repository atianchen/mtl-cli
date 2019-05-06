const shell = require('shelljs');
const MTL_PLATFORM_IOS_TYPE = 1 ;
const MTL_PLATFORM_ANDROID_TYPE = 2 ;
const MTL_PLATFORM_WX_TYPE = 3 ;
const MTL_PLATFORM_EAPP_TYPE = 4 ;

const configFile = require('./config');
const utils = require('./mtl').Utils;
const inquirer = require('inquirer');
const xml2js = require('xml2js');
const buildList = [{
  type: 'list',
  message: '请选择项目平台：1、iOS；2、Android , 用上下箭头选择平台:',
  name: 'platform',
  choices: [
      "iOS",
      "android"
  ],
  filter: function (val) { // 使用filter将回答变为小写
      return val.toLowerCase();
  }
}];

const startList = [{
  type: 'list',
  message: '请选择项目平台：Android ，其他平台暂未支持',
  name: 'platform',
  choices: [
      "android"
  ],
  filter: function (val) { // 使用filter将回答变为小写
      return val.toLowerCase();
  }
}];

var fs=require('fs-extra');
var unzip = require("unzip-stream");

var selectedPlatform ='All';
var certName = 'ump';
class mtlBuild{
  static build(buildPlatform) 
  {
    updateConfigFileToRelease();
    if(commitAndPushConfigFile()== "error"){
        return;
    }
     if (buildPlatform== undefined){
          inquirer.prompt(buildList).then(answers => {
            console.log('选用平台：'+answers.platform); // 返回的结果
            console.log(answers.platform+'项目工程编译中...');
            if(answers.platform =="ios"){
              cloudBuildAndUnzip(answers.platform,'UAPMOBILE_DIS_299');
            }else{
              cloudBuildAndUnzip(answers.platform,'ump');
            }
          });
        } else if (utils.checkPlatform(buildPlatform)== "iOS".toLowerCase()) {
            
            console.log('iOS 项目工程编译中...');
            
            cloudBuildAndUnzip(buildPlatform.toLowerCase(),'UAPMOBILE_DIS_299');
        } else if ( utils.checkPlatform(buildPlatform)== "Android".toLowerCase()){
            
            console.log('android 项目工程编译中...');
            
            cloudBuildAndUnzip(buildPlatform.toLowerCase(),'ump');
        }else if (utils.checkPlatform(buildPlatform)== "WX".toLowerCase()){
            console.log('暂时不可用');
        }else if ( utils.checkPlatform(buildPlatform)== "EApp".toLowerCase()){
            console.log('暂时不可用');
        }else {
            inquirer.prompt(buildList).then(answers => {
            console.log('选用平台：'+answers.platform); // 返回的结果
            console.log(answers.platform+'项目工程编译中...');
            if(answers.platform =="ios"){  
              cloudBuildAndUnzip(answers.platform,'UAPMOBILE_DIS_299');
            }else{
              cloudBuildAndUnzip(answers.platform,'ump');
            }
          });
        }
  }

static start(startPlatform) {
    
    console.log('注意 🎉 请一定要在当前工程目录下🎉 ！');
      if (startPlatform != undefined){
       
        // todo 
            if  (utils.checkPlatform(startPlatform)== "iOS".toLowerCase()) {
               
               console.log('暂时不可演示');
            } else if (utils.checkPlatform(startPlatform)== "Android".toLowerCase()){
               
              androidInstall();

            }else if (utils.checkPlatform(startPlatform)== "WX".toLowerCase()){
              //  shell.cd("WX");
              //  console.log('WX 项目工程编译中...');
               console.log('暂时不可演示');
            }else if (utils.checkPlatform(startPlatform)== "EApp".toLowerCase()){
              //  shell.cd("EApp");
              //  console.log('EApp 项目工程编译中...');
               console.log('暂时不可演示');
            }else{
              inquirer.prompt(startList).then(answers => {
                console.log('选用平台：'+answers.platform); // 返回的结果
                console.log(answers.platform+'项目启动中...');
                if(answers.platform =="android"){
                  androidInstall();
                }else{
                  console.log('暂时不可演示');
                }
              });
            }
      }else{

        inquirer.prompt(startList).then(answers => {
          console.log('选用平台：'+answers.platform); // 返回的结果
          console.log(answers.platform+'项目启动中...');
          if(answers.platform =="android"){
            androidInstall();
          }else{
            console.log('暂时不可演示');
          }
        });
      }
  }
}



function androidInstall(){
  var file="project.json";
  var result=JSON.parse(fs.readFileSync(file));
  var projectName = result.config.projectName;
  
  console.log('android 工程运行展示中，请先打开模拟器...');
  
  let pwd = shell.pwd();
 var runProjPath = pwd +"/output/release/android/export/"+projectName+".apk"
 console.log('apk地址:'+runProjPath);
  shell.exec("adb install -r  "+ runProjPath);
}


function cloudBuildAndUnzip(selectedPlatform,certName){
  // 接口请求
  var FormData = require('form-data');
  var http = require('http');
  var form = new FormData();

  var file="project.json";
  var result=JSON.parse(fs.readFileSync(file));
  var projectName = result.config.projectName;
  var gitUrl = result.config.gitUrl;

  form.append('userName','ump');
  form.append('buildType',selectedPlatform);
  // form.append('certName',certName); 
  form.append('certName',certName); 
  // form.append('request', fs.createReadStream("./test.zip"));//'request'是服务器接受的key
  form.append('projectName',projectName); 
  form.append('gitUrl',gitUrl);
  form.append('gitBranch','');
  form.append('isDebug',"false");
  var headers = form.getHeaders();//这个不能少
  // headers.Cookie = cookie;//自己的headers属性在这里追加
  var request = http.request({
    method: 'POST',
    host: configFile.CONFIG_BUILDSERVER_URL ,
    port: configFile.CONFIG_BUILDSERVER_PORT , 
    path: configFile.CONFIG_BUILDPROJECT_API ,
    headers: headers
  },(res) =>{
            var outFile= selectedPlatform+'.zip'
            let ws = fs.createWriteStream(outFile,{
                  highWaterMark:1
              })

            res.on('data',(buffer) => {
              ws.write(buffer) ;  
            });
            res.on('end',()=>{
              
              //文件下载结束
              ws.end();
              if(selectedPlatform=='android'){
                fs.exists("android.zip",function(exists){
                  if(exists){                         
                      // 删除已有的文件
                      shell.exec("rm -rf  output/release/android ");
                      // 创建输出目录
                      utils.mkDirsSync("./output/release");
                      // 开始解压文件
                      shell.exec("unzip android.zip  -d output/release/android");
                      //fs.removeSync('./output/release/android');
                      //fs.createReadStream('android.zip').pipe(unzip.Extract({ path: './output/release/android' }));
                      
                      console.log("文件解压完成。");

                      // 获取android 目录下的文件目录
                      let pwd = shell.pwd();
                      let filePath = pwd +"/output/release/android";
                      let filesDir= getFilesDir(filePath);
                      //  验证android目录文件
                      let len = filesDir.length;
                      let logPath;
                      let apkPath;
                      for (let i = 0; i < len; ++i) {
                          if (filesDir[i].indexOf(".log")>=0){
                            logPath=filesDir[i];
                          }
                          if (filesDir[i].indexOf(".apk")>=0){
                            apkPath=filesDir[i];
                          }
                      }
                      if(apkPath!=null){
                        console.log('工程编译完成,编译日志如下：');
                      }else{
                        console.log('工程编译失败,编译日志如下：');
                      }
                      
                      let data = fs.readFileSync(logPath, 'utf8');
                      console.log(data);
                      shell.exec("rm -rf  android.zip ");
                      console.log(' 构建包文件目录为: 当前工程目录/output/release/android');
                      console.log('可以通过  start 指令来完成云编译工程本地虚拟安装演示');
                      console.log('指令举例：mtl start         引导完成平台演示!');
                      console.log('指令举例：mtl start 2       通过平台代号完成平台演示！');
                      console.log('指令举例：mtl start Android 通过平台名称完成平台演示！');
                  }
                     if(!exists){
                        console.log("android.zip文件不存在")
                     }
                  })

              }else{
                fs.exists("ios.zip",function(exists){
                  if(exists){            
                      
                      // 删除已有的文件
                      shell.exec("rm  -rf  output/release/ios");
                      // 创建输出目录
                      utils.mkDirsSync("./output/release");
                      // 开始解压文件
                      shell.exec("unzip ios.zip  -d output/release/ios");
                      //fs.removeSync('./output/release/ios');
                      //fs.createReadStream('ios.zip').pipe(unzip.Extract({ path: './output/release/ios' }));
                      

                      // 获取ios目录下的文件目录
                      let pwd = shell.pwd();
                      let filePath = pwd +"/output/release/ios";
                      let filesDir= getFilesDir(filePath);
                      //  验证iOS目录文件
                      let len = filesDir.length;
                      let logPath;
                      let ipaPath;
                      for (let i = 0; i < len; ++i) {
                        if (filesDir[i].indexOf(".log")>=0){
                          logPath=filesDir[i];
                        }
                        if (filesDir[i].indexOf(".ipa")>=0){
                          ipaPath=filesDir[i];
                        }
                      }
                      if(ipaPath!=null){
                        console.log('工程编译完成,编译日志如下：');
                      }else{
                        console.log('工程编译失败,编译日志如下：');
                      }
                    
                      let data = fs.readFileSync(logPath, 'utf8');
                      console.log(data);
                      shell.exec("rm  -rf  ios.zip");
                      console.log(' 构建包文件目录为: 当前工程目录/output/release/ios');
                      
                  }
                     if(!exists){
                        console.log("ios.zip文件不存在")
                     }
                  })

              }
          
            });
        
  });

  request.on('error', (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  form.pipe(request);  
}

function getFilesDir(filePath){
  console.log('filePath:'+filePath);
  var join = require('path').join;
    let filesDir = [];
    function findJsonFile(path){
        let files = fs.readdirSync(path);
        files.forEach(function (item, index) {
            let fPath = join(path,item);
            let stat = fs.statSync(fPath);
            if(stat.isDirectory() === true) {
                findJsonFile(fPath);
            }
            if (stat.isFile() === true) { 
              filesDir.push(fPath);
            }
        });
    }
    findJsonFile(filePath);
    console.log(filesDir);
    return filesDir;
}


function updateConfigFileToRelease() {
    // 修改project.json  
    var proj = JSON.parse(fs.readFileSync("./project.json").toString());
    proj.config.debuggerEnable="false";
    fs.writeFileSync("./project.json", formatJson(proj),{flag:'w',encoding:'utf-8',mode:'0666'});
    //修改./app/config.xml
    let xmlFile = "./app/config.xml";
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(proj);
    fs.writeFileSync(xmlFile, xml,{flag:'w',encoding:'utf-8',mode:'0666'});    
}

/**
 * MTL工程 提交远程仓库
 * 
 */
function commitAndPushConfigFile() {
    let pwd = shell.pwd();
    console.log('当前路径：'+pwd);
    if(!fs.existsSync(".git")) {
        return utils.reportError("未找到远程git仓库 ,请执行: mtl pushRemote 命令创建远程代码托管后，再进行debug。  ");
    }
    //first commit
    shell.exec("git add -A");
    console.log('执行git commit');

    shell.exec("git commit -m update  -q");
    shell.exec("git push");
    console.log("配置文件更新到云端");
    return utils.SUCCESS;

}
/**
 * 格式化输出JSON对象，返回String
 * @param {JSON} data 
 */
function formatJson(data) {
  let LN = "\r";
  let TAB = "\t";
  var rep = "~";
  var jsonStr = JSON.stringify(data, null, rep)
  var str = "";
  for (var i = 0; i < jsonStr.length; i++) {
      var text2 = jsonStr.charAt(i)
      if (i > 1) {
          var text = jsonStr.charAt(i - 1)
          if (rep != text && rep == text2) {
              str += LN
          }
      }
      str += text2;
  }
  jsonStr = "";
  for (var i = 0; i < str.length; i++) {
      var text = str.charAt(i);
      if (rep == text)
          jsonStr += TAB;
      else {
          jsonStr += text;
      }
      if (i == str.length - 2)
          jsonStr += LN
  }
  return jsonStr;
}


module.exports = mtlBuild;

