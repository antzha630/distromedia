import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

if (typeof window !== 'undefined') {
  window.handleTelegramAuth = (user) => {
    sessionStorage.setItem('telegramSession', JSON.stringify(user));
    window.location.href = '/scheduler';
  };
}

function NewHomePage() {
  const router = useRouter();
  const name = "Brad";

  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');
  const [showBluesky, setShowBluesky] = useState(true);
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [showTelegram, setShowTelegram] = useState(true);
  const [telegramSession, setTelegramSession] = useState(null);

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
  }, [router.query.linkedin]);

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

    // Sanitize the identifier - remove invisible characters and normalize
    let cleanIdentifier = blueskyId.trim();
    
    // Remove any invisible characters (like zero-width spaces, etc.)
    cleanIdentifier = cleanIdentifier.replace(/[\u200B-\u200D\uFEFF]/g, '');
    
    // Remove @ symbol if present at the beginning
    cleanIdentifier = cleanIdentifier.replace(/^@/, '');
    
    // Remove any trailing dots or spaces
    cleanIdentifier = cleanIdentifier.replace(/[.\s]+$/, '');

    console.log('Original identifier:', JSON.stringify(blueskyId));
    console.log('Cleaned identifier:', JSON.stringify(cleanIdentifier));

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
      // Show more specific error message
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
            <section className="card" style={{ minWidth: 300, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
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
                style={{ display: 'block', marginBottom: '10px' }}
              />
              <input
                type="password"
                placeholder="App Password"
                value={blueskyPass}
                onChange={(e) => setBlueskyPass(e.target.value)}
                style={{ display: 'block', marginBottom: '10px' }}
              />
              <div style={{ fontSize: '0.95em', color: '#aaa', marginBottom: '10px' }}>
                <span>
                  <b>Note:</b> You must use a <a href="https://bsky.app/settings/app-passwords" target="_blank" rel="noopener noreferrer" style={{ color: '#3f51b5', textDecoration: 'underline' }}>Bluesky App Password</a> (not your main password).
                </span>
              </div>
              <button onClick={loginBluesky}>Log in to BlueSky</button>
            </section>
          )}

          {showLinkedIn && (
            <section className="card" style={{ minWidth: 300, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
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
              <button onClick={loginLinkedIn}>
                Log in with LinkedIn
              </button>
            </section>
          )}

          {showTelegram && (
            <section className="card" style={{ minWidth: 300, textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                <svg width="50" height="50" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="120" cy="120" r="120" fill="#229ED9"/>
                  <path d="M180.5 72.5L157.5 180.5C155.5 188.5 150.5 190.5 143.5 186.5L110.5 161.5L94.5 176.5C92.5 178.5 91 180 87.5 180L90.5 145.5L157.5 84.5C160.5 81.5 157.5 80 153.5 83.5L77.5 140.5L44.5 130.5C37.5 128.5 37.5 123.5 46.5 120.5L172.5 74.5C178.5 72.5 182.5 75.5 180.5 72.5Z" fill="white"/>
                </svg>
              </div>
              <h3>Login with Telegram</h3>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `
                      <script async src="https://telegram.org/js/telegram-widget.js?7"
                        data-telegram-login="distromedia_bot"
                        data-size="large"
                        data-userpic="true"
                        data-request-access="write"
                        data-onauth="handleTelegramAuth(user)"
                      ></script>
                    `
                  }}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default NewHomePage;
