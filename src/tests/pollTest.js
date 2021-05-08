import { makePBPoll, showCurrentPollResults } from '../launchpad/twitchExecutors.js';
import { sleep } from '../helpers.js';

(async () => {
  console.log('sleeping for 2 seconds');
  await sleep(2 * 1000);
  const duration = await makePBPoll();
  console.log(`sleeping for ${duration} seconds`);
  await sleep(duration * 1000);
  await showCurrentPollResults();
})();
