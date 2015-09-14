

var db = require('./db_config');
var sessionService = new (require('./sessionService'))();
var fileUploadService = require('./fileUploadService');

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

    if(recvData.email===db.data.email && recvData.pwd ==='1234'){
        sendData.status = 's';
        sendData.isMaster = true;
        sessionService.registerSession(req,recvData.email,'root',true);
    }
    else{
        sendData.status = 'f';
        sendData.isMaster=false;
    }
    res.send(sendData);
};

//login page for get login data
//type : post
//req : email, pwd
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
            conn.query('SELECT * FROM EDITOR WHERE e_email=? AND e_pwd=?',[recvData.email,d],function(err2,result){
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
    /*
    if(sessionService.getSession().isMaster){
        res.render('masterPage',{status:'s'});
    }
    else{
        res.render('masterPage',{status:'f'});
    }
    */

    res.render('masterPage',{status:'s'});
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
    //test for if
    //if(!sessionService.isMaster(req)){
    if(0){
        console.log('/cate/list,  not master');
        res.json({status:'f'});
        return;
    }
    else{
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C /cate/list, ',err);
                res.json({status:'f'});
                return;
            }
            else{
                var query = 'SELECT * FROM CATEGORY';
                conn.query(query,[],function(err2,result){
                    if(err2){
                        console.log('err S /cate/List, ',err);
                        res.json({status:'f'});
                        conn.release();
                        return;
                    }
                    else{
                        var arr = [];
                        for (var i=0; i<result.length;i++){
                            var d = {
                                cateID : result[i].cate_idx,
                                cateName : result[i].cate_name,
                                cateURL : result[i].cate_url
                            };
                            arr.push(d);
                        }
                        var sendData = {
                            status : 's',
                            categoryNum : result.length,
                            categorys : arr
                        };
                        res.render('category',sendData);
                        conn.release();
                    }
                });
            }
        });
    }


/*
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
    */

};

/*
 * category add
 * type : post
 * req : categoryID, categoryName, categoryImage
 * res : status
 * */
exports.cateAdd = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    //for test
    //if(!sessionService.isMaster(req)){
    if(0){
        console.log('/category/add, not master');
        res.json({status:'f',msg : 'no master'});
        return;
    }
    else{
        if(typeof recvData.categoryID === 'undefined' || typeof recvData.categoryName === 'undefined' ) {
            console.log('/category/add no cateID OR no cateName');
            res.json({status:'f',msg:'no data'});
            return;
        }

        if(typeof req.files.categoryImage === 'undefined' || req.files.categoryImage == null){
            console.log('/category/add no categoryImage');
            res.json({status:'f',msg:'no image file'});
            return;
        }

        //TODO : file check, categoryImage
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C, /cate/add, ',err);
                res.json({status:'f'});
                return;
            }
            else{
                var q = 'INSERT INTO CATEGORY (cate_idx,cate_name,cate_url) VALUES (?,?,?)';
                var cate_img = fileUploadService.fileUpload('cate',req.files.categoryImage).path;
                var params = [parseInt(recvData.categoryID),recvData.categoryName.toString(),cate_img];
                conn.query(q,params,function(err2,result){
                    if(err2){
                        console.log('err I, /cate/add, ',err2);
                        res.json({status:'f', msg:'query error'});
                        conn.release();
                        return;
                    }
                    else{
                        if(result.affectedRows==1){
                            res.json({status:'s'});
                        }
                        else{
                            res.json({status:'f', msg : 'not affected'});
                        }
                        conn.release();
                    }
                });
            }
        });
    }
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
    if(!sessionService.isMaster(req)){
        console.log('/category/update,  not master');
        res.json({status:'f'});
        return;
    }
    else{

    }

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
    //test for if
    //if(sessionService.isMaster(req)){
    if(0){
        console.log('/category/del,  not master');
        res.json({status:'f'});
        return;
    }
    else{
        if(typeof recvData.categoryID === 'undefined' || recvData.categoryID.length == 0){
            console.log('/category/del, no cateID');
            res.json({status : 'f'});
            return;
        }

        db.pool.getConnection(function(err, conn){
            if(err){
                console.log('err C /category/del, ', err);
                res.json({status : 'f'});
                return;
            }
            else{
                var query = 'DELETE FROM CATEGORY WHERE cate_idx=?';
                conn.query(query,[recvData.categoryID],function(err2, result){
                    if(err2){
                        console.log('err D /category/del, ', err2);
                        res.json({ status : 'f'});
                        conn.release();
                        return;
                    }
                    else{
                        res.json({status : 's'});
                        conn.release();
                    }
                });
            }
        });
    }


};

