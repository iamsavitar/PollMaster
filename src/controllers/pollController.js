import Poll from "../models/Poll.js";
import Response from "../models/Response.js";
export async function getPolls(req, res, next) {
  try {
    const polls = await Poll.find().sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) { next(error); }
}

export async function getPoll(req, res, next) {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    res.json(poll);
  } catch (error) { next(error); }
}

export async function createPoll(req, res, next) {
  try {
    const poll = await Poll.create({
      question: req.body.question,
      options: req.body.options,
      endsAt: req.body.endsAt || null,
      createdBy: req.user._id
    });

const io = req.app.get("io");
if (io) {
  io.emit("newPoll", poll);
}

res.status(201).json(poll);
  } catch (error) { next(error); }
}

export async function updatePoll(req, res, next) {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (String(poll.createdBy) !== String(req.user._id) && req.user.role !== "admin") {
      return res.status(403).json({ message: "You cannot edit this poll" });
    }
    if (req.body.question !== undefined) poll.question = req.body.question;
    if (req.body.options !== undefined) poll.options = req.body.options;
    if (req.body.isActive !== undefined) poll.isActive = req.body.isActive;
    await poll.save();
    res.json(poll);
  } catch (error) { next(error); }
}

export async function deletePoll(req, res, next) {
  try {
    const poll = await Poll.findByIdAndDelete(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    await Response.deleteMany({ poll: poll._id });
    res.json({ message: "Poll deleted" });
  } catch (error) { next(error); }
}
