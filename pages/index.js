import { useState, useEffect, useRef } from 'react';
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
  const telegramWidgetRef = useRef(null);

  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');
  const [showBluesky, setShowBluesky] = useState(true);
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [showTelegram, setShowTelegram] = useState(true);
  const [telegramSession, setTelegramSession] = useState(null);
  const [telegramWidgetLoaded, setTelegramWidgetLoaded] = useState(false);

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

  // Load Telegram widget when component mounts and showTelegram is true
  useEffect(() => {
    if (showTelegram && telegramWidgetRef.current && !telegramWidgetLoaded) {
      try {
        // Clear any existing content
        telegramWidgetRef.current.innerHTML = '';
        
        // Add a loading indicator
        telegramWidgetRef.current.innerHTML = '<div style="padding: 20px; color: #666;">Loading Telegram login...</div>';
        
        // Create the script element
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', 'distromedia_bot');
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '8');
        script.setAttribute('data-userpic', 'true');
        script.setAttribute('data-request-access', 'write');
        script.setAttribute('data-onauth', 'handleTelegramAuth');
        script.setAttribute('data-auth-url', window.location.origin);
        script.setAttribute('data-lang', 'en');
        
        // Add debug logging for widget initialization
        console.log('Initializing Telegram widget with bot:', 'distromedia_bot');
        console.log('Auth URL:', window.location.origin);
        
        script.onerror = (error) => {
          console.error('Telegram widget failed to load:', error);
          telegramWidgetRef.current.innerHTML = `
            <div style="padding: 20px; text-align: center;">
              <div style="color: #ff4444; margin-bottom: 10px;">❌ Failed to load Telegram login</div>
              <button 
                onClick={() => {
                  setTelegramWidgetLoaded(false);
                  telegramWidgetRef.current.innerHTML = '';
                }}
                style="background: #229ED9; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;"
              >
                Retry
              </button>
            </div>
          `;
        };
        
        script.onload = () => {
          console.log('Telegram widget script loaded');
          // Clear loading indicator
          telegramWidgetRef.current.innerHTML = '';
          
          if (!window.handleTelegramAuth) {
            console.error('handleTelegramAuth not found on window object');
            telegramWidgetRef.current.innerHTML = `
              <div style="padding: 20px; text-align: center; color: #ff4444;">
                ❌ Telegram login configuration error
              </div>
            `;
          } else {
            console.log('Telegram auth handler is properly configured');
            // The widget should now be visible
          }
        };
        
        // Append the script to the container
        telegramWidgetRef.current.appendChild(script);
        setTelegramWidgetLoaded(true);
        console.log('Telegram widget container initialized');
      } catch (error) {
        console.error('Error setting up Telegram widget:', error);
        telegramWidgetRef.current.innerHTML = `
          <div style="padding: 20px; text-align: center;">
            <div style="color: #ff4444; margin-bottom: 10px;">❌ Error setting up Telegram login</div>
            <button 
              onClick={() => {
                setTelegramWidgetLoaded(false);
                telegramWidgetRef.current.innerHTML = '';
              }}
              style="background: #229ED9; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;"
            >
              Retry
            </button>
          </div>
        `;
      }
    }
  }, [showTelegram, telegramWidgetLoaded]);

  // Add global handler for Telegram auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.handleTelegramAuth = (user) => {
        console.log('Telegram auth callback received:', user);
        console.log('Current domain:', window.location.origin);
        console.log('Bot name configured:', 'distromedia_bot');
        
        if (user) {
          try {
            console.log('Storing Telegram session data:', {
              id: user.id,
              first_name: user.first_name,
              username: user.username
            });
            sessionStorage.setItem('telegramSession', JSON.stringify(user));
            router.push('/scheduler');
          } catch (error) {
            console.error('Error handling Telegram auth:', error);
            alert('Error saving Telegram login data. Please try again.');
          }
        } else {
          console.error('No user data received from Telegram');
          alert('No user data received from Telegram. Please try again.');
        }
      };
      console.log('Telegram auth handler registered on window object');
    }
  }, [router]);

  // Reset widget loaded state when showTelegram changes
  useEffect(() => {
    if (!showTelegram) {
      setTelegramWidgetLoaded(false);
      if (telegramWidgetRef.current) {
        telegramWidgetRef.current.innerHTML = '';
      }
    }
  }, [showTelegram]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (telegramWidgetRef.current) {
        telegramWidgetRef.current.innerHTML = '';
      }
    };
  }, []);

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

  // Add function to verify bot configuration
  const verifyTelegramBot = async () => {
    try {
      const response = await fetch('/api/telegram/debug');
      const data = await response.json();
      
      if (data.success) {
        let message = `✅ Bot verified successfully!\n`;
        message += `Bot name: ${data.bot.first_name}\n`;
        message += `Username: @${data.bot.username}\n`;
        message += `Domain: ${data.domainCheck.currentDomain}\n`;
        message += `HTTPS: ${data.domainCheck.isHttps ? '✅' : '❌'}\n`;
        message += `Accessible: ${data.domainCheck.accessible ? '✅' : '❌'}\n\n`;
        message += `Instructions:\n`;
        data.instructions.forEach((instruction, index) => {
          message += `${instruction}\n`;
        });
        if (data.troubleshooting) {
          message += `\nTroubleshooting:\n`;
          data.troubleshooting.forEach((tip, index) => {
            message += `${tip}\n`;
          });
        }
        alert(message);
      } else {
        let message = `❌ Bot verification failed: ${data.error}\n\n`;
        message += `Debug Info:\n`;
        message += `Token configured: ${data.debugInfo.botTokenConfigured ? '✅' : '❌'}\n`;
        message += `Token prefix: ${data.debugInfo.botTokenPrefix}\n`;
        message += `Current domain: ${data.debugInfo.currentDomain}\n`;
        message += `Protocol: ${data.debugInfo.protocol}\n\n`;
        message += `Instructions:\n`;
        data.instructions.forEach((instruction, index) => {
          message += `${instruction}\n`;
        });
        alert(message);
      }
    } catch (error) {
      console.error('Bot verification error:', error);
      alert('❌ Failed to verify bot configuration. Check console for details.');
    }
  };

  // Add function to test bot token
  const testTelegramBot = async () => {
    try {
      const response = await fetch('/api/telegram/test');
      const data = await response.json();
      
      if (data.success) {
        let message = `✅ Bot test successful!\n`;
        message += `Bot name: ${data.bot.first_name}\n`;
        message += `Username: @${data.bot.username}\n`;
        message += `Bot ID: ${data.bot.id}\n\n`;
        message += data.message;
        alert(message);
      } else {
        let message = `❌ Bot test failed: ${data.error}\n\n`;
        if (data.details) {
          message += `Details: ${JSON.stringify(data.details, null, 2)}\n\n`;
        }
        message += `Instructions:\n`;
        data.instructions.forEach((instruction, index) => {
          message += `${instruction}\n`;
        });
        alert(message);
      }
    } catch (error) {
      console.error('Bot test error:', error);
      alert('❌ Failed to test bot. Check console for details.');
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <div ref={telegramWidgetRef} />
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button 
                    onClick={verifyTelegramBot}
                    style={{ 
                      backgroundColor: '#229ED9',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Verify Bot
                  </button>
                  <button 
                    onClick={testTelegramBot}
                    style={{ 
                      backgroundColor: '#666',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    Test Bot
                  </button>
                </div>
                <div style={{ fontSize: '0.9em', color: '#666', marginTop: '10px', textAlign: 'left', maxWidth: '280px' }}>
                  <strong>Troubleshooting:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>If widget doesn't appear, click "Verify Bot"</li>
                    <li>Make sure your bot domain is set correctly</li>
                    <li>Check browser console for errors</li>
                    <li>Try refreshing the page</li>
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

export default NewHomePage;
