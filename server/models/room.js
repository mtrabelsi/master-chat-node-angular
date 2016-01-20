module.exports = function(mongoose) {

    var Schema = mongoose.Schema;
    //    ticket: { type: Schema.Types.ObjectId, ref: 'Ticket'},
    //createdBy: { type: Schema.Types.ObjectId, ref: 'User'},
    var roomSchema = new Schema({
        roomName: String,
        owner: String,
        users: [String],
        custom: { type: Boolean, default: false },
        default: { type: Boolean, default: false },
        created: Date,
        updated: Date
    });

    /*
    // methods ======================
    userSchema.methods.generateHash = function(password) {
    	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    };
    */
    // checking if password is valid
    roomSchema.methods.validPassword = function(password) {
        //	return bcrypt.compareSync(password, this.password);   //warning!!! must be uncommented in the future for security ! Marwen
        return this.password == password;
    };

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
