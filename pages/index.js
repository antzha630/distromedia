import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/router';

// Modal components moved outside to prevent re-renders
const BlueskyModal = ({ 
  blueskyId, 
  setBlueskyId, 
  blueskyPass, 
  setBlueskyPass, 
  loginBluesky, 
  setShowBlueskyModal 
}) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: '#232526',
      padding: '2rem',
      borderRadius: '12px',
      minWidth: 320,
      maxWidth: 400,
      color: '#f0f0f0'
    }}>
      <h2>Login with Bluesky</h2>
      <input
        placeholder="Bluesky handle (e.g. @distromedia.bsky.social)"
        value={blueskyId}
        onChange={(e) => setBlueskyId(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#f0f0f0' }}
      />
      <input
        type="password"
        placeholder="App Password"
        value={blueskyPass}
        onChange={(e) => setBlueskyPass(e.target.value)}
        style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#f0f0f0' }}
      />
      <div style={{ fontSize: '0.95em', color: '#aaa', marginBottom: '10px' }}>
        <span>
          <b>Note:</b> You must use a <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer" style={{ color: '#3f51b5', textDecoration: 'underline' }}>Bluesky App Password</a> (not your main password).
        </span>
      </div>
      <button onClick={async () => { await loginBluesky(); setShowBlueskyModal(false); }} style={{width: '100%', padding: '10px', background: '#3f51b5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
        Log in to Bluesky
      </button>
      <button onClick={() => setShowBlueskyModal(false)} style={{width: '100%', marginTop: 8, padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Cancel</button>
    </div>
  </div>
);

const TelegramModal = ({ 
  telegramStep,
  telegramPhone,
  setTelegramPhone,
  telegramCode,
  setTelegramCode,
  telegramLoading,
  telegramError,
  handleTelegramPhoneSubmit,
  handleTelegramCodeSubmit,
  resetTelegramLogin,
  setShowTelegramModal
}) => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      background: '#232526',
      padding: '2rem',
      borderRadius: '12px',
      minWidth: 320,
      maxWidth: 400,
      color: '#f0f0f0'
    }}>
      <h2>Login with Telegram</h2>
      {telegramStep === 'phone' ? (
        <form onSubmit={handleTelegramPhoneSubmit}>
          <input
            type="tel"
            placeholder="Phone number (e.g., +1234567890)"
            value={telegramPhone}
            onChange={(e) => setTelegramPhone(e.target.value)}
            style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#f0f0f0' }}
            disabled={telegramLoading}
          />
          <button type="submit" style={{width: '100%', padding: '10px', background: '#229ED9', color: '#fff', border: 'none', borderRadius: '4px', cursor: telegramLoading ? 'not-allowed' : 'pointer'}} disabled={telegramLoading}>
            {telegramLoading ? 'Sending Code...' : 'Send Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleTelegramCodeSubmit}>
          <input
            type="text"
            placeholder="Enter 5-digit code"
            value={telegramCode}
            onChange={(e) => setTelegramCode(e.target.value)}
            style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #444', background: '#2a2a2a', color: '#f0f0f0' }}
            disabled={telegramLoading}
            maxLength={5}
            autoComplete="off"
          />
          <button type="submit" style={{width: '100%', padding: '10px', marginBottom: '10px', background: '#229ED9', color: '#fff', border: 'none', borderRadius: '4px', cursor: telegramLoading ? 'not-allowed' : 'pointer'}} disabled={telegramLoading}>
            {telegramLoading ? 'Verifying...' : 'Log In'}
          </button>
          <button type="button" onClick={resetTelegramLogin} style={{width: '100%', padding: '8px', fontSize: '0.9em', backgroundColor: '#444', border: '1px solid #666', cursor: telegramLoading ? 'not-allowed' : 'pointer', color: '#fff', borderRadius: '4px'}} disabled={telegramLoading}>
            Use a different number
          </button>
        </form>
      )}
      {telegramError && (
        <div style={{ color: '#e74c3c', fontSize: '0.9em', marginTop: '10px' }}>{telegramError}</div>
      )}
      <button onClick={() => setShowTelegramModal(false)} style={{width: '100%', marginTop: 8, padding: '8px', background: '#444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Cancel</button>
    </div>
  </div>
);

function NewHomePage() {
  const router = useRouter();
  const name = "Brad";

  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');
  const [showBluesky, setShowBluesky] = useState(true);
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [showTelegram, setShowTelegram] = useState(true);
  const [showTwitter, setShowTwitter] = useState(true);
  
  // New Telegram API Login States
  const [telegramPhone, setTelegramPhone] = useState('');
  const [telegramCode, setTelegramCode] = useState('');
  const [telegramPhoneCodeHash, setTelegramPhoneCodeHash] = useState('');
  const [telegramSessionString, setTelegramSessionString] = useState('');
  const [telegramStep, setTelegramStep] = useState('phone'); // 'phone' or 'code'
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramError, setTelegramError] = useState('');

  // Session states for all platforms
  const [blueskySession, setBlueskySession] = useState(null);
  const [linkedinSession, setLinkedinSession] = useState(null);
  const [telegramSession, setTelegramSession] = useState(null);
  const [twitterSession, setTwitterSession] = useState(null);

  // This ref is no longer needed for the widget, but can be kept for future use or removed.
  const telegramContainerRef = useRef(null);

  const [showBlueskyModal, setShowBlueskyModal] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  useEffect(() => {
    // Check for existing sessions on mount
    const storedBlueskySession = sessionStorage.getItem('blueskySession');
    const storedLinkedinSession = sessionStorage.getItem('linkedinSession');
    const storedTelegramSession = sessionStorage.getItem('telegramSession');
    const storedTwitterSession = sessionStorage.getItem('twitterSession');
    
    // Also check localStorage for OAuth sessions
    const localLinkedinSession = localStorage.getItem('linkedinSession');
    const localTwitterSession = localStorage.getItem('twitterSession');
    
    if (storedBlueskySession) setBlueskySession(JSON.parse(storedBlueskySession));
    if (storedLinkedinSession) setLinkedinSession(JSON.parse(storedLinkedinSession));
    if (storedTelegramSession) setTelegramSession(JSON.parse(storedTelegramSession));
    if (storedTwitterSession) setTwitterSession(JSON.parse(storedTwitterSession));
    
    // Handle localStorage sessions (from OAuth callbacks)
    if (localLinkedinSession && !storedLinkedinSession) {
      const session = JSON.parse(localLinkedinSession);
      sessionStorage.setItem('linkedinSession', JSON.stringify(session));
      setLinkedinSession(session);
      localStorage.removeItem('linkedinSession'); // Clean up
    }
    if (localTwitterSession && !storedTwitterSession) {
      const session = JSON.parse(localTwitterSession);
      sessionStorage.setItem('twitterSession', JSON.stringify(session));
      setTwitterSession(session);
      localStorage.removeItem('twitterSession'); // Clean up
    }

    // Handle LinkedIn OAuth callback
    const linkedinData = router.query.linkedin;
    if (linkedinData) {
      try {
        const session = JSON.parse(decodeURIComponent(linkedinData));
        sessionStorage.setItem('linkedinSession', JSON.stringify(session));
        setLinkedinSession(session);
        router.replace('/', undefined, { shallow: true });
      } catch (error) {
        console.error('Failed to parse LinkedIn session:', error);
      }
    }
    // Handle Telegram callback
    const telegramData = router.query.telegramSession;
    if (telegramData) {
      try {
        const session = JSON.parse(decodeURIComponent(telegramData));
        sessionStorage.setItem('telegramSession', JSON.stringify(session));
        setTelegramSession(session);
        router.replace('/', undefined, { shallow: true });
      } catch (error) {
        console.error('Failed to parse Telegram session:', error);
      }
    }
    // Handle Twitter callback
    const twitterData = router.query.twitterSession;
    if (twitterData) {
      try {
        const session = JSON.parse(decodeURIComponent(twitterData));
        sessionStorage.setItem('twitterSession', JSON.stringify(session));
        setTwitterSession(session);
        router.replace('/', undefined, { shallow: true });
      } catch (error) {
        console.error('Failed to parse Twitter session:', error);
      }
    }
    // Handle Bluesky callback (if needed)
    // (Bluesky login is handled inline, so no callback param)
  }, [router]);

  const handleTelegramPhoneSubmit = async (e) => {
    e.preventDefault();
    if (!telegramPhone.trim()) {
      setTelegramError('Please enter your phone number in international format.');
      return;
    }

    setTelegramLoading(true);
    setTelegramError('');

    try {
      const res = await fetch('/api/telegram/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: telegramPhone.trim() }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setTelegramPhoneCodeHash(data.phoneCodeHash);
        setTelegramSessionString(data.sessionString);
        setTelegramStep('code');
        setTelegramError('');
      } else {
        setTelegramError(data.error || 'Failed to send verification code. Please check the number and try again.');
      }
    } catch (error) {
      setTelegramError('A network error occurred. Please try again.');
    } finally {
      setTelegramLoading(false);
    }
  };

  const handleTelegramCodeSubmit = async (e) => {
    e.preventDefault();
    if (!telegramCode.trim()) {
      setTelegramError('Please enter the verification code.');
      return;
    }

    setTelegramLoading(true);
    setTelegramError('');

    const requestBody = { 
      phone: telegramPhone.trim(),
      code: telegramCode.trim(),
      phoneCodeHash: telegramPhoneCodeHash,
      sessionString: telegramSessionString,
    };

    // Check for missing data before sending
    for (const key in requestBody) {
      if (!requestBody[key]) {
        setTelegramError('A critical error occurred. Please try the login process again.');
        setTelegramLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/telegram/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        alert('✅ Logged into Telegram');
        sessionStorage.setItem('telegramSession', JSON.stringify(data.session));
        setTelegramSession(data.session);
        setShowTelegramModal(false); // Close the modal
        // Reset the form
        setTelegramPhone('');
        setTelegramCode('');
        setTelegramStep('phone');
        setTelegramError('');
        setTelegramPhoneCodeHash('');
        setTelegramSessionString('');
      } else {
        setTelegramError(data.error || 'Invalid code. Please try again.');
      }
    } catch (error) {
      setTelegramError('A network error occurred. Please try again.');
    } finally {
      setTelegramLoading(false);
    }
  };
  
  const resetTelegramLogin = () => {
    setTelegramPhone('');
    setTelegramCode('');
    setTelegramStep('phone');
    setTelegramError('');
    setTelegramLoading(false);
    setTelegramPhoneCodeHash('');
    setTelegramSessionString('');
  };

  const loginBluesky = async () => {
    // Basic validation
    if (!blueskyId.trim()) {
      alert('❌ Please enter your Bluesky handle or email');
      return;
    }
    if (!blueskyPass.trim()) {
      alert('❌ Please enter your app password');
      return;
    }
    // Sanitize the identifier
    let cleanIdentifier = blueskyId.trim().replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/^@/, '').replace(/[.\s]+$/, '');
    const res = await fetch('/api/bluesky/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: cleanIdentifier,
        appPassword: blueskyPass.trim(),
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ Logged into Bluesky');
      sessionStorage.setItem('blueskySession', JSON.stringify(data.session));
      sessionStorage.setItem('blueskyHandle', cleanIdentifier);
      if (data.avatarUrl) sessionStorage.setItem('blueskyAvatarUrl', data.avatarUrl);
      setBlueskySession(data.session);
      // Stay on the login page
    } else {
      const errorMsg = data.error || 'Login failed';
      alert(`❌ Bluesky login failed: ${errorMsg}`);
      console.error('Bluesky login error details:', data.details);
    }
  };

  const loginLinkedIn = () => {
    window.location.href = '/api/linkedin/auth';
  };

  // Memoized modal components
  const blueskyModal = useMemo(() => 
    showBlueskyModal ? (
      <BlueskyModal 
        blueskyId={blueskyId}
        setBlueskyId={setBlueskyId}
        blueskyPass={blueskyPass}
        setBlueskyPass={setBlueskyPass}
        loginBluesky={loginBluesky}
        setShowBlueskyModal={setShowBlueskyModal}
      />
    ) : null, [showBlueskyModal, blueskyId, blueskyPass]);

  const telegramModal = useMemo(() => 
    showTelegramModal ? (
      <TelegramModal 
        telegramStep={telegramStep}
        telegramPhone={telegramPhone}
        setTelegramPhone={setTelegramPhone}
        telegramCode={telegramCode}
        setTelegramCode={setTelegramCode}
        telegramLoading={telegramLoading}
        telegramError={telegramError}
        handleTelegramPhoneSubmit={handleTelegramPhoneSubmit}
        handleTelegramCodeSubmit={handleTelegramCodeSubmit}
        resetTelegramLogin={resetTelegramLogin}
        setShowTelegramModal={setShowTelegramModal}
      />
    ) : null, [showTelegramModal, telegramStep, telegramPhone, telegramCode, telegramLoading, telegramError]);

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p style={{ fontSize: '1.5em', marginTop: '20px', fontWeight: 700 }}>Distro Channel Management Module</p>
        <p style={{ fontSize: '1.1em', marginTop: '16px', marginBottom: '32px', color: '#fff' }}>
          Create social media content from your articles and send posts, all without leaving Distro.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', marginTop: 40 }}>
          {/* Bluesky */}
          <button
            className="login-oval"
            style={{ background: '#3f51b5', color: '#fff', fontWeight: 600, fontSize: '1.1em', padding: '1.2em 2.5em', borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', gap: 16, minWidth: 320, justifyContent: 'center', opacity: blueskySession ? 0.7 : 1 }}
            onClick={() => !blueskySession && setShowBlueskyModal(true)}
            disabled={!!blueskySession}
          >
            <img src="/images/Bluesky_Logo.png" alt="Bluesky" style={{ width: 32, height: 32 }} />
            {blueskySession ? 'Logged in to Bluesky' : 'Log in to Bluesky'}
          </button>
          {/* LinkedIn */}
          <button
            className="login-oval"
            style={{ background: '#0A66C2', color: '#fff', fontWeight: 600, fontSize: '1.1em', padding: '1.2em 2.5em', borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', gap: 16, minWidth: 320, justifyContent: 'center', opacity: linkedinSession ? 0.7 : 1 }}
            onClick={() => { if (!linkedinSession) window.open('/api/linkedin/auth', '_blank', 'width=600,height=700'); }}
            disabled={!!linkedinSession}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <rect width="32" height="32" rx="6" fill="#fff"/>
              <path d="M12.1 13.6h-2.6V24h2.6V13.6zM10.8 12.5c.8 0 1.3-.5 1.3-1.2-.1-.7-.5-1.2-1.3-1.2-.8 0-1.3.5-1.3 1.2 0 .7.5 1.2 1.3 1.2zM14.1 13.6v10.4h2.6v-5.8c0-1.5.5-2.4 1.8-2.4 1.2 0 1.7.8 1.7 2.4v5.8h2.6v-6.2c0-2.7-1.4-4-3.3-4-1.5 0-2.1.8-2.5 1.4h.1v-1.2h-2.6c.1.8 0 10.4 0 10.4z" fill="#0A66C2"/>
            </svg>
            {linkedinSession ? 'Logged in to LinkedIn' : 'Log in to LinkedIn'}
          </button>
          {/* Telegram */}
          <button
            className="login-oval"
            style={{ background: '#229ED9', color: '#fff', fontWeight: 600, fontSize: '1.1em', padding: '1.2em 2.5em', borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', gap: 16, minWidth: 320, justifyContent: 'center', opacity: telegramSession ? 0.7 : 1 }}
            onClick={() => !telegramSession && setShowTelegramModal(true)}
            disabled={!!telegramSession}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <circle cx="16" cy="16" r="16" fill="#229ED9"/>
              <path d="M24.1 9.6l-2.2 11c-.2.8-.7 1-1.4.6l-3-2.2-1.4 1.3c-.1.1-.2.2-.4.2l.2-1.7 6.2-5.6c.3-.3-.1-.5-.4-.4l-7.7 4.8-2.6-.8c-.8-.2-.8-.8.2-1.2l12-4.6c.7-.3 1.3.2 1.1 1z" fill="#fff"/>
            </svg>
            {telegramSession ? 'Logged in to Telegram' : 'Log in to Telegram'}
          </button>
          {/* Twitter/X */}
          <button
            className="login-oval"
            style={{ background: '#1DA1F2', color: '#fff', fontWeight: 600, fontSize: '1.1em', padding: '1.2em 2.5em', borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', gap: 16, minWidth: 320, justifyContent: 'center', opacity: twitterSession ? 0.7 : 1 }}
            onClick={() => { if (!twitterSession) window.open('/api/twitter/auth', '_blank', 'width=600,height=700'); }}
            disabled={!!twitterSession}
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
              <rect width="32" height="32" rx="6" fill="#1DA1F2"/>
              <path d="M21.5 9h2.1l-4.6 5.2 5.4 7.8h-4.2l-3.2-4.7-3.7 4.7h-2.1l4.9-5.6-5.2-7.4h4.2l2.9 4.3 3.4-4.3zm-.7 10.7h1.2l-3.7-5.4-1.2 1.4 3.7 4z" fill="#fff"/>
            </svg>
            {twitterSession ? 'Logged in to X (Twitter)' : 'Log in to X (Twitter)'}
          </button>
        </div>
        {/* Modals */}
        {blueskyModal}
        {telegramModal}
        {/* Proceed button */}
        <div style={{ marginTop: 40 }}>
          <a href="/scheduler">
            <button style={{ minWidth: 220, fontSize: '1.1em', fontWeight: 700 }}>
              Proceed to Content Generator
            </button>
          </a>
        </div>
      </div>
    </main>
  );
}

export default NewHomePage;
