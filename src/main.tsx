import ReactDOM from 'react-dom/client';
import App from './App';
import { PostHogProvider } from 'posthog-js/react';

const postHogApiKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
const postHogApiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

if (!postHogApiKey || !postHogApiHost) {
  console.error('PostHog API Key or Host is missing.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <>
    {postHogApiKey && postHogApiHost ? (
      <PostHogProvider
        apiKey={postHogApiKey}
        options={{
          api_host: postHogApiHost,
          autocapture: true, 
        }}
      >
        <App />
      </PostHogProvider>
    ) : (
      <div></div>
    )}
  </>
);
