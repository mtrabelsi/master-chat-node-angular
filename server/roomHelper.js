module.exports = function(io,roomsOwners,userHelper) {
    
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
		    }

	};
}
