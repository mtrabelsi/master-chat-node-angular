/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function(async, roomController, app, Room, User, async, io, roomHelper, roomsOwners, csl) {

    //return the rooms where the username is subcribed in
    app.get('/api/room/:username', roomController.subscribedRooms);
    
    app.post('/api/room/create', roomController.preCreateRoom);
    app.post('/api/room/create', roomController.createRoom);
}