/*
 * editor list
 * type : get
 * req : pageNum
 * res : status, editors
 * */
exports.editorList = function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);


    //TODO : check session is master
    //test for if
    //if(!sessionService.isMaster(req)){
    if(0){
        console.log('/editor/list,  not master');
        res.json({status:'f'});
        return;
    }
    else{
         if(typeof recvData.pageNum === 'undefined' || recvData.pageNum < 0){
         console.log('err /editor/list , no pageNum');
         res.json({status:'f'});
         return;
         }
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C /editor/List, ',err);
                res.json({status:'f'});
                return;
            }
            else{
                var query = 'SELECT * FROM EDITOR LIMIT ?, 20';
                conn.query(query,[parseInt(recvData.pageNum)*20],function(err2,result){
                    if(err2){
                        console.log('err S /editor/list, ',err);
                        res.json({status:'f'});
                        conn.release();
                        return;
                    }
                    else{
                        var arr = [];
                        for(var i=0; i<result.length;i++){
                            var d = {
                                editorEmail : result[i].e_email,
                                editorName : result[i].e_name,
                                editorNick : result[i].e_nickname,
                                editorCate : result[i].e_category,
                                editorIntro : result[i].e_intro,
                                editorThumnail : result[i].e_thumnail,
                                editorValid : result[i].isValid
                            };
                            arr.push(d);
                        }

                        var sendData = {
                            status : 's',
                            editorsNum : arr.length,
                            editors : arr
                        };
                        res.render('editor',sendData);
                        conn.release();
                    }
                });
            }
        });
    }

/*
    var renderData = {
        status:'s',
        editorsNum : 3,
        editors:[
            {
                editorEmail:"pineoc@naver.com",
                editorName:"lee",
                editorNick:"namu",
                editorCate : 2,
                editorIntro : 'asdqwezxc',
                editorThumnail : "http://localhost:3000/img/editor/lee.png",
                editorValid : 1
            },
            {
                editorEmail:"ssc@naver.com",
                editorName:"doo",
                editorNick:"da",
                ditorCate : 2,
                editorIntro : 'asdqwezxc123123',
                editorThumnail : "http://localhost:3000/img/editor/doo.png",
                editorValid : 1
            },
            {
                editorEmail:"sdc@naver.com",
                editorName:"soo",
                editorNick:"mm",
                editorCate : 2,
                editorIntro : 'asd3q333w3e313323zxc',
                editorThumnail : "http://localhost:3000/img/editor/soo.png",
                editorValid : 1
            }
        ]
    };

    res.render('editor',renderData);
*/

};

/*
 * editor add
 * type : post
 * req : editorEmail, editorPwd, editorName, editorCate,
 *       editorNick, editorIntro, thumnailImg
 * res : status
 * */
