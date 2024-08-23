const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');
const destroyer = require('server-destroy');

const CREDENTIALS_PATH = process.env.GMAIL_CREDENTIALS_PATH || path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = process.env.GMAIL_TOKEN_PATH || path.join(process.cwd(), 'token.json');

const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

/**
 * Get and store new token after prompting for user authorization.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 */
function getNewToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
        });

        console.log('Authorize this app by visiting this url:', authUrl);
        console.log('After authorization, you will be redirected to a page that may not load properly.');
        console.log('This is expected. Please copy the entire URL of that page and paste it here.');

        const server = http.createServer(async (req, res) => {
            try {
                if (req.url.indexOf('/oauth2callback') > -1) {
                    const qs = new url.URL(req.url, 'http://localhost:3005').searchParams;
                    res.end('Authentication successful! You can close this window and return to the console.');
                    server.destroy();
                    const { tokens } = await oAuth2Client.getToken(qs.get('code'));
                    oAuth2Client.setCredentials(tokens);
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                    console.log('Token stored to', TOKEN_PATH);
                    resolve(oAuth2Client);
                }
            } catch (e) {
                reject(e);
            }
        }).listen(3005, () => {
            console.log('Waiting for your authorization...');
        });
        destroyer(server);

        process.stdin.setEncoding('utf8');
        process.stdin.on('data', async (data) => {
            const code = new url.URL(data.trim()).searchParams.get('code');
            if (code) {
                server.destroy();
                try {
                    const { tokens } = await oAuth2Client.getToken(code);
                    oAuth2Client.setCredentials(tokens);
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
                    console.log('Token stored to', TOKEN_PATH);
                    resolve(oAuth2Client);
                } catch (err) {
                    console.error('Error retrieving access token', err);
                    reject(err);
                }
            }
        });
    });
}

/**
 * Create an OAuth2 client with the given credentials.
 * @return {Promise<google.auth.OAuth2>}
 */
async function authorize() {
    try {
        const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        try {
            const token = fs.readFileSync(TOKEN_PATH);
            oAuth2Client.setCredentials(JSON.parse(token));
            return oAuth2Client;
        } catch (err) {
            console.log('Token not found. Initiating new token retrieval.');
            return getNewToken(oAuth2Client);
        }
    } catch (err) {
        console.error('Error loading client secrets file:', err);
        throw err;
    }
}

async function getInbox(auth, limit = 50) {
    const gmail = google.gmail({ version: 'v1', auth });
    try {
        const res = await gmail.users.messages.list({
            userId: 'me',
            maxResults: limit,
            labelIds: ['INBOX'],
        });
        return res.data.messages || [];
    } catch (err) {
        console.error('Error fetching inbox:', err);
        throw err;
    }
}

async function labelEmail(auth, messageId, label) {
    const gmail = google.gmail({ version: 'v1', auth });
    try {
        await gmail.users.messages.modify({
            userId: 'me',
            id: messageId,
            requestBody: {
                addLabelIds: [label],
            },
        });
        console.log(`Successfully labeled email ${messageId} with ${label}`);
    } catch (err) {
        console.error('Error labeling email:', err);
        throw err;
    }
}

async function main() {
    try {
        console.log('Using credentials file:', CREDENTIALS_PATH);
        const auth = await authorize();

        // Example: Get the 10 most recent emails
        const recentEmails = await getInbox(auth, 10);
        console.log('Recent emails:', recentEmails);

        // Example: Label the first email as "receipt"
        // if (recentEmails.length > 0) {
        //     await labelEmail(auth, recentEmails[0].id, 'Receipts');
        // }
    } catch (err) {
        console.error('Error in main function:', err);
    }
}

main();