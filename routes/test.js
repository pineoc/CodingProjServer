/**
 * Created by pineoc on 2015-07-25.
 */
var express = require('express');
var router = express.Router();

//test code start

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





module.exports = router;