exports.editorAdd = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    //test for if
    //if(!sessionService.isMaster(req)){
    if(0){
        console.log('/master/editor/add,  not master');
        res.json({status:'f'});
        return;
    }
    else{
        //TODO : check datas is null and valid

        //editorEmail check
        if(typeof recvData.editorEmail === 'undefined' || recvData.editorEmail.length == 0){
            console.log('/master/editor/add, no email');
            res.json({status:'f'});
            return;
        }
        //editorPwd check
        if(typeof recvData.editorPwd === 'undefined' || recvData.editorPwd.length == 0){
            console.log('/master/editor/add, no pwd');
            res.json({status:'f'});
            return;
        }
        //editorName check
        if(typeof recvData.editorName === 'undefined' || recvData.editorName.length == 0){
            console.log('/master/editor/add, no name');
            res.json({status:'f'});
            return;
        }
        //editorCate check
        if(typeof recvData.editorCate === 'undefined' || recvData.editorCate.length == 0 || typeof parseInt(recvData.editorCate) !== 'number'){
            console.log('/master/editor/add, no category');
            res.json({status:'f'});
            return;
        }
        //editorNick check
        if(typeof recvData.editorNick === 'undefined' || recvData.editorNick.length == 0){
            console.log('/master/editor/add, no nick');
            res.json({status:'f'});
            return;
        }


        var file_thumnail = null;
        var fileUpload_result;
        //TODO : file upload and use result
        if(typeof req.files.editorThumnail !== 'undefined' && req.files.editorThumnail != null){
            fileUpload_result = fileUploadService.fileUpload('editor/'+recvData.editorName.toString(),req.files.editorThumnail);
            //console.log('file upload result',fileUpload_result);
            file_thumnail = fileUpload_result.path;
        }

        //TODO : INSERT INTO EDITOR TABLE these datas
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C /editor/add, ',err);
                res.json({status:'f'});
                return;
            }
            else{
                //hash for password
                var shasum = crypto.createHash('sha1');
                shasum.update(recvData.editorPwd);
                var d = shasum.digest('hex');
                console.log('sha success ',d);
                var q = 'INSERT INTO EDITOR (e_name, e_email, e_nickname, e_pwd, e_thumnail, e_category, e_intro, isValid) ' +
                    'VALUES(?,?,?,?,?,?,?,1)';
                var params = [recvData.editorName.toString(), recvData.editorEmail.toString(),
                    recvData.editorNick.toString(), d.toString(), file_thumnail,
                    parseInt(recvData.editorCate), recvData.editorIntro.toString()];
                conn.query(q,params,function(err2,result){
                    if(err2){
                        console.log('err I /editor/add, ',err2);
                        res.json({status:'f'});
                        conn.release();
                        return;
                    }
                    else{
                        //TODO : result send, res.json()
                        if(result.affectedRows==1){
                            console.log('editor add success');
                            res.json({status:'s'});
                            /*
                            res.writeHead(200,{
                                'Location' : '/web/master/editor'
                            });*/
                        }
                        else{
                            console.log('err S /editor/add, ',err);
                            res.json({status:'f'});
                        }
                        conn.release();
                    }
                });
            }
        });
    }
};

/*
 * editor delete
 * type : post
 * req : editorEmail
 * res : status
 * */
exports.editorDel = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    //test for if
    //if(!sessionService.isMaster(req)){
    if(0){
        console.log('/editor/delete,  not master');
        res.json({status:'f'});
        return;
    }
    else{
        //TODO : check datas is null and valid
        //editorEmail check
        if(typeof recvData.editorEmail === 'undefined' || recvData.editorEmail.length == 0){
            console.log('/editor/del, no email');
            res.json({status:'f',msg:'no email'});
            return;
        }

        //TODO : DELETE to EDITOR TABLE these datas
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C /editor/del, ',err);
                res.json({status:'f',msg:'connection error'});
                return;
            }
            else{
                var query = 'UPDATE EDITOR SET isValid=0 WHERE e_email=?';
                conn.query(query,[recvData.editorEmail],function(err2,result){
                    if(err2){
                        console.log('err U /editor/del, ',err2);
                        res.json({status:'f',msg:'query error'});
                        conn.release();
                        return;
                    }
                    else{
                        if(result.changedRows==1){
                            res.json({status:'s'});
                        }
                        else{
                            res.json({status:'f',msg:'already changed to invalid'});
                        }
                        conn.release();
                    }
                });
            }
        });
    }
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
    //test for if
    //if(sessionService.isMaster(req)){
    if(0){
        console.log('/master/board,  not master');
        res.json({status:'f'});
        return;
    }
    else{
         if(typeof recvData.pageNum === 'undefined' || recvData.pageNum < 0){
         console.log('err /master/board , no pageNum');
         res.json({status:'f'});
         return;
         }
        //TODO : SELECT data from board TABLE
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C /board/list, ',err);
                res.json({status:'f'});
                return;
            }
            else{
                var query = 'SELECT * FROM ('
                    + 'SELECT BOARD.b_idx, BOARD.e_name, EDITOR.e_nickname, BOARD.category, BOARD.title, '
                    + 'BOARD.likes, BOARD.datetime, BOARD.isValid '
                    + 'FROM BOARD JOIN EDITOR '
                    + 'ON BOARD.e_name = EDITOR.e_name) '
                    + ' t1 JOIN CATEGORY ON t1.category = CATEGORY.cate_idx '
                    + 'GROUP BY b_idx LIMIT ?, 20';
                //var query = 'SELECT * FROM BOARD NATURAL JOIN EDITOR NATURAL JOIN CATEGORY GROUP BY b_idx LIMIT ?, 20';
                conn.query(query,[parseInt(recvData.pageNum)*20],function(err2,result){
                    if(err2){
                        console.log('err S /web/master/board, ',err2);
                        res.json({status:'f'});
                        conn.release();
                        return;
                    }
                    else{
                        var arr = [];
                        for(var i=0; i<result.length;i++){
                            var d = {
                                contentID : result[i].b_idx,
                                writer : result[i].e_nickname,
                                title : result[i].title,
                                categoryID : result[i].category,
                                categoryName : result[i].cate_name,
                                like : result[i].likes,
                                datetime : result[i].datetime,
                                isValid : result[i].isValid
                            };
                            arr.push(d);
                        }
                        var renderData = {
                            status : 's',
                            contentsNum : arr.length,
                            datas : arr
                        };
                        res.render('management',renderData);
                        conn.release();
                    }
                });
            }
        });
    }

