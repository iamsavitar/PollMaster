import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  poll: { type: mongoose.Schema.Types.ObjectId, ref: "Poll", required: true },
  optionIndex: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

// One account can vote only once in each poll.
responseSchema.index({ poll: 1, user: 1 }, { unique: true });

export default mongoose.model("Response", responseSchema);
