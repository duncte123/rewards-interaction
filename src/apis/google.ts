import fs from 'fs';
import readline from 'readline';
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'goolge-token.json';
const CREDENTIALS_PATH = 'google-credentials.json';

type credentialsType = {
  installed: {
    client_id: string,
    project_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_secret: string,
    redirect_uris: string[]
  };
};

type tokenType = {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expiry_date: number;
};

/**
 * Checks the auth of the token and refreshes if needed
 *
 * @return Promise<google.auth.OAuth2>
 */
export async function getAuth(): Promise<OAuth2Client|null> {
  try {
    return await readCredentials()
  } catch (err) {
    console.log(err);
  }
  return null;
}

/**
 * Adds a new game to the list
 * @see https://docs.google.com/spreadsheets/d/1Qp8iwwlNHhoL6nxDuNC1r4OyDEWn98vZoTNMc1qwlv0/edit (actual game list)
 * @see https://docs.google.com/spreadsheets/d/1twxv_x2fYEwby9SUxXLo4ksHVvMhOc2iEBLQIRiULuo/edit (copy of game list)
 * @param {String} game The game to add (user input)
 * @param {String} name The twitch username of the user that submitted the game
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
export function addNewGameToSheet(game: string, name: string, auth: OAuth2Client): void {
  const sheets = google.sheets({version: 'v4', auth});

  sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
    // spreadsheetId: '1twxv_x2fYEwby9SUxXLo4ksHVvMhOc2iEBLQIRiULuo', // using a copy of the list just in case
    range: 'Sheet1',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    // @ts-ignore sigh google
    resource: {
      values: [
        [game, name, 'No']
      ],
    },
  }, undefined).then((response) => {
    console.log(response);
  }).catch((err) => {
    console.error(err);
  });
}

function readCredentials(): Promise<OAuth2Client> {
  // Load client secrets from a local file.
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf-8');
  const credentials: credentialsType = JSON.parse(content);

  // Authorize a client with credentials, then call the Google Sheets API.
  return authorize(credentials);
}


/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @return {google.auth.OAuth2} the authorized client.
 */
async function authorize(credentials: credentialsType): Promise<OAuth2Client> {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // if the token does not exist, generate a new one
  if (fs.existsSync(TOKEN_PATH)) {
    // Check if we have previously stored a token.
    const token = fs.readFileSync(TOKEN_PATH, 'utf-8');
    const jsonToken: tokenType = JSON.parse(token);

    oAuth2Client.setCredentials(jsonToken);

    try {
      const accessToken = await oAuth2Client.getAccessToken();
      console.log(accessToken);
      return oAuth2Client;
    } catch (e) {
      console.log(e);
    }

    // If the token is expired: generate a new one
    if (Date.now() >= jsonToken.expiry_date) {
      return await getNewToken(oAuth2Client);
    }
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
function getNewToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
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

        if (token == null) {
          return console.error('token is null?');
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

function listMajors(auth: OAuth2Client) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.get({
    spreadsheetId: '1Qp8iwwlNHhoL6nxDuNC1r4OyDEWn98vZoTNMc1qwlv0',
    range: 'Sheet1!A2:C',
  }, (err, res) => {
    if (err || !res) {
      return console.log('The API returned an error: ' + err);
    }
    const rows = res.data.values;

    if (!rows) {
      return console.error('no rows?');
    }

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
