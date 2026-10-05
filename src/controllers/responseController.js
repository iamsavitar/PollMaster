import Poll from "../models/Poll.js";
import Response from "../models/Response.js";

export async function submitVote(req, res, next) {
  try {
    const poll = await Poll.findById(req.body.pollId);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    if (!poll.isActive || (poll.endsAt && poll.endsAt < new Date())) {
      return res.status(400).json({ message: "This poll is closed" });
    }
    if (req.body.optionIndex >= poll.options.length) {
      return res.status(400).json({ message: "Choose a valid option" });
    }
    const vote = await Response.create({
      poll: poll._id,
      optionIndex: Number(req.body.optionIndex),
      user: req.user._id
    });
    req.app.get("io")?.to(poll._id.toString()).emit("pollUpdated", { pollId: poll._id });
    res.status(201).json({ message: "Vote submitted", voteId: vote._id });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already voted in this poll" });
    next(error);
  }
}

export async function getMyVotes(req, res, next) {
  try {
    const votes = await Response.find({ user: req.user._id }).populate("poll", "question");
    res.json(votes);
  } catch (error) { next(error); }
}

export async function getPollVoteCount(req, res, next) {
  try {
    const votes = await Response.find({ poll: req.params.id });
    res.json({ count: votes.length });
  } catch (error) { next(error); }
}
