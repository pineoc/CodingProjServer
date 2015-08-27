/**
 * Created by pineoc on 2015-08-25.
 * DO : file upload function
 */

var path = require('path');
var fs = require('fs');
var util = require('util');
var mkdirp = require('mkdirp');
var crypto = require('crypto');

var config = require('./db_config');

var mypath = path.join(__dirname,'..','public','img');
var urlpath_base = path.join(config.server_data.domain,'img');


var imgFile_check = function(filename){
    var checkext = path.extname(filename);
    checkext=checkext.toLowerCase();
    //check image ext
    if(checkext === '.jpg')
        return true;
    if(checkext === '.jpeg')
        return true;
    if(checkext === '.png')
        return true;

    return false;
};


/*
* file upload file one
* name : file dir name
* file : file
* */
exports.fileUpload = function(name,file){
    var filename = file.name;
    var folder = path.resolve(mypath,name);
    var srcpath = file.path;
    var destpath;
    var resData = {};

    if(imgFile_check(name)==false){
        console.log('file ext invalid, ext : ',path.extname(name));
        resData.path = null;
        resData.result = false;
        return resData;
    }

    if(!fs.existsSync(folder)){
        mkdirp(folder,function(err){
            if(err){
                console.log('error mkdirp, ',err);
                resData.path = null;
                resData.result = false;
                return resData;
            }
            else
                console.log('mkdirp success');
        });
    }
    var md5sum = crypto.createHash('md5');
    md5sum.update(filename);
    var hashedFilename = md5sum.digest('hex')+'.png';

    destpath = path.resolve(folder,hashedFilename);
    var is = fs.createReadStream(srcpath); //소스로부터 스트림을 입력받음
    var os = fs.createWriteStream(destpath); //읽어온 스트림을 통해서 사진파일 생성

    is.pipe(os);
    is.on('end',function(){
        fs.unlinkSync(srcpath);
    });

    resData.path = urlpath_base+'/'+name+'/'+hashedFilename;
    resData.result = true;
    return resData;
};
/**
 *
 * file upload file array
 * type 1:category | 2:board | 3:editor thumnail
 * name : file dir name
 * file : file
 */
exports.fileUploadArr = function(type,name,files){
    var folder = path.resolve(mypath,name);
    console.log(folder);
    console.log(fs.existsSync(folder));

    for(var i=0; i < files.length; i++){
        var filename = files[i].name;
        var srcpath = files[i].path;
        var destpath;

        if(!fs.existsSync(folder)){
            mkdirp(folder,function(err){
                if(err){
                    console.log('error mkdirp, ',err);
                    return false;
                }
                else
                    console.log('mkdirp success');
            });
        }

        destpath = path.resolve(folder,filename);
        var is = fs.createReadStream(srcpath); //소스로부터 스트림을 입력받음
        var os = fs.createWriteStream(destpath); //읽어온 스트림을 통해서 사진파일 생성

        is.pipe(os);
        is.on('end',function(err){
            if (err) console.log('error is.on');
            else console.log('is.on success');
        });
    }
    console.log('fileuploadArr success');
    return true;
};
