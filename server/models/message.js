module.exports = function(mongoose) {

    var Schema = mongoose.Schema;

    var messageSchema = new Schema({
        toRoom: String,
        nickname: String,
        message: String,
        created: Date,
        updated: Date
    });

    messageSchema.pre('save', function(next) {
        now = new Date();
        this.updated = now;


        if (!this.created) {
            this.created = now;
        }
        next();
    });

    return mongoose.model('Message', messageSchema);
};
