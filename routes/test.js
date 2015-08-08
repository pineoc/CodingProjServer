/**
 * Created by pineoc on 2015-07-25.
 */
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var web = require('./test_web');
var db = require('./db_config');


//test code start
const CLOTHIDX = 1;

//login
// first time, sign + login, after then login
// type : post
// req : appID, nickName, key(first time)
// res : status, appID, nickName
router.post('/app/login',function(req,res){
    var recvData = req.body;
    console.log('recv Data : ' , recvData);

    //TODO: if first, INSERT to USER, else, SELECT FROM USER
    if(recvData.appID.length==0){
        if(typeof recvData.nickName === 'undefined' || typeof recvData.key === 'undefined'){
            console.log('undefined datas');
            res.json({status:'f'});
            return;
        }

        //access first Time, sign
        //TODO : INSERT INTO USER
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err conn /login sign, ',err);
                res.json({status:'f'});
                return;
            }
            else{
                //make sha1 hash for user_token
                var shasum = crypto.createHash('sha1');
                shasum.update(recvData.key);
                var d = shasum.digest('hex');
                conn.query('INSERT INTO USER(user_token, nickName) VALUES (?,?)',[d,recvData.nickName],function(err2,result){
                    if(err2){
                        console.log('err I sign, ', err2);
                        res.json({status:'f'});
                        conn.release();
                        return;
                    }
                    else{
                        var sendData = {
                            status : 's',
                            appID : d,
                            nickName : recvData.nickName
                        };
                        res.json(sendData);
                    }
                    conn.release();
                });
            }
        });
    }
    else{
        //login
        //TODO : SELECT FROM USER
        db.pool.getConnection(function(err,conn){
            if(err){
                console.log('err conn /login login, ',err);
                res.json({status:'f'});
                return;
            }
            else{
                conn.query('SELECT * FROM USER WHERE user_token=?',[recvData.appID], function(err2,result){
                    if(err2){
                        console.log('err S /login login, ', err2);
                        res.json({status:'f'});
                        conn.release();
                        return;
                    }
                    else{
                        console.log('login success');
                        res.json({status:'s'});
                    }
                    conn.release();
                });
            }
        });
    }
});

/* menu (categorys)
 show menus
 type : get
 req : none
 res : status, categorys(array + object)
*/

router.get('/app/menu',function(req,res){
    var recvData = req.body;
    console.log('recvData : ',recvData);


    //TODO: DB category SELECT

    db.pool.getConnection(function(err,conn){
        if(err){
            console.log('err get conn, categoryList : ',err);
            res.json({status:'f'});
            return;
        }
        else{
            conn.query('SELECT * FROM CATEGORY',[],function(err2, result){
                if(err2){
                    console.log('err S category : ',err2);
                    res.json({status:'f'});
                    conn.release();
                    return;
                }
                else{
                    var sendData = {};
                    sendData.status = 's';
                    sendData.categorys = result;
                    res.json(sendData);
                }
                conn.release();
            });

        }
    });
});


