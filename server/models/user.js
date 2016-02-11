module.exports = function(mongoose) {

    var Schema = mongoose.Schema;

    var userSchema = new Schema({
        username: String,
        password: String,
        friends: [Schema.Types.ObjectId],
        invitations: [Schema.Types.ObjectId],
        created: Date,
        updated: Date
    });

    userSchema.pre('save', function(next) {
        now = new Date();
        this.updated = now;

        if (!this.created) {
            this.created = now;
        }
        next();
    });


    return mongoose.model('User', userSchema);
};
