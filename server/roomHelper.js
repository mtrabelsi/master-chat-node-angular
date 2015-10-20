module.exports = function(io, roomsOwners, userHelper,csl) {

    return {
        getAllRoomsList: function() {
            var rooms = [];
            Object.keys(io.sockets.adapter.rooms).forEach(function(roomName, index, idsOfThatRoom) {
                var owner = roomsOwners[roomName].ownerName;
                var usersOfThatRoom = userHelper.populateUsers(roomName);
                var isDefault = roomsOwners[roomName].isDefault;
                rooms.push({
                    name: roomName,
                    owner: owner,
                    isDefault: isDefault,
                    users: usersOfThatRoom
                });
            });
            return rooms;
        },

        getRoomsList: function() {
            var allRooms = this.getAllRoomsList();
            var usersRooms = [];
            allRooms.forEach(function(room) {
                if (room.isDefault == false) {
                    usersRooms.push(room);
                }
            });
            return usersRooms;
        },
        roomsDigest: function () {
            Object.keys(roomsOwners).forEach(function(roomName, owner) {
                var uselessRoom = true;
                Object.keys(io.sockets.adapter.rooms).forEach(function(sysRoomName, idsInThatRoom) {
                    if (roomName == sysRoomName) {
                        uselessRoom = false;
                    }
                });
                if (uselessRoom) {
                    delete roomsOwners[roomName];
                    console.log(csl.error('Useless room "', roomName, '" removed'));
                }
            });


            console.log(csl.warn('[BEGIN] Rooms Owners  :'));
            console.log(roomsOwners);
            console.log(csl.warn('[END] Rooms Owners '));
        }

    };
}