/*
* board list function
* type : GET
* req : cateID, pageNum
* res : if cateID==1 status, contentNum, pageContentsNum, rankdedDatas, datas
*       else         status, contentNum, pageContentsNum, datas
* */
router.get('/app/board', function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);

    if(recvData.cateID == CLOTHIDX){
        //cloth board

        //TODO: board DB data SELECT where category=1
        var sendData = {
            "status" : "s",
            "contentNum" : 123,
            "pageContentsNum" : 6,
            "rankedDatas":[
                {
                    "contentIdx":1,
                    "likes":12,
                    "clothIdxs":[1,2,3,4,5,6],
                    "dateTime":"20150507T2311"
                },
                {
                    "contentIdx":2,
                    "likes":10,
                    "clothIdxs":[11,21,31,444,325,226],
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":3,
                    "likes":9,
                    "clothIdxs":[1,8,13,24,35,16],
                    "dateTime":"20150511T1122"
                }
            ],
            "datas":[
                {
                    "contentIdx":11,
                    "likes":1,
                    "clothIdxs":[1,2,3,4,5,6],
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":21,
                    "likes":2,
                    "clothIdxs":[1,2,3,4,5,6],
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":31,
                    "likes":1,
                    "clothIdxs":[1,2,3,4,5,6],
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":41,
                    "likes":2,
                    "clothIdxs":[1,2,3,4,5,6],
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":12,
                    "likes":1,
                    "clothIdxs":[1,2,3,4,5,6],
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":13,
                    "likes":2,
                    "clothIdxs":[1,2,3,4,5,6],
                    "dateTime":"20150509T1134"
                }
            ]
        };
        res.json(sendData);
    }
    else{
        //normal board

        //TODO: board DB data SELECT where category!=1

        var sendData = {
            status:"s",
            contentNum:123,
            pageContentsNum : 6,
            datas:[
                {
                    "contentIdx":11,
                    "likes":1,
                    "title":"asdasd",
                    "titleImg":"http://localhost/img/url/img1.png",
                    "editor":"qqq",
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":14,
                    "likes":1,
                    "title":"asdasd",
                    "titleImg":"http://localhost/img/url/img1.png",
                    "editor":"qqq",
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":132,
                    "likes":1,
                    "title":"asdasd",
                    "titleImg":"http://localhost/img/url/img1.png",
                    "editor":"qqq",
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":114,
                    "likes":1,
                    "title":"asdasd",
                    "titleImg":"http://localhost/img/url/img1.png",
                    "editor":"qqq",
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":115,
                    "likes":1,
                    "title":"asdasd",
                    "titleImg":"http://localhost/img/url/img1.png",
                    "editor":"qqq",
                    "dateTime":"20150509T1134"
                },
                {
                    "contentIdx":116,
                    "likes":1,
                    "title":"asdasd",
                    "titleImg":"http://localhost/img/url/img1.png",
                    "editor":"qqq",
                    "dateTime":"20150509T1134"
                }
            ]
        };
        res.json(sendData);
    }
});

/*
* board content view function
* type : GET
* req : cateID, contentID
* res : cateID==1 > status, like, editor, datas(array)
*       cateID!=1 > status, like, editor, title, pageNum, datas(array)
* */
router.get('/app/board/view',function(req,res){
    var recvData = req.query;
    console.log('recvData : ',recvData);

    if(recvData.cateID == CLOTHIDX){
        //cloth content view

        //TODO: board DB data SELECT where category=1 AND contentID

        var sendData = {
            status : 's',
            contentID:123,
            likes:12,
            editor:'asd',
            datas : [1,2,3,4,5,6]
        };
        res.json(sendData);
    }
    else{
        //normal board view

        //TODO: board DB data SELECT where category!=1 AND contentID

        var sendData = {
            status : 's',
            contentID:123,
            likes : 12,
            editor : 'asd',
            title : 'asdasdasd',
            pageNum : 10,
            datas : [
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe1'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe2'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe3'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe4'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe5'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe6'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe7'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe8'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe9'
                },
                {
                    img : "http://localhost:3000/img/url/1.png",
                    content : 'asddwqwe10'
                }
            ]
        };
        res.json(sendData);
    }
});








/* write (옷입히기)
 type : POST
 req : appID, nickName, data1, data2, data3, data4, data5, data6
 res : status, contentID
*/
router.post('/app/board/write', function(req, res){
    var recvData = req.body;
    console.log('recvData : ', recvData);

    //DB에서 무언가를 해줘야겠지요?

    var sendData = {
        status : 's',
        contentID : '123'
        //DB단계 완료하면 contentID는 자동적으로 부여될 것.
    };


    res.json(sendData);
});


