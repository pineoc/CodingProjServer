

var db = require('./db_config');
var sessionService = new (require('./sessionService'))();
var fileUploadService = require('./fileUploadService');

var crypto = require('crypto');

//login test page
//type : get
//show login test
exports.login_test_get = function(req, res){
    res.render('login', { title: '남정네들' });
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


    //for test
    if(recvData.email===db.data.email && recvData.pwd ==='1234'){
        var sendData = {};
        sendData.status = 's';
        sendData.isMaster = true;
        sessionService.registerSession(req,recvData.email,'root',true);
        res.send(sendData);
        return;
    }



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

/*
 * editor main page
 * type : get
 * req : none
 * res : none
 */
exports.editorMain = function(req,res){
    /*
    if(sessionService.hasSession(req) && sessionService.getSession(req).isMaster==false){
        res.render('editorPage',{status:'s'});
    }
    else{
        res.render('errorPage',{status:'f'});
    }
    */
    res.render('editorPage',{status:'s'});
};

/*
 * editor category page
 * type : get
 * req : none
 * res : none
 * */
exports.e_cateList = function(req,res){

    //if(!sessionService.hasSession(req)){
    if(0){
        console.log('/editor/cateList,  not editor');
        res.render('errorPage');
        return;
    }
    else{
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C /editor/cateList, ',err);
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
                        res.render('editor_category',sendData);
                        conn.release();
                    }
                });
            }
        });
    }
};

/*
 * master main page
 * type : get
 * req : none
 * res : none
 */
