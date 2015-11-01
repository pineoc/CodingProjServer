var express = require('express');
var router = express.Router();

var path = require('path');
var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var multipart = require('connect-multiparty');

var multipartMiddleware = multipart();

var web = require('./web');
var db = require('./db_config');
var fileUploadService = require('./fileUploadService');

//test code start
//namjungnaedle category number
const CLOTHIDX = 1;
var urlpath_base = db.server_data.domain;

//login
// first time, sign + login, after then login
// type : post
// req : appID, nickName, key(first time)
// res : status, appID, nickName
router.post('/app/login',function(req,res){
  var recvData = req.body;
  console.log('recv Data : ' , recvData);
  if(typeof recvData.appID === 'undefined'){
    console.log('undefined appID');
    res.json({status:'f'});
    return;
  }

  //TODO: if first, INSERT to USER, else, SELECT FROM USER
  if(recvData.appID.length==0){
    if(typeof recvData.nickName === 'undefined' || typeof recvData.key === 'undefined'){
      console.log('undefined datas, nick or key');
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
      console.log('err C, /menu categoryList : ',err);
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
          var arr = [];
          for (var i=0; i<result.length;i++){
            var d = {
              cate_idx : result[i].cate_idx,
              cate_name : result[i].cate_name,
              cate_url : urlpath_base + result[i].cate_url
            };
            arr.push(d);
          }
          var sendData = {};
          sendData.status = 's';
          sendData.categorys = arr;
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

    db.pool.getConnection(function(err,conn){
      if(err){
        console.log('err conn /board cate1, ',err);
        res.json({status:'f'});
        return;
      }
      else{
        conn.query('SELECT * FROM CLOTH_BOARD ORDER BY likes DESC LIMIT 3',[],function(err2,result){
          if(err2){
            console.log('err S /board cate1, ',err2);
            res.json({status:'f'});
            conn.release();
            return;
          }
          else{
            conn.query('SELECT * FROM CLOTH_BOARD LIMIT ?, 10',[parseInt(recvData.pageNum)*10],function(err3,result2){
              if(err3){
                console.log('err S2 /board cate1, ',err3);
                res.json({status:'f'});
                conn.release();
                return;
              }
              else{
                var arr = [];
                for(var i=0; i<result2.length; i++){
                  var d = {
                    contentIdx : result2[i].cb_idx,
                    likes : result2[i].likes,
                    clothIdxs :[result2[i].head,result2[i].upperBody,result2[i].lowerBody,result2[i].coat],
                    datetime : result2[i].datetime
                  };
                  arr.push(d);
                }
                var sendData ={};
                sendData.status = 's';
                sendData.rankedData = result;
                sendData.datas = arr;
                sendData.contentsNum = arr.length;
                res.json(sendData);
              }
              conn.release();
            });
          }
        });
      }
    });
  }
  else{
    //normal board

    //TODO: board DB data SELECT where category!=1
    db.pool.getConnection(function(err,conn){
      if(err){
        console.log('err conn /board cate!=1, ',err);
        res.json({status:'f'});
        return;
      }
      else{
        var query = 'SELECT * FROM BOARD WHERE category=? LIMIT ?, 10';
        conn.query(query,[parseInt(recvData.cateID),parseInt(recvData.pageNum)*10],function(err2,result){
          if(err2){
            console.log('err S /board cate1, ',err2);
            res.json({status:'f'});
            conn.release();
            return;
          }
          else{
            var arr = [];
            for (var i=0; i<result.length;i++){
              var data = {};
              data.contentIdx = result[i].b_idx;
              data.likes = result[i].likes;
              data.title = result[i].title;
              data.titleImg = urlpath_base + result[i].thumnail;
              data.editor = result[i].editor;
              data.dateTime = result[i].datetime;
              arr.push(data);
            }
            var sendData = {
              status : 's',
              contentsNum : result.length,
              datas : arr
            };
            res.json(sendData);
            conn.release();
          }
        });
      }
    });
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
    db.pool.getConnection(function(err,conn){
      if(err){
        console.log('err conn /view cate=1, ',err);
        res.json({status:'f'});
        return;
      }
      else{
        var query = 'SELECT * FROM CLOTH_BOARD NATURAL JOIN USER WHERE cb_idx=?';
        conn.query(query,[parseInt(recvData.contentID)],function(err2,result){
          if(err2){
            console.log('err S /view cate1, ',err2);
            res.json({status:'f'});
            conn.release();
            return;
          }
          else{
            if(result.length<1){
              console.log('err S /view cate1, no data');
              res.json({status:'f'});
              conn.release();
              return;
            }
            var sendData = {
              status : 's',
              contentID : parseInt(recvData.contentID),
              likes : result[0].likes,
              editor : result[0].nickName,
              datas : [
                result[0].head,
                result[0].upperBody,
                result[0].lowerBody,
                result[0].coat
              ]
            };
            res.json(sendData);
            conn.release();
          }
        });
      }
    });
  }
  else{
    //normal board view

    //TODO: board DB data SELECT where category!=1 AND contentID
    db.pool.getConnection(function(err,conn){
      if(err){
        console.log('err conn /view cate!=1, ',err);
        res.json({status:'f'});
        return;
      }
      else{
        var query = 'SELECT * FROM BOARD WHERE b_idx=?';
        conn.query(query,[parseInt(recvData.contentID)],function(err2,result){
          if(err2){
            console.log('err S /view cate!=1, ',err2);
            res.json({status:'f'});
            conn.release();
            return;
          }
          else{
            if(result.length<1){
              console.log('err S /view cate!=1, no data');
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
                img : urlpath_base + i_data[i],
                content : c_data[i]
              };
              arr.push(data);
            }

            var sendData = {
              status : 's',
              contentID : result[0].b_idx,
              likes : result[0].likes,
              editor : result[0].editor,
              title : result[0].title,
              pagesNum : result[0].pagesNum,
              datas : arr
            };
            res.json(sendData);
            conn.release();
          }
        });
      }
    });
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

  if(typeof recvData.contentID === 'undefined' || typeof recvData.appID === 'undefined'){
    console.log('undefined contentID or appID');
    res.json({status : 'f'});
    return;
  }

  if(recvData.contentID.length == 0 || recvData.appID.length == 0){
    console.log('no datas, contentID or appID');
    res.json({status : 'f'});
    return;
  }


  db.pool.getConnection(function(err, conn){
    if(err){
      console.log('err conn /app/board/like, ', err);
      res.json({status : 'f'});
      return;
    }
    else{
      conn.query('INSERT INTO LIKES(user_token, b_idx) VALUES (?, ?)', [recvData.appID.toString(), parseInt(recvData.contentID)], function(err2, result2){
        if(err2){
          console.log('err I like, ', err2);
          res.json({status: 'f'});
          conn.release();
          return;
        }
        else{
          conn.query('UPDATE BOARD SET likes = (likes + 1) WHERE b_idx = ?',[parseInt(recvData.contentID)], function(err3, result3){
            if(err3){
              console.log('err update likes, ', err3);
              res.json({status : 'f'});
              conn.release();
              return;
            }
            else{
              conn.query('SELECT likes FROM BOARD WHERE b_idx = ?', [parseInt(recvData.contentID)], function(err4, result4){
                if(err4){
                  console.log('err SELECT likes, ', err4);
                  res.json({status : 'f'});
                  conn.release();
                  return;
                }
                else{
                  var sendData = {
                    status : 's',
                    contentID : recvData.contentID,
                    likes : result4[0].likes
                  };
                  res.json(sendData);
                  conn.release();
                }
              });
            }
          });
        }
      });
    }
  });
});



/* commentwrite
 type : POST
 req : appID, contentID, comment
 res : status
 */
router.post('/app/board/commentwrite', function(req, res){
  var recvData = req.body;
  console.log('recvData : ', recvData);

  if(typeof recvData.contentID === 'undefined' || typeof recvData.appID === 'undefined'){
    console.log('undefined contentID or appID');
    res.json({status : 'f'});
    return;
  }

  if(recvData.contentID.length == 0 || recvData.appID.length == 0){
    console.log('no datas, contentID or appID');
    res.json({status : 'f'});
    return;
  }

  if(typeof recvData.comment === 'undefined' || recvData.comment.length == 0){
    console.log('no data OR undefined, comment');
    res.json({status : 'f'});
    return;
  }

  db.pool.getConnection(function(err,conn){
    if(err){
      console.log('err conn /board/commentwrite, ', err);
      res.json({status : 'f'});
      return;
    }
    else{
      var query = 'INSERT INTO COMMENTS(user_token, c_content, b_idx) VALUES (?, ?, ?)';
      conn.query(query, [recvData.appID.toString(), recvData.comment, parseInt(recvData.contentID)], function(err2, result){
        if(err2){
          console.log('err INSERT COMMENT, ', err2);
          res.json({status : 'f'});
          conn.release();
          return;
        }
        else{
          var sendData = {
            status : 's'
          };
        }
        res.json(sendData);
        conn.release();
      });
    }
  });
});

/* commentview
 type : GET
 req : contentID
 res : status, commentNum, data(array + object)
 */
router.get('/app/board/commentview', function(req, res){
  var recvData = req.query;
  console.log('recvData : ', recvData);

  //DB에서 contentID에 따른 글의 comment정보를 받아온다.
  db.pool.getConnection(function(err,conn){
    if(err){
      console.log('err conn /commview, ',err);
      res.json({status:'f'});
      return;
    }
    else{
      var query = 'SELECT * FROM COMMENTS NATURAL JOIN USER WHERE b_idx=?';
      conn.query(query,[parseInt(recvData.contentID)],function(err2,result){
        if(err2) {
          console.log('err S /commview, ', err2);
          res.json({status: 'f'});
          conn.release();
          return;
        }
        else{
          var arr = [];
          for(var i = 0 ; i<result.length; i++ ){
            var data = {
              nick : result[i].nickName,
              comment : result[i].c_content
            };
            arr.push(data);
          }
          var sendData = {
            status : 's',
            commentNum : arr.length,
            datas : arr
          };
          res.json(sendData);
          conn.release();
        }
      });
    }
  });

});


/* clothList
 type : GET
 req : cloth_cate, pageNum
 res : status, clothNum, clothList(cloth_name + cloth_idx, cloth_url)
 */
router.get('/app/clothList', function(req, res){
  var recvData = req.query;
  console.log('recvData : ', recvData);

  db.pool.getConnection(function(err, conn){
    if(err){
      console.log('err get conn, clothList : ', err);
      res.json({status : 'f'});
      return;
    }
    // must update LIMIT part
    else{
      conn.query('SELECT * FROM CLOTH WHERE cloth_cate = ? LIMIT ?,10', [recvData.cloth_cate, (recvData.pageNum)*10], function(err2, result){
        if(err2){
          console.log('err S cloth : ', err2);
          res.json({status : 'f'});
          conn.release();
          return;
        }
        else{
          var sendData = {
            status : "s",
            clothNum : result.length,
            clothList : result
          };
          res.json(sendData);
        }
        conn.release();
      });
    }
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/default_iframe',function(req,res,next){
  res.render('default_iframe',{status:'s'});
});

/*
 * login page
 * type : get
 * show login page
 */
router.get('/web/login', web.login_get);

//login page for get login data
//type : post
//req : id, pwd
//res : status, isMaster
router.post('/web/login', web.login);

/*
 * editor main page
 * type : get
 * req : none
 * res : none
 */
router.get('/web/editor/main', web.editorMain);

/*
 * editor category page
 * type : get
 * req : none
 * res : none
 * */
router.get('/web/editor/category', web.e_cateList);

/*
 * master main page
 * type : get
 * req : none
 * res : none
 */
router.get('/web/master/main', web.masterMain);

/*
 * category list
 * type : get
 * req : none
 * res : status, categoryNum, categorys
 * */
router.get('/web/master/category', web.cateList);

/*
 * category add
 * type : post
 * req : addCategory
 * res : status
 * */
router.post('/web/master/category/add',multipartMiddleware,web.cateAdd);


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
 * req : editorEmail, editorPwd, editorName, editorNick, editorCate
 * res : status
 * */
router.post('/web/master/editor/add',multipartMiddleware,web.editorAdd);

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
router.get('/web/board/list',web.boardList);


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
 *       contents(array), images(file array)
 * res : status
 * */
router.post('/web/board/write',multipartMiddleware,web.boardWrite);

/*
 * board view
 * type : get
 * req : contentID
 * res : ~
 * */
router.get('/web/board/view',web.board_view_func);

/*
 * cloth management
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/master/manageClothes', function(req, res){
  res.render('manageClothes');
});

/*
 * cloth list
 * type : get
 * req : pageNo, category, name
 * res : status, cloth(array)
 *
 * Daun Joung
 */
router.get('/web/master/clothesList', function(req, res){
  var recvData = req.query;
  console.log('recvData : ', recvData);

  // connect db
  db.pool.getConnection(function(err, conn){
    if(err){
      console.log('err C /clothList, ',err);
      res.json({status:"f"});
      return;
    }else{
      var query = 'SELECT * FROM CLOTH ';      // TODO CHANGE!! 쿼리 수정해야함
      // if there is request param

      if((recvData.category) && (recvData.name)){
        // category 와 name 둘다 조건이 존재하는 경우
        query += ("WHERE cloth_cate=" + recvData.category + " AND cloth_name LIKE '%" + recvData.name + "%' ");
      }else if(recvData.category){
        // category 조건만 있는 경우
        query += ("WHERE cloth_cate=" + recvData.category + " ");
      }else if(recvData.name){
        // name 조건만 있는 경우
        query += ("WHERE cloth_name LIKE '%" + recvData.name + "%' ");
      }
      if(recvData.pageNo){
        query += ("LIMIT " + ((recvData.pageNo-1)*20) + ", 20 ORDER BY cloth_idx DESC");
      }

      conn.query(query,function(err2, result){
        if(err2) {
          console.log('err S / clothList, ', err2);
          res.json({status: 'f'});
          conn.release();
          return;
        }else{
          var arr= [];
          for(var i = 0 ; i < result.length; i++){

            var d = {
              clothIdx : result[i].cloth_idx,
              clothCate : result[i].cloth_cate,
              clothName : result[i].cloth_name,
              clothImg : result[i].cloth_img,
              clothURL : result[i].cloth_url,
              clothInfo : result[i].cloth_info,
              dateTime : result[i].datetime,
              isValid : result[i].isValid
            };
            arr.push(d);
          }

          var sendData = {
            status: 's',
            cloths : arr
          };
          res.render('clothesList',sendData);
          conn.release();
        }
      });
    }
  });
});

/*
 * show Add new cloth Page
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/master/addCloth', function(req, res){
  res.render('clothesAddPage');
});


/*
 * Add new Cloth
 * type : post
 * req :
 * res :
 */
router.post('/web/master/addCloth',multipartMiddleware, function(req, res){
  var recvData = req.body;
  console.log('recvData : ', recvData);

  // check file is exist
  /*if(typeof req.files.imageFile == 'undefined' || req.files.imageFile == null){
   console.log('/web/master/addCloth no imageFile');
   res.json({status:"f", msg:"no image file"});
   return;
   }
   */
  db.pool.getConnection(function(err, conn){
    if(err){
      console.log("err C, /web/mater/addCloth, ",err);
      res.json({status:"f"});
      return;
    }else{
      console.log("image file check : " + req.files.length);
      var cnt = parseInt(recvData.cnt);
      for(var i = 0 ; i < cnt; i++){
        var q = 'INSERT INTO CLOTH(cloth_cate, cloth_name, cloth_img, cloth_url, isValid) VALUES(?,?,?,?,?)';
        var img = fileUploadService.fileClothUpload("cloth",req.files.imageFile0, recvData.name.toString()+"_"+recvData.info[i].toString()).path;
        var params = [parseInt(recvData.category), recvData.name.toString(), img, recvData.url.toString(), true ];


        conn.query(q, params, function(err2, result){
          if(err2){
            console.log('err l, /cate/add, ', err2);
            res.json({status:'f', msg:'query err'});
            conn.release();
            return;
          }else{
            if(result.affectedRows==1){
            }else{
              res.json({status:'f', msg:'not affected'});
              conn.release();
            }
          }
        });
      }
      res.json({status:'s'});
      conn.release();
    }
  });
});
/*
 * recommend menu
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/recommend_menu', function(req, res){
  res.render('recommend_menu');
});

/*
 * fitting_room_list
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/fitting_room_list', function(req, res){
  var recvData = req.query;
  console.log('recvData : ', recvData);

  // db connect
  db.pool.getConnection(function(err, conn){
    if(err){
      console.log('err C /web/fitting_room_list, ',err);
      res.json({status:'f'});
      return;
    }else{
      var query = 'SELECT CB_IDX, USER_TOKEN, HEAD, UPPERBODY, LOWERBODY, COAT, LIKES, HASHTAG, DATETIME, '
          + 'IF(HEAD IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = HEAD), NULL) AS HEADURL, '
          + 'IF(UPPERBODY IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = UPPERBODY), NULL) AS UPPERURL,'
          + 'IF(LOWERBODY IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = LOWERBODY), NULL) AS LOWERURL, '
          + 'IF(COAT IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = COAT), NULL) AS COATURL'
          + ' FROM CLOTH_BOARD ORDER BY CB_IDX DESC';

      conn.query(query, function(err2, result){
        if(err2){
          console.log('err S /web/fitting_room_list, ',err2);
          res.json({status:'f'});
          conn.release();
          return;
        }else{
          var arr = [];
          for(var i = 0 ; i < result.length; i++){
            // TODO!!
            var d = {
              cbIdx : result[i].CB_IDX,
              head : result[i].HEAD,
              upperBody : result[i].UPPERBODY,
              lowerBody : result[i].LOWERBODY,
              coat : result[i].COAT,
              headUrl : result[i].HEADURL,
              upperUrl : result[i].UPPERURL,
              lowerUrl : result[i].LOWERURL,
              coatUrl : result[i].COATURL,
              likes : result[i].LIKES,
              hashtag : result[i].HASHTAG,
              datetime : result[i].DATETIME
            };
            arr.push(d);
          }

          var sendData = {
            status : 's',
            list : arr
          };
          res.render('fitting_room_list',sendData);
          conn.release();
        }
      });
    }
  });
});

/*
 * hot_fashion_list
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/hot_fashion_list', function(req, res){
  var recvData = req.query;
  console.log('recvData : ', recvData);

  // db connect
  db.pool.getConnection(function(err, conn){
    if(err){
      console.log('err C /web/hot_fashion_list, ',err);
      res.json({status:'f'});
      return;
    }else{
      var query = 'SELECT CB_IDX, USER_TOKEN, HEAD, UPPERBODY, LOWERBODY, COAT, LIKES, HASHTAG, DATETIME, '
          + 'IF(HEAD IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = HEAD), NULL) AS HEADURL, '
          + 'IF(UPPERBODY IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = UPPERBODY), NULL) AS UPPERURL,'
          + 'IF(LOWERBODY IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = LOWERBODY), NULL) AS LOWERURL, '
          + 'IF(COAT IS NOT NULL, (SELECT CLOTH.CLOTH_IMG FROM CLOTH WHERE CLOTH.CLOTH_IDX = COAT), NULL) AS COATURL'
          + ' FROM CLOTH_BOARD';
      if(recvData.hashtag){
        // if hastag is exist
        query += (" WHERE HASHTAG LIKE '%" + recvData.hashtag + "%'" );

      }
      conn.query(query, function(err2, result){
        if(err2){
          console.log('err S /web/hot_fashion_list, ',err2);
          res.json({status:'f'});
          conn.release();
          return;
        }else{
          var arr = [];
          for(var i = 0 ; i < result.length; i++){
            // TODO!!
            var d = {
              cbIdx : result[i].CB_IDX,
              head : result[i].HEAD,
              upperBody : result[i].UPPERBODY,
              lowerBody : result[i].LOWERBODY,
              coat : result[i].COAT,
              headUrl : result[i].HEADURL,
              upperUrl : result[i].UPPERURL,
              lowerUrl : result[i].LOWERURL,
              coatUrl : result[i].COATURL,
              likes : result[i].LIKES,
              hashtag : result[i].HASHTAG,
              datetime : result[i].DATETIME
            };
            arr.push(d);
          }

          var sendData = {
            status : 's',
            list : arr
          };
          res.render('hot_fashion_list',sendData);
          conn.release();
        }
      });
    }
  });
});

/*
 * hot_fashion
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/hot_fashion', function(req, res){
  res.render('hot_fashion');
});/*
 * fitting_room
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/fitting_room', function(req, res){
  var recvData = req.query;
  console.log('recvData : ', recvData);
  res.render('fitting_room');
});
/*
 * fitting_room
 * type : post
 * req :
 * res :
 *
 * Daun Joung
 */
router.post('/web/fitting_room', function(req, res){
  var recvData = req.body;
  console.log('recvData : ', recvData);

  db.pool.getConnection(function(err, conn){
    if(err){
      console.log("err C, /web/fitting_room, ", err);
      res.json({status:'f'});
      return;
    } else{
      var q = "INSERT INTO CLOTH_BOARD(user_token, head, upperbody, lowerbody, coat) VALUES(?,?,?,?,?)";
      var params = [recvData.token.toString(), parseInt(recvData.head), parseInt(recvData.upper), parseInt(recvData.down), parseInt(recvData.coat)];

      conn.query(q, params, function(err2, result){
        if(err2){
          console.log('err l, /web/fitting_room, ',err2);
          res.json({status:'f', msg:'query err'});
          conn.release();
          return;
        }else{
          if(result.affectedRows == 1){
            res.json({status:'s'});
          }else{
            res.json({status:'f', msg:'not affected'});
          }
          conn.release();
        }
      });
    }
  });

});

/*
 * fitting_room_clothList
 * type : get
 * req :
 * res :
 *
 * Daun Joung
 */
router.get('/web/fitting_room_clothList', function(req, res){
  var recvData = req.query;
  console.log('recvData : ', recvData);

  // db connect
  db.pool.getConnection(function(err, conn){
    if(err){
      console.log('err C /web/fitting_room_clothList, ',err);
      res.json({status:'f'});
      return;
    }else{
      var query = 'SELECT CLOTH_IDX, CLOTH_CATE, CLOTH_NAME, CLOTH_IMG, CLOTH_URL FROM CLOTH ';
      if(recvData.cate){
        switch(recvData.cate){
          case '1':  query += ' WHERE CLOTH_CATE = 1'; break;
          case '2':  query += ' WHERE CLOTH_CATE = 2'; break;
          case '3':  query += ' WHERE CLOTH_CATE = 3'; break;
          case '4':  query += ' WHERE CLOTH_CATE = 4'; break;
        }
      }
      query += ' ORDER BY DATETIME';
      console.log("Check query : " + query);
      conn.query(query, function(err2, result){
        if(err2){
          console.log('err S /web/fitting_room_clothList, ',err2);
          res.json({status:'f'});
          conn.release();
          return;
        }else{
          var arr = [];
          for(var i = 0 ; i < result.length; i++){
            // TODO!!
            var d = {
              clothIdx : result[i].CLOTH_IDX,
              clothCate : result[i].CLOTH_CATE,
              clothName : result[i].CLOTH_NAME,
              clothImg : result[i].CLOTH_IMG,
              clothURL : result[i].CLOTH_URL
            };
            arr.push(d);
          }
          var sendData = {
            status : 's',
            cate : recvData.cate,
            list : arr
          };
          res.render('fitting_room_clothList',sendData);
          conn.release();
        }
      });
    }
  });
});
module.exports = router;

module.exports = router;