/*
    var renderData = {
        status : 's',
        contentsNum : 10,
        datas:[
            {
                "contentID":1,
                "writer":"asd",
                "title":"qwert",
                "categoryID":2,
                "categoryName":"car",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":2,
                "writer":"asd",
                "title":"qwert33",
                "categoryID":2,
                "categoryName":"car",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":3,
                "writer":"asd",
                "title":"qwert22",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":4,
                "writer":"asd4",
                "title":"qwert2244",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":5,
                "writer":"asd5",
                "title":"qwert2255",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":6,
                "writer":"asd6",
                "title":"qwert2266",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":7,
                "writer":"asd7",
                "title":"qwert2277",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":8,
                "writer":"asd8",
                "title":"qwert2288",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":9,
                "writer":"asd9",
                "title":"qwert2299",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":10,
                "writer":"asd10",
                "title":"qwert2200",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            }
        ]
    };


    res.render('management',renderData);
*/

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
 * board delete, (set isValid = false)
 * type : post
 * req : contentID
 * res : status
 * */
exports.boardDel = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master or editor validation
    //test for if
    //if(!sessionService.hasSession(req)){
    if(0){
        console.log('invalid approach, /board/del');
        res.json({status:'f'});
        return;
    }
    else{
        //TODO : DB UPDATE board TABLE, valid set false
        //To check that whether b_idx is valid or not
        if(typeof recvData.contentID === 'undefined' || recvData.contentID.length == 0){
            console.log('/board/delete, no contentID');
            res.json({status : 'f'});
            return;
        }

        db.pool.getConnection(function(err, conn){
            if(err){
                console.log('err C /board/del, ', err);
                res.json({status : 'f'});
                return;
            }
            else{
                var query = 'UPDATE BOARD SET isValid=0 WHERE b_idx=?';
                conn.query(query,[recvData.contentID],function(err2,result){
                    if(err2){
                        console.log('err U /board/del, ', err2);
                        res.json({status : 'f'});
                        conn.release();
                        return;
                    }
                    else{
                        if(result.changedRows==1){
                            res.json({status : 's'});
                        }
                        else{
                            res.json({status : 'f'});
                        }
                        conn.release();
                    }
                });
            }
        });
    }
};



/*
* board drop (drop from table)
* type : post
* req : contentID
* res : status
* */
exports.boardDrop = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master validation
    //test for if
    //if(!sessionService.isMaster(req)){
    if(0){
        console.log('invalid approach, /board/drop');
        res.json({status:'f'});
        return;
    }
    else{
        if(typeof recvData.contentID === 'undefined' || recvData.contentID.length == 0){
            console.log('/board/drop, no contentID');
            res.json({status : 'f',msg:'no board id'});
            return;
        }

        db.pool.getConnection(function(err, conn){
            if(err){
                console.log('err C /board/drop, ', err);
                res.json({status : 'f',msg:'connection error'});
                return;
            }
            else{
                var query = 'DELETE FROM BOARD WHERE b_idx=?';
                conn.query(query,[recvData.contentID],function(err2,result){
                    if(err2){
                        console.log('err U /board/drop, ', err2);
                        res.json({status : 'f',msg:'query error'});
                        conn.release();
                        return;
                    }
                    else{
                        if(result.affectedRows==1){
                            res.json({status : 's'});
                        }
                        else{
                            res.json({status : 'f',msg:'not affected'});
                        }
                        conn.release();
                    }
                });
            }
        });
    }
};

