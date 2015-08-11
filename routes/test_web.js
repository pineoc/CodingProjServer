

var db = require('./db_config');
var sessionService = new (require('./sessionService'))();

var crypto = require('crypto');

//login test page
//type : get
//show login test
exports.login_test_get = function(req, res){
    res.render('test_web', { title: 'Test Web' });
};

//login test request
//type : post
//get data from test_web.ejs
//req : email, pwd
//res : status, isMaster
exports.login_test_post = function(req, res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    var sendData = {};

    if(recvData.email==='aaa' && recvData.pwd ==='123'){
        sendData.status = 's';
        sendData.isMaster = true;
    }
    else{
        sendData.status = 'f';
        sendData.isMaster=false;
    }
    res.send(sendData);
};

//login page for get login data
//type : post
//req : id, pwd
//res : status, isMaster
exports.login = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check id, pwd are not null
    if(typeof recvData.email ==='undefined' || typeof recvData.pwd ==='undefined'){
        console.log('email OR pwd undefined');
        res.json({status:'f'});
        return;
    }
    if(recvData.email==null || recvData.pwd==null){
        console.log('email OR pwd null');
        res.json({status:'f'});
        return;
    }

    //TODO : SELECT DB on writers table
    db.pool.getConnection(function(err,conn){
        if(err){
            console.log('err c /web/login, ',err);
            res.json({status:'f'});
            return;
        }
        else{
            //TODO : recvData.pwd should do hash
            var shasum = crypto.createHash('sha1');
            shasum.update(recvData.pwd);
            var d = shasum.digest('hex');
            conn.query('SELECT * FROM EDITOR WHERE e_email=? AND e_pwd=?',[recvData.email,recvData.pwd],function(err2,result){
                if(err2){
                    console.log('err S /login, ',err2);
                    res.json({status:'f'});
                    conn.release();
                    return;
                }
                else{
                    if(result.length == 1){
                        //success login
                        //TODO : register session, response success
                        var param = {};
                        param.email = result[0].e_email;
                        param.name = result[0].e_name;
                        if(db.data.email === param.email && db.data.name === param.name ){
                            param.isMaster = true;
                        }
                        else{
                            param.isMaster = false;
                        }
                        sessionService.registerSession(req,param.email,param.name,param.isMaster);
                        res.json({status:'s'});
                    }
                    else{
                        //fail
                        res.json({status:'f'});
                    }
                }
                conn.release();
            });
        }
    });

};

exports.masterMain = function(req,res){
    if(sessionService.getSession().isMaster){
        res.render('masterPage',{status:'s'});
    }
    else{
        res.render('masterPage',{status:'f'});
    }
};

/*
 * category list
 * type : get
 * req : none
 * res : status, categoryNum, categorys
 * */
exports.cateList = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    //if(req.session)

    var renderData = {
        status:'s',
        categoryNum : 5,
        categorys : [
            {
                "cateID":1,
                "cateName":"남정네들"
            },
            {
                "cateID":2,
                "cateName":"패션"
            },
            {
                "cateID":3,
                "cateName":"자동차"
            },
            {
                "cateID":4,
                "cateName":"게임"
            },
            {
                "cateID":5,
                "cateName":"스포츠"
            }
        ]
    };


    res.render('category',renderData);
};

/*
 * category add
 * type : post
 * req : addCategory
 * res : status
 * */
exports.cateAdd = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master


};

/*
 * category update
 * type : post
 * req : cateID, updateCategory
 * res : status
 * */
exports.cateUpdate = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master


};

/*
 * category delete
 * type : post
 * req : cateID
 * res : status
 * */
exports.cateDel = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master


};

/*
 * editor list
 * type : get
 * req :
 * res : status, editors
 * */
exports.editorList = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master



    res.render('editor',{result:'s'});
};

/*
 * editor add
 * type : post
 * req : editorID, editorEmail, editorPwd, editorName, editorNick, editorCate
 * res : status
 * */
exports.editorAdd = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master


    //TODO : check datas is null and valid


    //TODO : INSERT to writer TABLE these datas


    //TODO : success = status:s , fail = status:f



};

/*
 * editor delete
 * type : post
 * req : editorID
 * res : status
 * */
exports.editorDel = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master


    //TODO : check datas is null and valid


    //TODO : DELETE to writer TABLE these datas


    //TODO : success = status:s , fail = status:f

};

/*
 * all board content list
 * type : get
 * req : pageNum
 * res : status, contentNum, datas
 * */
exports.boardAllList = function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);

    //TODO : check session is master

    //TODO : SELECT data from board TABLE

    res.render('management',{result:'s'});

};

/*
 * board update
 * type : post
 * req : contentID,
 * res : status
 * */
exports.boardUpdate = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master or editor validation

    //TODO : DB UPDATE board TABLE,


};

/*
 * board delete
 * type : post
 * req : contentID
 * res : status
 * */
exports.boardDel = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master or editor validation

    //TODO : DB UPDATE board TABLE, valid set false


};

exports.boardWriteGet = function(req,res){

    res.render('writeConsidertaions',{result:'s'});
};

/*
 * board write
 * type : post
 * req : title, category, thumnail(file),
 *       datas({file, content} array)
 * res : status
 * */
exports.boardWrite = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master or editor validation

    //TODO : DB UPDATE board TABLE, valid set false

    res.json({result:'s'});
};

/*
 * board content list
 * type : get
 * req : pageNum
 * res : status, contentNum, datas
 * */
exports.boardList = function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);

    //TODO : check session is editor

    //TODO : SELECT data from board TABLE

    res.render('management',{result:'s'});
};
