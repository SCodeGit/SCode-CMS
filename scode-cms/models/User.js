const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // <-- changed from 'bcrypt' to 'bcryptjs'

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"] 
  },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "editor", "client"], 
    default: "client" 
  },
  siteCode: { type: String, required: true }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", UserSchema);
