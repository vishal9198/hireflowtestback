import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    //new role for rbac
    role: {
      type: String,
      required: true,
      unique: true,
    },
    //which company this user belongs to
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    //whether account is active
    isActive: {
      type: String,
      default: true,
    },
  },
  { timestamps: true },
);
const User = mongoose.model("User", userSchema);
export default User;
