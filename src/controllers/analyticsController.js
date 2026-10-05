import Poll from "../models/Poll.js";
import Response from "../models/Response.js";

export async function getPollResults(req, res, next) {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    const votes = await Response.find({ poll: poll._id });
    const results = poll.options.map((option, index) => ({
      option,
      votes: votes.filter(vote => vote.optionIndex === index).length
    }));
    res.json({ pollId: poll._id, question: poll.question, totalVotes: votes.length, results });
  } catch (error) { next(error); }
}

export async function getPollChart(req, res, next) {
  try {
    const poll = await Poll.findById(req.params.id);
    if (!poll) return res.status(404).json({ message: "Poll not found" });
    const votes = await Response.find({ poll: poll._id });
    res.json(poll.options.map((option, index) => ({
      option,
      count: votes.filter(vote => vote.optionIndex === index).length
    })));
  } catch (error) { next(error); }
}