exports.boardWriteGet = function(req,res){
    res.render('writeConsidertaions',{status:'s'});
};

/*
 * board write
 * type : post
 * req : title, category, thumnail(file),
 *       contents(array), images(file array)
 * res : status
 * */
exports.boardWrite = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);


    //TODO : check session is master or editor validation
    if(!sessionService.hasSession(req)){
        console.log('invalid approach, /boardWrite');
        res.json({status:'f'});
        return;
    }

    //define contentsData for check valid
    var contentsArr = [];
    for (var i = 0; i < recvData.contents.length; i++){
        if(recvData.contents[i] !== ''){
            contentsArr.push(recvData.contents[i]);
        }
    }

    //files check and sort
    var filesArr = [];
    for (var i = 0; i < req.files.length; i++){
        if(req.files.images[i].size !== 0){
            filesArr.push(req.files.images[i]);
        }
    }

    //contents count check
    if(typeof recvData.contents === 'undefined' || contentsArr.length < 3){
        console.log('not enough to write board');
        res.json({status:'f',msg:'not enough contents'});
        return;
    }

    //file count check
    if(typeof req.files.length === 'undefined' || filesArr.length < 3){
        console.log('not valid to write board files and data');
        res.json({status:'f',msg:'invalid data form'});
        return;
    }

    var userData = sessionService.getSession(req);

    //TODO : files upload + contents
    var contentsData = [];
    var imagesData = [];
    var thumnail_image = fileUploadService.fileUpload(('board/'+userData.userName).toString(),req.files.thumnail).path;
    for(var i=0;i<contentsArr.length;i++){
        var data_content = contentsArr[i];
        contentsData.push(data_content);
        var data_image = filesArr[i];
        imagesData.push(fileUploadService.fileUpload(('board/'+userData.userName).toString(),data_image).path);
    }

    //TODO : DB INSERT BOARD
    db.pool.getConnection(function(err,conn){
        if(err){
            console.log('err C, /board/write, ',err);
            res.json({status:'f'});
            return;
        }
        else{
            var query = 'INSERT INTO BOARD(e_name,category,title,thumnail,likes,pagesNum,contents,images,isValid) ' +
                'VALUES(?,?,?,?,0,?,?,?,1)';
            var param_arr = [userData.userName,parseInt(recvData.category),recvData.title,thumnail_image,
            parseInt(contentsData.length),JSON.stringify(contentsData),JSON.stringify(imagesData)];
            conn.query(query,param_arr,function(err2,result){
                if(err2){
                    console.log('err I /board/write, ',err2);
                    res.json({status:'f'});
                    conn.release();
                    return;
                }
                else{
                    if(result.affectedRows == 1){
                        console.log('write board success');
                        res.json({status:'s'});
                    }
                    else{
                        console.log('write board not affected');
                        res.json({status:'f'});
                    }
                    conn.release();
                }
            });
        }
    });
};

/*
 * board write
 * type : post
 * req : title, category, thumnail(file),
 *       contents(array), images(file array),
 *       editorName
 * res : status
 * */
