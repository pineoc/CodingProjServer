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
    checkext = checkext.toLowerCase();
    //check image ext
    if(checkext == '.jpg')
        return true;
    else if(checkext == '.jpeg')
        return true;
    else if(checkext == '.png')
        return true;
    else
        return false;
};


/*
 * file upload file one
 * name : file dir name
 * file : file
 * */
exports.fileUpload = function(name,file){
    var resData = {};
    if(typeof file === 'undefined' || file == null){
        console.log('fileService, no file');
        resData.path = '/img/'+'null.png';
        resData.result = false;
        resData.error = true;
        resData.msg = 'no file';
        return resData;
    }
    var filename = file.name;
    var folder = path.resolve(mypath,name);
    var srcpath = file.path;
    var destpath;


    if(imgFile_check(filename)==false){
        console.log('file ext invalid, ext : ',path.extname(filename));
        resData.path = null;
        resData.result = false;
        resData.error = true;
        resData.msg = 'file ext invalid';
        return resData;
    }
    try {
        if(!fs.existsSync(folder)){
            mkdirp(folder,function(err){
                if(err){
                    console.log('error mkdirp, ',err);
                    resData.path = null;
                    resData.result = false;
                    resData.error = true;
                    resData.msg = 'mkdirp err';
                    return resData;
                }
                else
                    console.log('mkdirp success');
            });
        }
    } catch(e) {
        console.log('Unexpected error mkdirp : ', e);
        resData.path = null;
        resData.result = false;
        resData.error = true;
        resData.msg = 'mkdirp unexpected err';
        return resData;
    }

    //for unique file name
    var dateData = new Date().getTime().toString();
    var md5sum = crypto.createHash('md5');
    md5sum.update(filename+dateData);

    var hashedFilename = md5sum.digest('hex') + path.extname(filename);

    destpath = path.resolve(folder,hashedFilename);
    var is = fs.createReadStream(srcpath); //소스로부터 스트림을 입력받음
    var os = fs.createWriteStream(destpath); //읽어온 스트림을 통해서 사진파일 생성

    is.pipe(os);
    is.on('end',function(){
        try {
            fs.unlinkSync(srcpath);
        } catch(e) {
            console.log('unlinkSync error : ',e);
        }
    });

    resData.path = '/img/' + name + '/' + hashedFilename;
    resData.result = true;
    resData.error = false;
    resData.msg = 'success';
    return resData;
};

/*
 * file upload file one
 * name : file dir name
 * file : file
 * */
exports.fileClothUpload = function(name,file,savefilename){
    var resData = {};
    if(typeof file === 'undefined' || file == null){
        console.log('fileService, no file');
        resData.path = urlpath_base+'/'+'null.png';
        resData.result = false;
        return resData;
    }
    var filename = file.name;
    var folder = path.resolve(mypath,name);
    var srcpath = file.path;
    var destpath;


    if(imgFile_check(filename)==false){
        console.log('file ext invalid, ext : ',path.extname(filename));
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

    destpath = path.resolve(folder,savefilename+path.extname(filename));
    var is = fs.createReadStream(srcpath); //소스로부터 스트림을 입력받음
    var os = fs.createWriteStream(destpath); //읽어온 스트림을 통해서 사진파일 생성

    is.pipe(os);
    is.on('end',function(){
        fs.unlinkSync(srcpath);
    });

    resData.path = urlpath_base+'/'+name+'/'+savefilename+path.extname(filename);
    resData.result = true;
    return resData;
};
