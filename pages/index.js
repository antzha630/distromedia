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
  
  // New Telegram API Login States
  const [telegramPhone, setTelegramPhone] = useState('');
  const [telegramCode, setTelegramCode] = useState('');
  const [telegramPhoneCodeHash, setTelegramPhoneCodeHash] = useState('');
  const [telegramSessionString, setTelegramSessionString] = useState('');
  const [telegramStep, setTelegramStep] = useState('phone'); // 'phone' or 'code'
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramError, setTelegramError] = useState('');

  // This ref is no longer needed for the widget, but can be kept for future use or removed.
  const telegramContainerRef = useRef(null);

  useEffect(() => {
    // Handle LinkedIn OAuth callback
    const linkedinData = router.query.linkedin;
    if (linkedinData) {
      try {
        const session = JSON.parse(decodeURIComponent(linkedinData));
        sessionStorage.setItem('linkedinSession', JSON.stringify(session));
        router.push('/scheduler');
      } catch (error) {
        console.error('Failed to parse LinkedIn session:', error);
      }
    }

    // Handle potential Telegram callback data if needed in the future
    const telegramData = router.query.telegramSession;
    if (telegramData) {
      try {
        const session = JSON.parse(decodeURIComponent(telegramData));
        sessionStorage.setItem('telegramSession', JSON.stringify(session));
        router.push('/scheduler');
      } catch (error) {
        console.error('Failed to parse Telegram session:', error);
      }
    }
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
        router.push('/scheduler');
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
      router.push('/scheduler');
    } else {
      const errorMsg = data.error || 'Login failed';
      alert(`❌ Bluesky login failed: ${errorMsg}`);
      console.error('Bluesky login error details:', data.details);
    }
  };

  const loginLinkedIn = () => {
    window.location.href = '/api/linkedin/auth';
  };

  return (
    <main className="container">
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Welcome back, {name}</h1>
        <p style={{ fontSize: '1.5em', marginTop: '20px' }}>DistroMedia content scheduler</p>

        <div style={{ margin: '30px 0 40px 0', display: 'flex', justifyContent: 'center', gap: '32px' }}>
          <label style={{ fontWeight: 600, fontSize: '1.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={showBluesky}
              onChange={e => setShowBluesky(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            Bluesky
          </label>
          <label style={{ fontWeight: 600, fontSize: '1.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={showLinkedIn}
              onChange={e => setShowLinkedIn(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            LinkedIn
          </label>
          <label style={{ fontWeight: 600, fontSize: '1.1em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={showTelegram}
              onChange={e => setShowTelegram(e.target.checked)}
              style={{ width: 18, height: 18 }}
            />
            Telegram
          </label>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          {showBluesky && (
            <section className="card" style={{ padding: '20px', minWidth: 300, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
              <img 
                src="/images/Bluesky_Logo.png"
                alt="BlueSky Logo"
                style={{ display: 'block', margin: '0 auto 20px auto', width: '50px' }}
              />
              <h3>Login with BlueSky</h3>
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
              <button onClick={loginBluesky} style={{width: '100%', padding: '10px'}}>Log in to BlueSky</button>
            </section>
          )}

          {showLinkedIn && (
            <section className="card" style={{ padding: '20px', minWidth: 300, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
              <div 
                style={{ 
                  color: '#0A66C2', 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  marginBottom: '20px'
                }}
              >
                LinkedIn
              </div>
              <h3>Login with LinkedIn</h3>
              <button onClick={loginLinkedIn} style={{width: '100%', padding: '10px'}}>
                Log in with LinkedIn
              </button>
            </section>
          )}

          {showTelegram && (
            <section className="card" style={{ padding: '20px', minWidth: 300, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <svg width="50" height="50" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="120" cy="120" r="120" fill="#229ED9"/>
                  <path d="M180.5 72.5L157.5 180.5C155.5 188.5 150.5 190.5 143.5 186.5L110.5 161.5L94.5 176.5C92.5 178.5 91 180 87.5 180L90.5 145.5L157.5 84.5C160.5 81.5 157.5 80 153.5 83.5L77.5 140.5L44.5 130.5C37.5 128.5 37.5 123.5 46.5 120.5L172.5 74.5C178.5 72.5 182.5 75.5 180.5 72.5Z" fill="white"/>
                </svg>
              </div>
              <h3>Login with Telegram</h3>
              
              {telegramStep === 'phone' ? (
                <form onSubmit={handleTelegramPhoneSubmit}>
                  <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '10px' }}>
                    A verification code will be sent to your Telegram app.
                  </p>
                  <input
                    type="tel"
                    placeholder="Phone number (e.g., +1234567890)"
                    value={telegramPhone}
                    onChange={(e) => setTelegramPhone(e.target.value)}
                    style={{ display: 'block', marginBottom: '10px', width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    disabled={telegramLoading}
                  />
                  <button 
                    type="submit" 
                    style={{width: '100%', padding: '10px'}}
                    disabled={telegramLoading}
                  >
                    {telegramLoading ? 'Sending Code...' : 'Send Code'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleTelegramCodeSubmit}>
                  <div style={{ marginBottom: '10px', fontSize: '0.9em', color: '#666' }}>
                    A code was sent to your Telegram app for the number {telegramPhone}.
                  </div>
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
                  <button 
                    type="submit" 
                    style={{width: '100%', padding: '10px', marginBottom: '10px'}}
                    disabled={telegramLoading}
                  >
                    {telegramLoading ? 'Verifying...' : 'Log In'}
                  </button>
                  <button 
                    type="button" 
                    onClick={resetTelegramLogin}
                    style={{width: '100%', padding: '8px', fontSize: '0.9em', backgroundColor: '#f8f9fa', border: '1px solid #ddd', cursor: 'pointer'}}
                    disabled={telegramLoading}
                  >
                    Use a different number
                  </button>
                </form>
              )}
              {telegramError && (
                <div style={{ color: '#e74c3c', fontSize: '0.9em', marginTop: '10px' }}>
                  {telegramError}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default NewHomePage;