exports.boardWrite_test = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);


    //TODO : check session is master or editor validation
    /*
    if(!sessionService.hasSession(req)){
        console.log('invalid approach, /boardWrite');
        res.json({status:'f'});
        return;
    }
    */
    var userData = {};
    userData.userName = recvData.editorName;

    //define contentsData for check valid
    var contentsArr = [];
    for (var i = 0; i < recvData.contents.length; i++){
        if(recvData.contents[i] !== ''){
            contentsArr.push(recvData.contents[i]);
        }
    }

    //files check and sort
    var filesArr = [];
    for (var i = 0; i < req.files.images.length; i++){
        if(req.files.images[i].size !== 0){
            filesArr.push(req.files.images[i]);
        }
    }
    console.log('contents l : ', contentsArr.length);
    console.log('files l : ', filesArr.length);

    //contents count check
    if(typeof recvData.contents === 'undefined' || contentsArr.length < 3){
        console.log('not enough to write board');
        res.json({status:'f',msg:'not enough contents'});
        return;
    }

    //file count check
    if(typeof req.files.images.length === 'undefined' || filesArr.length < 3){
        console.log('not valid to write board files and data');
        res.json({status:'f',msg:'invalid data form'});
        return;
    }

    //category check
    if(typeof recvData.category === 'undefined'){
        console.log('no category');
        res.json({status:'f',msg:'category no data'});
        return;
    }
    if(typeof recvData.title === 'undefined' || recvData.title.length === 0){
        console.log('no title OR no data on title');
        res.json({status:'f',msg:'title no data'});
        return;
    }


    //TODO : files upload + contents
    var contentsData = [];
    var imagesData = [];
    var thumnail_image = fileUploadService.fileUpload(('board/'+userData.userName).toString(),req.files.thumnail).path;
    for(var i = 0; i < contentsArr.length; i++){
        var data_content = recvData.contents[i];
        contentsData.push(data_content);
        var data_image = filesArr[i];
        imagesData.push(fileUploadService.fileUpload(('board/'+userData.userName).toString(),data_image).path);
    }

    //TODO : DB INSERT BOARD
    db.pool.getConnection(function(err,conn){
        if(err){
            console.log('err C, /board/write, ',err);
            res.json({status:'f'});
            return;
        }
        else{
            var query = 'INSERT INTO BOARD(e_name,category,title,thumnail,likes,pagesNum,contents,images,isValid) ' +
                'VALUES(?,?,?,?,0,?,?,?,1)';
            var param_arr = [userData.userName,parseInt(recvData.category),recvData.title,thumnail_image,
                parseInt(contentsData.length),JSON.stringify(contentsData),JSON.stringify(imagesData)];
            conn.query(query,param_arr,function(err2,result){
                if(err2){
                    console.log('err I /board/write, ',err2);
                    res.json({status:'f'});
                    conn.release();
                    return;
                }
                else{
                    if(result.affectedRows == 1){
                        console.log('write board success');
                        res.json({status:'s'});
                    }
                    else{
                        console.log('write board not affected');
                        res.json({status:'f'});
                    }
                    conn.release();
                }
            });
        }
    });
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

    if(typeof recvData.pageNum === 'undefined' || recvData.pageNum < 0){
        console.log('err /board/list , no pageNum');
        res.json({status:'f',msg:'pageNum not in'});
        return;
    }

/*
    //TODO : check session is editor
    if(!sessionService.hasSession(req)){
        console.log('invalid approach, /boardList');
        res.json({status:'f'});
        return;
    }
*/

    //TODO : SELECT data from board TABLE
    db.pool.getConnection(function(err,conn){
        if(err){
            console.log('err C /board/list, ',err);
            res.json({status:'f',msg:'connection error'});
            return;
        }
        else{
            var editorName = sessionService.getSession(req).userName;
            var query = 'SELECT * FROM BOARD WHERE e_name=? LIMIT ?,20';
            conn.query(query,[editorName,parseInt(recvData.pageNum)*20],function(err2,result){
                if(err2){
                    console.log('err U /board/list, ',err2);
                    res.json({status:'f',msg:'query error'});
                    conn.release();
                    return;
                }
                else{
                    var arr = [];
                    for(var i=0; i<result.length;i++){
                        var d = {
                            contentID : result[i].b_idx,
                            writer : result[i].e_nickname,
                            title : result[i].title,
                            categoryID : result[i].category,
                            categoryName : result[i].cate_name,
                            like : result[i].likes,
                            datetime : result[i].datetime,
                            isValid : result[i].isValid
                        };
                        arr.push(d);
                    }
                    var renderData = {
                        status : 's',
                        contentsNum : arr.length,
                        datas : arr
                    };
                    res.render('management',renderData);
                }
                conn.release();

            });

        }
    });

    /*
    var renderData = {
        status : 's',
        contentsNum : 6,
        datas:[
            {
                "contentID":1,
                "writer":"asd",
                "title":"qwert",
                "categoryID":2,
                "categoryName":"car",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":2,
                "writer":"asd",
                "title":"qwert33",
                "categoryID":2,
                "categoryName":"car",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":3,
                "writer":"asd",
                "title":"qwert22",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":4,
                "writer":"asd4",
                "title":"qwert2244",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":5,
                "writer":"asd5",
                "title":"qwert2255",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            },
            {
                "contentID":6,
                "writer":"asd6",
                "title":"qwert2266",
                "categoryID":3,
                "categoryName":"sport",
                "like":3,
                datetime : '20150829T1354',
                isValid : 1
            }
        ]
    };

    res.render('management',renderData);
    */
};

