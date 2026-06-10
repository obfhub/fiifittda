# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

## AI Macro Tracker

The macro tracker uses server-only Vercel API routes:

- `api/analyze-meal.js` parses meal text with Claude, searches real food APIs, and calculates macros.
- `api/barcode-food.js` is prepared for future barcode lookup through Open Food Facts.

Add these environment variables in Vercel before using the tracker:

`CLAUDE_API_KEY=your_claude_proxy_key`

`USDA_API_KEY=your_usda_key`

Do not place keys in frontend code. Claude only parses food text into database search items. Calories and macros are calculated on the backend from USDA/Open Food Facts matches only.

## Account Backend

The signup page at `/signup` creates real users through Supabase Auth using the server-only Vercel API route `api/create-account.js`.

Add these environment variables in Vercel before using account creation:

`SUPABASE_URL=your_supabase_project_url`

`SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key`

`SUPABASE_ANON_KEY=your_supabase_anon_key`

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only. Do not add it to frontend code or expose it with a `REACT_APP_` prefix. The login page at `/login` uses `api/login-account.js` and stores the returned session in browser local storage.

Password reset uses `api/forgot-password.js`, `api/reset-password.js`, and real SMTP through Nodemailer. Add these environment variables in Vercel:

`SMTP_HOST=smtp.gmail.com`

`SMTP_PORT=587`

`SMTP_SECURE=false`

`SMTP_USER=your_gmail_address`

`SMTP_PASSWORD=your_gmail_app_password`

Optional:

`SITE_URL=https://your-production-domain`

Telegram login uses Telegram OIDC through `api/telegram-start.js` and `api/telegram-callback.js`. Add these environment variables in Vercel:

`TELEGRAM_CLIENT_ID=your_telegram_client_id`

`TELEGRAM_CLIENT_SECRET=your_telegram_client_secret`

Optional, but recommended in production:

`TELEGRAM_REDIRECT_URI=https://fiifittda.vercel.app/api/telegram-callback`

In BotFather or Telegram's app settings, add the same redirect URL and allowed domain. Keep `TELEGRAM_CLIENT_SECRET` server-only.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
