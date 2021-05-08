import Twitch from '../apis/twitch.js';

let currentPollId: string = '';

export function bla() {}

export async function makePBPoll(): Promise<number> {
  if (currentPollId) {
    console.log('There is a poll active atm, not creating a new one');
    return -1;
  }

  const poll = await Twitch.createPoll({
    title: 'Will this run PB?',
    choices: [
      {
        title: 'Yes',
      },
      {
        title: 'No',
      },
    ],
    duration: 15,
    bits_voting_enabled: true,
    bits_per_vote: 10,
  });

  if (!poll) {
    return -1;
  }

  currentPollId = poll.id;

  return poll.duration;
}

export async function showCurrentPollResults() {
  if (!currentPollId) {
    console.log('No poll that is currently running');
    return;
  }

  const poll = await Twitch.getPollInfo(currentPollId);

  if (!poll) {
    console.log('Missing data for poll');
    return;
  }

  const choices = poll.choices.map((c) => ({
    ...c,
    allVotes: c.votes + c.bits_votes + c.channel_points_votes
  }))
    // sort votes descending
    .sort((a, b) => b.allVotes - a.allVotes);

  const fileContents = `${poll.title}
${
  choices.map(
    (choice) => `${choice.title} - ${choice.allVotes}`
  ).join('\n')
}`;

  console.log(fileContents);
}
