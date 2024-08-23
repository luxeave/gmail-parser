# Gmail Cleaner

This project uses the Gmail API to manage and clean your Gmail inbox. Follow these steps to set up and run the application.

## Prerequisites

- Node.js installed on your machine
- A Google account with Gmail
- Basic familiarity with the command line

## Setup Instructions

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project drop-down and select "New Project".
3. Give your project a name and click "Create".
4. Select your new project if it's not automatically selected.

### 2. Enable the Gmail API

1. In the Google Cloud Console, go to "APIs & Services" > "Library".
2. Search for "Gmail API" and click on it.
3. Click "Enable" to enable the Gmail API for your project.

### 3. Create Credentials

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials".
2. Click "Create Credentials" and select "OAuth client ID".
3. If prompted, configure the OAuth consent screen:
   - Choose "External" as the user type.
   - Fill in the required fields (App name, User support email, Developer contact information).
   - Add the scope: `https://www.googleapis.com/auth/gmail.modify`
   - Add your Google account email as a test user.
4. For application type, choose "Desktop app".
5. Give your OAuth client ID a name and click "Create".

### 4. Download the Credentials

1. After creating the OAuth client ID, you'll see a pop-up with your client ID and client secret.
2. Click "Download" to download the credentials file.
3. Rename the downloaded file to `credentials.json`.
4. Move `credentials.json` to your project directory.

### 5. Install Dependencies

In your project directory, run:

```bash
npm install googleapis
```

### 6. Run the Script

1. Place the script in your project directory.
2. Run the script using Node.js:

```bash
node script.js
```

3. The first time you run the script, it will prompt you to authorize the application:
   - Copy the provided URL and paste it into your web browser.
   - Follow the prompts to allow the application access to your Gmail account.
   - After authorization, you'll be redirected to a page that may not load properly. This is expected.
   - Copy the entire URL of this page and paste it back into the console where the script is running.

4. The script will then create a `token.json` file in your project directory. This file stores your access and refresh tokens.

## Notes

- Keep your `credentials.json` and `token.json` files secure. Do not share them or commit them to version control.
- If you need to authorize the application again, delete the `token.json` file and rerun the script.

## Troubleshooting

- If you encounter any issues with authentication, ensure that you've correctly set up the OAuth consent screen and added your email as a test user.
- Make sure the `credentials.json` file is in the same directory as your script.
- If you're getting API errors, check that you've enabled the Gmail API for your project.

For any other issues, please refer to the [Gmail API documentation](https://developers.google.com/gmail/api) or open an issue in this project's repository.