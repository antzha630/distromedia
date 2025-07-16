import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

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
    if (storedBlueskySession) setBlueskySession(JSON.parse(storedBlueskySession));
    if (storedLinkedinSession) setLinkedinSession(JSON.parse(storedLinkedinSession));
    if (storedTelegramSession) setTelegramSession(JSON.parse(storedTelegramSession));
    if (storedTwitterSession) setTwitterSession(JSON.parse(storedTwitterSession));

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
        sessionStorage.setItem('telegramSession', JSON.stringify(data.session));
        setTelegramSession(data.session);
        router.replace('/', undefined, { shallow: true });
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

  // Modal content for Bluesky
  const BlueskyModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Login with Bluesky</h2>
        <input
          placeholder="Bluesky handle (e.g. @distromedia.bsky.social)"
          value={blueskyId}
          onChange={(e) => setBlueskyId(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="App Password"
          value={blueskyPass}
          onChange={(e) => setBlueskyPass(e.target.value)}
          style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
        <div style={{ fontSize: '0.95em', color: '#aaa', marginBottom: '10px' }}>
          <span>
            <b>Note:</b> You must use a <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer" style={{ color: '#3f51b5', textDecoration: 'underline' }}>Bluesky App Password</a> (not your main password).
          </span>
        </div>
        <button onClick={async () => { await loginBluesky(); setShowBlueskyModal(false); }} style={{width: '100%', padding: '10px'}}>
          Log in to Bluesky
        </button>
        <button onClick={() => setShowBlueskyModal(false)} style={{width: '100%', marginTop: 8}}>Cancel</button>
      </div>
    </div>
  );

  // Modal content for Telegram
  const TelegramModal = () => (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Login with Telegram</h2>
        {telegramStep === 'phone' ? (
          <form onSubmit={handleTelegramPhoneSubmit}>
            <input
              type="tel"
              placeholder="Phone number (e.g., +1234567890)"
              value={telegramPhone}
              onChange={(e) => setTelegramPhone(e.target.value)}
              style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box' }}
              disabled={telegramLoading}
            />
            <button type="submit" style={{width: '100%', padding: '10px'}} disabled={telegramLoading}>
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
              style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box' }}
              disabled={telegramLoading}
              maxLength={5}
              autoComplete="off"
            />
            <button type="submit" style={{width: '100%', padding: '10px', marginBottom: '10px'}} disabled={telegramLoading}>
              {telegramLoading ? 'Verifying...' : 'Log In'}
            </button>
            <button type="button" onClick={resetTelegramLogin} style={{width: '100%', padding: '8px', fontSize: '0.9em', backgroundColor: '#f8f9fa', border: '1px solid #ddd', cursor: 'pointer'}} disabled={telegramLoading}>
              Use a different number
            </button>
          </form>
        )}
        {telegramError && (
          <div style={{ color: '#e74c3c', fontSize: '0.9em', marginTop: '10px' }}>{telegramError}</div>
        )}
        <button onClick={() => setShowTelegramModal(false)} style={{width: '100%', marginTop: 8}}>Cancel</button>
      </div>
    </div>
  );

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome back, {name}</h1>
        <p style={{ fontSize: '1.5em', marginTop: '20px' }}>DistroMedia content scheduler</p>
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
            <img src="/images/LinkedIn_Logo.svg" alt="LinkedIn" style={{ width: 32, height: 32 }} />
            {linkedinSession ? 'Logged in to LinkedIn' : 'Log in to LinkedIn'}
          </button>
          {/* Telegram */}
          <button
            className="login-oval"
            style={{ background: '#229ED9', color: '#fff', fontWeight: 600, fontSize: '1.1em', padding: '1.2em 2.5em', borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', gap: 16, minWidth: 320, justifyContent: 'center', opacity: telegramSession ? 0.7 : 1 }}
            onClick={() => !telegramSession && setShowTelegramModal(true)}
            disabled={!!telegramSession}
          >
            <img src="/images/telegram-profile.png" alt="Telegram" style={{ width: 32, height: 32, borderRadius: '50%' }} />
            {telegramSession ? 'Logged in to Telegram' : 'Log in to Telegram'}
          </button>
          {/* Twitter/X */}
          <button
            className="login-oval"
            style={{ background: '#1DA1F2', color: '#fff', fontWeight: 600, fontSize: '1.1em', padding: '1.2em 2.5em', borderRadius: 999, border: 'none', display: 'flex', alignItems: 'center', gap: 16, minWidth: 320, justifyContent: 'center', opacity: twitterSession ? 0.7 : 1 }}
            onClick={() => { if (!twitterSession) window.open('/api/twitter/auth', '_blank', 'width=600,height=700'); }}
            disabled={!!twitterSession}
          >
            <svg width="32" height="32" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><circle cx="60" cy="60" r="60" fill="#1DA1F2"/><text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="24" fill="#fff">X</text></svg>
            {twitterSession ? 'Logged in to X (Twitter)' : 'Log in to X (Twitter)'}
          </button>
        </div>
        {/* Modals */}
        {showBlueskyModal && <BlueskyModal />}
        {showTelegramModal && <TelegramModal />}
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
