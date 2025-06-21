import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

function NewHomePage() {
  const router = useRouter();
  const name = "Brad";
  const telegramContainerRef = useRef(null);

  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');
  const [showBluesky, setShowBluesky] = useState(true);
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [showTelegram, setShowTelegram] = useState(true);
  const [telegramWidgetLoaded, setTelegramWidgetLoaded] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);

  const addDebugLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const log = { timestamp, message, type };
    setDebugLogs(prev => [...prev, log]);
    console.log(`[${timestamp}] ${message}`);
  };

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

    // Handle Telegram callback
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

  useEffect(() => {
    if (showTelegram && telegramContainerRef.current && !telegramWidgetLoaded) {
      addDebugLog('=== TELEGRAM WIDGET LOADING START ===', 'debug');
      
      // Clear the container first
      telegramContainerRef.current.innerHTML = '';
      addDebugLog('Container cleared', 'info');
      
      // Create the script element
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      // Using the new test bot to isolate the issue
      script.setAttribute('data-telegram-login', 'distroappv2_bot'); // This must match the username of your NEW bot
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-radius', '8');
      script.setAttribute('data-userpic', 'true');
      script.setAttribute('data-request-access', 'write');
      
      // Use direct redirect instead of callback
      const currentOrigin = window.location.origin;
      const redirectUrl = `${currentOrigin}/api/telegram/callback`;
      script.setAttribute('data-redirect-url', redirectUrl);
      
      // Debug logging
      addDebugLog(`Bot name: ${script.getAttribute('data-telegram-login')}`, 'info');
      addDebugLog(`Current origin: ${currentOrigin}`, 'info');
      addDebugLog(`Redirect URL: ${redirectUrl}`, 'info');
      addDebugLog(`Script src: ${script.src}`, 'info');
      
      // Add error handling
      script.onerror = (error) => {
        addDebugLog(`❌ Failed to load Telegram widget script: ${error}`, 'error');
        setTelegramWidgetLoaded(false);
      };
      
      script.onload = () => {
        addDebugLog('✅ Telegram widget script loaded successfully', 'success');
        setTelegramWidgetLoaded(true);
      };
      
      // Append the script to the container
      telegramContainerRef.current.appendChild(script);
      addDebugLog('Script appended to container', 'info');
      addDebugLog('=== TELEGRAM WIDGET LOADING END ===', 'debug');
    }
  }, [showTelegram, telegramWidgetLoaded]);

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

  const reloadTelegramWidget = () => {
    setTelegramWidgetLoaded(false);
    if (telegramContainerRef.current) {
      telegramContainerRef.current.innerHTML = '';
    }
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
              <div ref={telegramContainerRef} style={{ marginTop: '20px', minHeight: '50px' }}></div>
              {!telegramWidgetLoaded && (
                <div style={{ marginTop: '10px' }}>
                  <button 
                    onClick={reloadTelegramWidget}
                    style={{ 
                      padding: '8px 16px', 
                      fontSize: '0.9em', 
                      backgroundColor: '#f8f9fa', 
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Reload Widget
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* Debug Panel */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        width: 'calc(100% - 20px)',
        maxWidth: '800px',
        maxHeight: '250px',
        overflowY: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        padding: '10px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 9999,
        border: '1px solid #555'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', paddingBottom: '5px', borderBottom: '1px solid #555' }}>
          <h4 style={{ margin: 0, color: '#00ffdd' }}>Live Debug Panel</h4>
          <button onClick={() => setDebugLogs([])} style={{ background: '#333', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px' }}>Clear</button>
        </div>
        <div>
          {debugLogs.length === 0 && <div style={{ color: '#888' }}>Waiting for logs...</div>}
          {debugLogs.map((log, index) => (
            <div key={index} style={{
              color: log.type === 'error' ? '#ff7b7b' : log.type === 'success' ? '#7bff7b' : log.type === 'debug' ? '#6c9cff' : '#fff',
              borderBottom: '1px solid #444',
              padding: '2px 0',
              wordBreak: 'break-all'
            }}>
              <span style={{ color: '#888' }}>[{log.timestamp}]</span> {log.message}
            </div>
          )).reverse()}
        </div>
      </div>
    </main>
  );
}

export default NewHomePage;