/* like
 type : POST
 req : contentID, appID
 res : status, contentID, like
*/
router.post('/app/board/like', function(req, res){
    var recvData = req.body;
    console.log('recvData : ', recvData);

    //DB에서 contentID에 해당하는 글의 like을 받아오게해야함.
    var like = 2;

    var sendData = {
        status : 's',
        contentID : '123'
    };
    sendData.like = like;

    res.json(sendData);
});


/* commentwrite
 type : POST
 req : appID, contentID, comment
 res : status
*/
router.post('/app/board/commentwrite', function(req, res){
    var recvData = req.body;
    console.log('recvData : ', recvData);


    var sendData = {
        status : 's'
    };

    res.json(sendData);
});

/* commentview
 type : GET
 req : contentID
 res : status, commentNum, data(array + object)
*/
router.get('/app/board/commentview', function(req, res){
    var recvData = req.body;
    console.log('recvData : ', recvData);

    //DB에서 contentID에 따른 글의 comment정보를 받아온다. 
    var data = [
        {
            "nick" : "a1",
            "comment" : "c1"
        },
        {
         "nick" : "a2",
         "comment" : "c2"
        },
        {
            "nick" : "a3",
            "comment" : "c3"
        }
    ];


    var sendData = {};
    sendData.status = 's';
    sendData.commentNum = '3';
    sendData.datas = data;


    res.json(sendData);
});

//login test page
//type : get
//show login test
router.get('/web/login_test',web.login_test_get);

//login test request
//type : post
//get data from test_web.ejs
//req : email, pwd
//res : status, isMaster
router.post('/web/login_test',web.login_test_post);

//login page for get login data
//type : post
//req : id, pwd
//res : status, isMaster
router.post('/web/login',web.login);

/*
* master main page
* type : get
* req : none
* res : none
* */
router.get('/web/master/main',web.masterMain);

/*
* category list
* type : get
* req : none
* res : status, categoryNum, categorys
* */
router.get('/web/master/category',web.cateList);

/*
 * category add
 * type : post
 * req : addCategory
 * res : status
 * */
router.post('/web/master/category/add',web.cateAdd);

/*
 * category update
 * type : post
 * req : cateID, updateCategory
 * res : status
 * */
router.post('/web/master/category/update',web.cateUpdate);

/*
 * category delete
 * type : post
 * req : cateID
 * res : status
 * */
router.post('/web/master/category/delete',web.cateDel);

/*
 * editor list
 * type : get
 * req :
 * res : status, editors
 * */
router.get('/web/master/editor',web.editorList);

/*
 * editor add
 * type : post
 * req : editorID, editorEmail, editorPwd, editorName, editorNick, editorCate
 * res : status
 * */
router.post('/web/master/editor/add',web.editorAdd);

/*
 * editor delete
 * type : post
 * req : editorID
 * res : status
 * */
router.post('/web/master/editor/delete',web.editorDel);

/*
 * all board content list
 * type : get
 * req : pageNum
 * res : status, contentNum, datas
 * */
router.get('/web/master/board',web.boardAllList);

/*
 * board update
 * type : post
 * req : contentID,
 * res : status
 * */
router.post('/web/board/update',web.boardUpdate);

/*
 * board delete
 * type : post
 * req : contentID
 * res : status
 * */
router.post('/web/board/delete',web.boardDel);

/*
 * board write
 * type : get
 * req : none
 * res : status
 * */
router.get('/web/board/write',web.boardWriteGet);

/*
 * board write
 * type : post
 * req : title, category, thumnail(file),
 *       datas({file, content} array)
 * res : status
 * */
router.post('/web/board/write',web.boardWrite);

/*
 * board content list
 * type : get
 * req : pageNum
 * res : status, contentNum, datas
 * */
router.get('/web/board/list',web.boardList);


router.get('/web/board_test',function(req,res){
    var data ={};
    data.arr = [1,2];
    data.title = "test board";

    res.render('test_board',{datas : data});
});

module.exports = router;