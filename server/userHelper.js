module.exports = function(io) {

var getUserById = function(id) {
            var allUsers = getUsersList();

            var ret = '';
            allUsers.forEach(function(user) {
                if (user.id == id)
                    ret = user;
            });
            return ret;
        };


var getUsersList =  function (){
        var users = [];
        io.sockets.sockets.forEach(function(socket) {
            users.push({
                id: socket.id,
                nickname: socket.nickname
            })
        });

        return users;
    };





     return {
        getUsersList: getUsersList,
        getUserById: getUserById,
        populateUsers: function(roomName) {
            var populatedUsers = [];
            Object.keys(io.sockets.adapter.rooms[roomName]).forEach(function(userId, index) {
                populatedUsers.push(getUserById(userId));
            });
            return populatedUsers;
        }

    };
}