/**
 * Created by pineoc on 2015-08-25.
 * DO : file upload function
 */

var path = require('path');
var fs = require('fs');
var util = require('util');
var mkdirp = require('mkdirp');

var mypath = path.join(__dirname,'..','public','img');

/*
* file upload file one
* type 1:category | 2:board | 3:editor thumnail
* name : file dir name
* file : file
* */
exports.fileUpload = function(type,name,file){
    var filename = file.name;
    var folder = path.resolve(mypath,name);
    var srcpath = file.path;
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
    is.on('end',function(){
        fs.unlinkSync(srcpath);
    });
    console.log('fileupload success');
    return true;
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