exports.masterMain = function(req,res){

    /*
    if(sessionService.getSession(req).isMaster){
        res.render('masterPage',{status:'s'});
    }
    else{
        res.render('errorPage',{status:'f'});
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
                        res.render('master_category',sendData);
                        conn.release();
                    }
                });
            }
        });
    }

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
            var sendData = {};
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

                        sendData = {
                            status : 's',
                            editorsNum : arr.length,
                            editors : arr
                        };
                    }
                });

                var query2 = 'SELECT * FROM CATEGORY';
                conn.query(query2,[],function(err3,result){
                    if(err3){
                        console.log('err S /editor/list during select category', err3);
                        res.json({status : 'f'});
                        conn.release();
                        return;
                    }
                    else{
                        var arr = [];
                        for (var i = 1; i<result.length;i++){
                            var d = {
                                cateID : result[i].cate_idx,
                                cateName : result[i].cate_name
                            };
                            arr.push(d);
                        }

                        sendData['categoryNum'] = arr.length;
                        sendData['categorys'] = arr;
                        res.render('master_editor',sendData);
                        conn.release();
                    }
                });
            }
        });
    }
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
 * editor drop
 * type : post
 * req : editorEmail
 * res : status
 * */
exports.editorDrop = function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);

    //TODO : check session is master
    //test for if
    //if(!sessionService.isMaster(req)){
    if(0){
        console.log('/editor/drop,  not master');
        res.json({status:'f'});
        return;
    }
    else{
        //TODO : check datas is null and valid
        //editorEmail check
        if(typeof recvData.editorEmail === 'undefined' || recvData.editorEmail.length == 0){
            console.log('/editor/drop, no email');
            res.json({status:'f',msg:'no email'});
            return;
        }

        //TODO : DELETE to EDITOR TABLE these datas
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err C /editor/drop, ',err);
                res.json({status:'f',msg:'connection error'});
                return;
            }
            else{
                var query = 'DELETE FROM EDITOR WHERE e_email=?';
                conn.query(query,[recvData.editorEmail],function(err2,result){
                    if(err2){
                        console.log('err D /editor/drop, ',err2);
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
                        res.render('master_management',renderData);
                        conn.release();
                    }
                });
            }
        });
    }
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

    //TODO : check session is editor
    //if(!sessionService.hasSession(req)){
    if(0){
        console.log('invalid approach, /boardList');
        res.json({status:'f',msg:'no session'});
        return;
    }
    else{
        //if(sessionService.isMaster(req)){
            if(1){
            //master - boardAllList
            //TODO : SELECT data from board TABLE
            db.pool.getConnection(function(err,conn){
                if(err){
                    console.log('err C /board/list, ',err);
                    res.json({status:'f',msg:'c, master board list fail'});
                    return;
                }
                else{
                    var query = 'SELECT * FROM ('
                        + 'SELECT BOARD.b_idx, BOARD.e_name, EDITOR.e_nickname, BOARD.category, BOARD.title, '
                        + 'BOARD.likes, DATE_FORMAT(BOARD.datetime,"%Y-%c-%d %H:%i") datetime, BOARD.isValid '
                        + 'FROM BOARD JOIN EDITOR '
                        + 'ON BOARD.e_name = EDITOR.e_name) '
                        + 't1 JOIN CATEGORY ON t1.category = CATEGORY.cate_idx '
                        + 'GROUP BY b_idx LIMIT ?, 20';
                    conn.query(query,[parseInt(recvData.pageNum)*20],function(err2,result){
                        if(err2){
                            console.log('err S /web/board/list, ',err2);
                            res.json({status:'f',msg:'q, master board list fail'});
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
                            res.render('master_management',renderData);
                            conn.release();
                        }
                    });
                }
            });
        }
        else{
            //editor - my board list
            //TODO : SELECT data from board TABLE
            db.pool.getConnection(function(err,conn){
                if(err){
                    console.log('err C /board/list, ',err);
                    res.json({status:'f',msg:'c, editor board list fail'});
                    return;
                }
                else{
                    var editorName = sessionService.getSession(req).userName;
                    /*
                     SELECT b.b_idx, b.e_name, e.e_nickname, b.category, c.cate_name, b.title,
                     b.likes, b.datetime, b.isValid FROM BOARD b
                     INNER JOIN EDITOR e
                     ON b.e_name = e.e_name
                     INNER JOIN CATEGORY c
                     ON b.category = c.cate_idx
                     WHERE e.e_name=?
                     ORDER BY b_idx LIMIT ?,20;
                     */
                    var query = 'SELECT b.b_idx, b.e_name, e.e_nickname, b.category, c.cate_name, b.title,'
                        +'b.likes, DATE_FORMAT(b.datetime,"%Y-%c-%d %H:%i") datetime, b.isValid FROM BOARD b '
                        +'INNER JOIN EDITOR e '
                        +'ON b.e_name = e.e_name '
                        +'INNER JOIN CATEGORY c '
                        +'ON b.category = c.cate_idx '
                        +'WHERE e.e_name=? '
                        +'ORDER BY b_idx LIMIT ?,20';
                    conn.query(query,[editorName,parseInt(recvData.pageNum)*20],function(err2,result){
                        if(err2){
                            console.log('err U /board/list, ',err2);
                            res.json({status:'f',msg:'q, editor board list fail'});
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
                            res.render('master_management',renderData);
                        }
                        conn.release();
                    });
                }
            });
        }
    }
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

        if(sessionService.isMaster(req)){
            //master
            db.pool.getConnection(function(err, conn){
                if(err){
                    console.log('err C /board/del, ', err);
                    res.json({status : 'f'});
                    return;
                }
                else{
                    var query = 'UPDATE BOARD SET isValid=0 WHERE b_idx=?';
                    conn.query(query,[parseInt(recvData.contentID)],function(err2,result){
                        if(err2){
                            console.log('err U /board/del, ', err2);
                            res.json({status : 'f', msg:'q, Board Index error'});
                            conn.release();
                            return;
                        }
                        else{
                            if(result.changedRows==1){
                                res.json({status : 's',msg:'게시 보류 성공'});
                            }
                            else{
                                res.json({status : 'f',msg:'게시 보류 실패'});
                            }
                            conn.release();
                        }
                    });
                }
            });
        }
        else{
            //editor
            var editorName = sessionService.getSession(req).userName;
            db.pool.getConnection(function(err, conn){
                if(err){
                    console.log('err C /board/del, ', err);
                    res.json({status : 'f'});
                    return;
                }
                else{
                    var query = 'UPDATE BOARD SET isValid=0 WHERE b_idx=? AND e_name=?';
                    conn.query(query,[parseInt(recvData.contentID),editorName],function(err2,result){
                        if(err2){
                            console.log('err U /board/del, ', err2);
                            res.json({status : 'f',msg:'q, editor OR board Index not valid'});
                            conn.release();
                            return;
                        }
                        else{
                            if(result.changedRows==1){
                                res.json({status : 's', msg:'게시 보류 성공'});
                            }
                            else{
                                res.json({status : 'f', msg:'게시 보류 실패'});
                            }
                            conn.release();
                        }
                    });
                }
            });
        }
    }
};


