/**
 * Created by pineoc on 2015-07-25.
 */
var express = require('express');
var router = express.Router();

//test code start
const CLOTHIDX = 1;

//login
// first time, sign + login, after then login
// type : post
// req : appID, nickName
// res : status, appID, nickName
router.post('/app/login',function(req,res){
    var recvData = req.body;
    console.log('recv Data : ' , recvData);

    //TODO: DB에 연결해서 실제 DB에 INSERT 해봐야함.

    var sendData = {
        status : "s",
        appID : recvData.appID.toString(),
        nickName : recvData.nickName
    };

    res.json(sendData);
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


    //TODO: DB로 SELECT 해서 정보를 가져오게 함.
    var category = [
        {
            name:"a",
            cateID : 1,
            cateImgURL : "http://localhost:3000/img/url/1.png"
        },
        {
            name:"b",
            cateID : 2,
            cateImgURL : "http://localhost:3000/img/url/2.png"
        },
        {
            name:"c",
            cateID : 3,
            cateImgURL : "http://localhost:3000/img/url/1.png"
        },
        {
            name:"d",
            cateID : 4,
            cateImgURL : "http://localhost:3000/img/url/1.png"
        },
        {
            name:"e",
            cateID : 5,
            cateImgURL : "http://localhost:3000/img/url/1.png"
        }
    ];

    var sendData = {};
    sendData.status = 's';
    sendData.categorys = category;

    res.json(sendData);
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




module.exports = router;