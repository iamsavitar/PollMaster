import mongoose from "mongoose";

const pollSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  options: [{ type: String, required: true, trim: true }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true },
  endsAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model("Poll", pollSchema);
