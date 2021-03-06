var isLogin = require('../policies/isLogin');
module.exports = [{
  urls: ['/my/messages', '/v2/user/messages'],
  routers: {
    get: function (req, res) {
      var user = req.session.user;
      var Message = req.models.Message;
      var read = Message.find({
        receiver: user.id,
        isRead: true
      }).populate('sender').populate('thread').populate('replier');
      var unread = Message.find({
        receiver: user.id,
        isRead: true
      }).populate('sender').populate('thread').populate('replier');
      Promise.all([read, unread]).then(function (messages) {
        var unread = [messages[1]].map(function (item) {
          return {
            id: item.id
          };
        });
        return unread;
      }).then(function (ids) {
        return Message.update(ids, {
          isRead: true
        });
      }).then(function () {
        res.showPage('message/index', {
          read: read,
          unread: unread
        });
      }).catch(function (err) {
        console.err(err);
        res.status(500).send(err);
      });
    }
  },
  policies: {
    get: isLogin
  }
}];
