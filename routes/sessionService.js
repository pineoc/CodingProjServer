/**
 * Created by pineoc on 2015-08-11.
 */
'use strict';

function SessionService() {
    if (!(this instanceof SessionService)) {
        return new SessionService();
    }
}

SessionService.prototype.hasSession = function (req) {
    return (typeof req.session !== "undefined" && typeof req.session.userId !== "undefined");
};

SessionService.prototype.getSession = function (req) {
    var data = {
        userId: req.session.userId,
        userName: req.session.userName,
        isMaster : req.session.isMaster
    };
    return data;
};

SessionService.prototype.registerSession = function (req, id, name, isMaster) {
    req.session.userId = id;
    req.session.userName = name;
    req.session.isMaster = isMaster;
};


SessionService.prototype.removeSession = function (req) {
    req.session.destroy();
};

/**
 * makeUserSessionData
 * - content Object�� userId, userName �߰�
 * @param req
 * @param {JSONObject} content
 * @returns {boolean} : session ���� �� true, ���� �� false
 */
SessionService.prototype.makeUserSessionData = function (req, content) {
    var hasSessionResult = false;
    if (this.hasSession(req)) {
        content.userId = req.session.userId;
        content.userName = req.session.userName;
        content.isLogin = true;
        hasSessionResult = true;
    } else {
        content.isLogin = false;
        hasSessionResult = false;
    }
    return hasSessionResult;
};

/**
 * hasUserAuthority
 * @param req
 * @param userName
 * @returns {boolean}
 */
SessionService.prototype.hasUserAuthorityByName = function (req, userName) {
    return (req.session.userName === userName);
};

SessionService.prototype.isMaster = function(req){

    var config = require('./db_config');

    if(!this.hasSession(req)){
        return null;
    }
    else{
        if(req.session.userId == config.data.email && req.session.userName == config.data.name){
            return true;
        }
        else{
            return false;
        }
    }
};

module.exports = SessionService;
