import fs from 'fs';
import readline from 'readline';
import googleapis from 'googleapis';

const {google} = googleapis;

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'goolge-token.json';
const CREDENTIALS_PATH = 'google-credentials.json';

/**
 * Checks the auth of the token and refreshes if needed
 *
 * @return Promise<google.auth.OAuth2>
 */
export async function getAuth() {
  try {
    return await readCredentials()
  } catch (err) {
    console.log(err);
  }
}

/**
 * Adds a new game to the list
 * @see https://docs.google.com/spreadsheets/d/1Qp8iwwlNHhoL6nxDuNC1r4OyDEWn98vZoTNMc1qwlv0/edit (actual game list)
 * @see https://docs.google.com/spreadsheets/d/1twxv_x2fYEwby9SUxXLo4ksHVvMhOc2iEBLQIRiULuo/edit (copy of game list)
 * @param {String} game The game to add (user input)
 * @param {String} name The twitch username of the user that submitted the game
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
export function addNewGameToSheet(game, name, auth) {
  const sheets = google.sheets({version: 'v4', auth});

  sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    // spreadsheetId: '1twxv_x2fYEwby9SUxXLo4ksHVvMhOc2iEBLQIRiULuo', // using a copy of the list just in case
    range: 'Sheet1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    resource: {
      values: [
        [game, name, 'No']
      ],
    },
  }).then((response) => {
    console.log(response);
  }).catch((err) => {
    console.error(err);
  });
}

function readCredentials() {
  // Load client secrets from a local file.
  const content = fs.readFileSync(CREDENTIALS_PATH);

  // Authorize a client with credentials, then call the Google Sheets API.
  return authorize(JSON.parse(content));
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @return {google.auth.OAuth2} the authorized client.
 */
async function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // if the token does not exist, generate a new one
  if (fs.existsSync(TOKEN_PATH)) {
    // Check if we have previously stored a token.
    const token = fs.readFileSync(TOKEN_PATH);
    const jsonToken = JSON.parse(token);

    // If the token is expired: generate a new one
    if (Date.now() >= jsonToken.expiry_date) {
      return await getNewToken(oAuth2Client);
    }

    oAuth2Client.setCredentials(jsonToken);
  } else {
    await getNewToken(oAuth2Client);
  }

  return oAuth2Client;
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @return {Promise<google.auth.OAuth2>}
 */
function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // yuck, nesting
  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();

      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          reject(err);
          return console.error('Error while trying to retrieve access token', err);
        }

        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) {
            reject(err);
            return console.error(err);
          }

          console.log('Token stored to', TOKEN_PATH);
        });

        resolve(oAuth2Client);
      });
    });
  });
}


function listMajors(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1Qp8iwwlNHhoL6nxDuNC1r4OyDEWn98vZoTNMc1qwlv0',
    range: 'Sheet1!A2:C',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      console.log('Game, Played:');
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[2]}`);
      });
    } else {
      console.log('No data found.');
    }
  });
}

