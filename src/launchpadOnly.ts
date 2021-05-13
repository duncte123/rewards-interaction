// connect to the launchpad
import LaunchpadController from './launchpad/LaunchpadController.js';
import * as googleAuth from './apis/google.js';

// load the auth on startup
googleAuth.getAuth().then(() => {
  new LaunchpadController();
});
