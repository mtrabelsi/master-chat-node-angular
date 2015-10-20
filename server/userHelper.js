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

    var getUsersList = function() {
        var users = [];
        io.sockets.sockets.forEach(function(socket) {
            users.push({
                id: socket.id,
                nickname: socket.nickname
            })
        });

        return users;
    };

    var populateUsers = function(roomName) {
        var populatedUsers = [];
        Object.keys(io.sockets.adapter.rooms[roomName]).forEach(function(userId, index) {
            populatedUsers.push(getUserById(userId));
        });
        return populatedUsers;
    };

    return {
        getUsersList: getUsersList,
        getUserById: getUserById,
        populateUsers: populateUsers,
        isAlreadyJoined: function(nickname, room) {
            var joined = false;
            var usersOfThatRoom = populateUsers(room);
            usersOfThatRoom.forEach(function(user) {
                if (user.nickname == nickname) {
                    joined = true;
                }
            });

            return joined;
        },
        getUserByNickname: function(nickname) {
            var allUsers = getUsersList();

            var ret = '';
            allUsers.forEach(function(user) {
                if (user.nickname == nickname)
                    ret = user;
            });
            return ret;
        }

    };
}