/*
* cloth list
* type : get
* req : pageNum
* res : datas
*
* */
exports.clothList = function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    /*
     if(!sessionService.isMaster(req)){
     console.log('/master/board,  not master');
     res.json({status:'f'});
     return;
     }
     else{


     res.render('management',{status:'s'});
     }
     */

    //TODO : SELECT data from CLOTH table

    var renderData = {
        status : 's',
        clothsNum : 5,
        datas : [
            {
                cloth_idx : 1,
                cloth_cate : 1,
                cloth_name : '셔츠',
                cloth_img : 'localhost:3000/img/cloth/1.png',
                cloth_url : '남정네들 옷1 링크',
                cloth_info : '옷1 정보'
            },
            {
                cloth_idx : 2,
                cloth_cate : 1,
                cloth_name : '셔츠',
                cloth_img : 'localhost:3000/img/cloth/2.png',
                cloth_url : '남정네들 옷2 링크',
                cloth_info : '옷2 정보'
            },
            {
                cloth_idx : 3,
                cloth_cate : 1,
                cloth_name : '셔츠',
                cloth_img : 'localhost:3000/img/cloth/3.png',
                cloth_url : '남정네들 옷3 링크',
                cloth_info : '옷3 정보'
            },
            {
                cloth_idx : 4,
                cloth_cate : 1,
                cloth_name : '셔츠',
                cloth_img : 'localhost:3000/img/cloth/4.png',
                cloth_url : '남정네들 옷4 링크',
                cloth_info : '옷4 정보'
            },
            {
                cloth_idx : 5,
                cloth_cate : 1,
                cloth_name : '셔츠',
                cloth_img : 'localhost:3000/img/cloth/5.png',
                cloth_url : '남정네들 옷5 링크',
                cloth_info : '옷5 정보'
            }
        ]
    };
    res.render('manageClothes',renderData);

};

/*
* cloth add view page
* type : get
* req : none
* res :
*
* */
exports.clothAddView = function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    /*
     if(!sessionService.isMaster(req)){
     console.log('/master/board,  not master');
     res.json({status:'f'});
     return;
     }
     else{


     res.render('management',{status:'s'});
     }
     */

    //var renderData = {};
    //res.render('',renderData);
};

/*
* cloth add
* type : post
* req : cloth_cate, cloth_img, cloth_name, cloth_url, cloth_info
* res : status
*
* */
exports.clothAdd = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    /*
     if(!sessionService.isMaster(req)){
     console.log('/master/board,  not master');
     res.json({status:'f'});
     return;
     }
     else{
     //TODO : INSERT TO CLOTH table cloth informations



     res.render('management',{status:'s'});
     }
     */




};

/*
* cloth delete
* type : post
* req : cloth_idx
* res :
*
* */
exports.clothDel = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    /*
     if(!sessionService.isMaster(req)){
     console.log('/master/board,  not master');
     res.json({status:'f'});
     return;
     }
     else{
     //TODO : INSERT TO CLOTH table cloth informations



     res.render('management',{status:'s'});
     }
     */



};

/*
* file upload test
* type : post
* req : param1, param2, file1, file2, file3
* res : status
* */
exports.fileUploadTest = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    console.log('param1 : ',recvData.param1);
    console.log('param2 : ',recvData.param2);

    if(fileUploadService.fileUpload('file1',req.files.file1).status){
        console.log('file1 success');
    }
    else{
        console.log('file1 fail');
    }

    if(fileUploadService.fileUpload('file2',req.files.file2).status){
        console.log('file2 success');
    }
    else{
        console.log('file2 fail');
    }

    if(fileUploadService.fileUpload('file3',req.files.file3).status){
        console.log('file3 success');
    }
    else{
        console.log('file3 fail');
    }
    res.json({status:'s'});
};

