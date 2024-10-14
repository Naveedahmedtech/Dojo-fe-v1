import React from 'react';
import { useLocation } from 'react-router-dom';
import posthog from 'posthog-js';

const PageViewTracker: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    posthog.capture('$pageview', { pathname: location.pathname });
  }, [location.pathname]);

  return null;
};

export default PageViewTracker;