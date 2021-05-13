import Twitch from '../apis/twitch.js';
import { sleep } from '../helpers.js';
import { TwitchPollCreateRequest } from '../apis/types/twitchtypes.js';

let currentPollId: string = '';

export async function makePBPoll(): Promise<void> {
  await makePoll({
    title: 'Will this run PB?',
    choices: [
      {
        title: 'Yes',
      },
      {
        title: 'No',
      },
    ],
  });
}

export async function showCurrentPollResults() {
  if (!currentPollId) {
    console.log('No poll that is currently running');
    return;
  }

  const poll = await Twitch.getPollInfo(currentPollId);

  // rest the current poll
  currentPollId = '';

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

  // TODO: display in obs
  console.log(fileContents);
}

// The only thing that changes between al the polls is the content
async function makePoll(options: Partial<TwitchPollCreateRequest>) {
  if (currentPollId) {
    console.log('There is a poll active atm, not creating a new one');
    return;
  }

  const poll = await Twitch.createPoll({
    // these two will be overwritten anyway
    title: '',
    choices: [],
    ...options,
    duration: 30,
    bits_voting_enabled: true,
    bits_per_vote: 10,
  });

  if (!poll) {
    return;
  }

  currentPollId = poll.id;

  await sleep(poll.duration * 1000);

  await showCurrentPollResults();
}