/*
 * board drop (delete from table)
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

/*
* board write page view
* type : get
* req : none
* res : none
* */
exports.boardWriteGet = function(req,res){

    db.pool.getConnection(function(err,conn){
        if(err){
            console.log('err C /board/write/get, ',err);
            res.json({status:'f'});
            return;
        }
        else{
            var query = 'SELECT * FROM CATEGORY';
            conn.query(query,[],function(err,result){
                if(err){
                    console.log('err S /board/write/get during select category, ',err);
                    res.json({status:'f',msg:'query error'});
                    conn.release();
                    return;
                }
                else{
                    var arr = [];
                    for (var i = 1; i<result.length;i++){
                        var d = {
                            cateID : result[i].cate_idx,
                            cateName : result[i].cate_name,
                            cateURL : result[i].cate_url
                        };
                        arr.push(d);
                    }
                    var sendData = {
                        status : 's',
                        editorName : sessionService.getSession(req).userName,
                        categoryNum : arr.length,
                        categorys : arr
                    };
                    res.render('writeConsidertaions',sendData);
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
    for (var i = 0; i < req.files.images.length; i++){
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

    var userData = sessionService.getSession(req);

    //TODO : files upload + contents
    var contentsData = [];
    var imagesData = [];
    var thumnail_image_upload_result = fileUploadService.fileUpload(('board/' + userData.userName).toString(), req.files.thumnail);
    if(thumnail_image_upload_result.error){
        console.log('thumnail file upload error : ', thumnail_image_upload_result.msg);
        res.json({
            status : 'f',
            msg : thumnail_image_upload_result.msg});
        return;
    }
    var thumnail_image = thumnail_image_upload_result.path;
    for(var i = 0; i < contentsArr.length; i++){
        var data_content = contentsArr[i];
        contentsData.push(data_content);
        var data_image = filesArr[i];
        var image_upload_result = fileUploadService.fileUpload(('board/' + userData.userName).toString(), data_image);
        if(image_upload_result.error){
            console.log('image file upload error files[%d] : ', i, image_upload_result.msg);
            res.json({
                status : 'f',
                msg : image_upload_result.msg});
            return;
        }
        imagesData.push(image_upload_result.path);
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
            var param_arr = [userData.userName, parseInt(recvData.category), recvData.title, thumnail_image,
                parseInt(contentsData.length), JSON.stringify(contentsData), JSON.stringify(imagesData)];
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
* board view
* type : get
* req : contentID
* res : ~
* */
exports.board_view_func = function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);

    //TODO: board DB data SELECT where category!=1 AND contentID
    db.pool.getConnection(function(err,conn){
        if(err){
            console.log('err conn /view, test cate!=1, ',err);
            res.json({status:'f'});
            return;
        }
        else{
            var query = 'SELECT b_idx, likes, e_name, title, pagesNum, contents, images, ' +
                'DATE_FORMAT(datetime,"%Y-%c-%d %H:%i") datetime FROM BOARD WHERE b_idx=?';
            conn.query(query,[parseInt(recvData.contentID)],function(err2,result){
                if(err2){
                    console.log('err S /view, test cate!=1, ',err2);
                    res.json({status:'f'});
                    conn.release();
                    return;
                }
                else{
                    if(result.length<1){
                        console.log('err S /view, test cate!=1, no data');
                        res.json({status:'f'});
                        conn.release();
                        return;
                    }
                    var arr = [];
                    var c_data;
                    var i_data;
                    //error check
                    try {
                        c_data = JSON.parse(result[0].contents);
                        i_data = JSON.parse(result[0].images);
                    } catch(e) {
                        console.log('parse error : ',e);
                        res.json({status:'f',msg:'parse error'});
                        return;
                    }

                    for (var i = 0; i < c_data.length; i++){
                        var data = {
                            img : i_data[i],
                            content : c_data[i]
                        };
                        arr.push(data);
                    }

                    var sendData = {
                        status : 's',
                        contentID : result[0].b_idx,
                        datetime : result[0].datetime,
                        likes : result[0].likes,
                        editor : result[0].e_name,
                        title : result[0].title,
                        pagesNum : result[0].pagesNum,
                        datas : arr
                    };
                    res.render('board_view', sendData);
                    conn.release();
                }
            });
        }
    });
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

