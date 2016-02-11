module.exports = function(mongoose) {

    var Schema = mongoose.Schema;
 
    var roomSchema = new Schema({
        roomName: String,
        owner: String,
        users: [String],
        custom: { type: Boolean, default: false },
        default: { type: Boolean, default: false },
        created: Date,
        updated: Date
    });

    roomSchema.pre('save', function(next) {
        now = new Date();
        this.updated = now;


        if (!this.created) {
            this.created = now;
        }
        next();
    });

    return mongoose.model('Room', roomSchema);
};
