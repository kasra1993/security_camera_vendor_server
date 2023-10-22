import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  authentication: {
    password: { type: String, required: true, select: false },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
  },
  bestFriend: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
});

try {
  const user = await User.where("age")
    .gt(10)
    .where("age")
    .lt(10)
    .where("name")
    .equals("kasra")
    .populate("bestfriend")
    .limit(1);
  User.sayHi();
} catch (error) {
  console.log(error);
}

//  the output will be the user we are looking for with bestfriend property to
// have all the information of best friend and not just the id

// add method to every instance of our user
// now all our users have this sayhi method on them
UserSchema.method.sayHi = function () {
  console.log(`hi , my name is ${this.name}`);
};

// regular expression
// case insensitive because of i
/// find the user by that name which is case insensitive
// so instead of having findOne({name : 'kyle'}) we can say .findByName("kyle")
UserSchema.statics.findByName = function (name) {
  return this.find({ name: new RegExp(name, "i") });
};

UserSchema.query.byName = function (name) {
  return this.where({ name: new RegExp(name, "i") });
};
const user = await User.find().byName("kule");

UserSchema.virtual("namedEmail").get(function () {
  return `${this.name} <${this.email}>`;
});
const user = await User.findOne({ name: "kyle", email: "test@test.com" });
console.log(user);
console.log(user.namedEmail);
// we do not have a property of namedEmail in User schema
//but here it creates a virtual one and nothing gets changed in database or schema
// it has .get and .set

UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});
const user = await User.findOne({ name: "kyle", email: "test@test.com" });
console.log(user);
await user.save();
console.log(user);

/// updatedAt gets updated
// we also have a post instead of pre which after method is done executing this middleware
// will get executed too .
// the string of save can also be other things based on the method we want to perform.
