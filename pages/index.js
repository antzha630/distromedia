import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';

function NewHomePage() {
  const router = useRouter();
  
  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');
  const [showBluesky, setShowBluesky] = useState(true);
  const [showLinkedIn, setShowLinkedIn] = useState(true);
  const [showTelegram, setShowTelegram] = useState(true);

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

    // Define the Telegram callback function on the window object
    window.onTelegramAuth = (user) => {
      console.log('Telegram auth callback received:', user);
      if (user) {
        try {
          sessionStorage.setItem('telegramSession', JSON.stringify(user));
          router.push('/scheduler');
        } catch (error) {
          console.error('Error saving Telegram login data:', error);
          alert('Error saving Telegram login data. Please try again.');
        }
      } else {
        console.error('No user data received from Telegram');
        alert('No user data received from Telegram. Please try again.');
      }
    };

    // Cleanup the global function when the component unmounts
    return () => {
      delete window.onTelegramAuth;
    };
  }, [router]);

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
    console.log('Cleaned identifier:', cleanIdentifier);

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
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>distromedia</h1>
        <p>one-click cross-platform posting</p>
      </div>

      <div className="card-container">
        {showLinkedIn && (
          <section className="card">
            <div className="logo-container linkedin-logo">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.25 6.5 1.75 1.75 0 016.5 8.25zM19 19h-3v-4.75c0-1.4-1.2-2.5-2.5-2.5S11 12.85 11 14.25V19h-3v-9h3v1.39c.78-1.45 2.3-2.39 3.5-2.39 2.48 0 4.5 2.22 4.5 5v5z"></path>
              </svg>
            </div>
            <h3>Login with LinkedIn</h3>
            <button onClick={loginLinkedIn} className="linkedin-button">
              Log in with LinkedIn
            </button>
          </section>
        )}

        {showBluesky && (
          <section className="card">
            <div className="logo-container bluesky-logo">
              <svg width="50" height="50" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M128 256C198.693 256 256 198.693 256 128C256 57.3075 198.693 0 128 0C57.3075 0 0 57.3075 0 128C0 198.693 57.3075 256 128 256Z" fill="#1185FE"/>
                <path d="M198.813 68.25C189.625 79.0625 188.5 95.8438 188.5 95.8438C188.5 95.8438 189.594 95.8125 190.125 95.7812C203.375 94.625 210.844 87.625 214.531 82.7188C218.219 77.8125 217.156 72.3125 216.781 70.1875C216.031 65.9375 210.25 64.9062 210.25 64.9062C198.219 63.1875 192.313 66.8125 192.313 66.8125C192.313 66.8125 193.313 65.625 194.281 64.9375C201.219 59.8438 192.844 54.3438 185.875 57.4375C178.906 60.5312 181.031 68.625 181.031 68.625L178.969 77.8438C178.969 77.8438 171.031 71.9375 161.313 70.3125C148.563 68.1875 136.875 70.375 136.875 70.375C136.875 70.375 125.844 67.875 111.406 72.4375C96.9688 77 88.0625 87.125 88.0625 87.125C88.0625 87.125 81.2188 84.125 76.5312 85.5C71.8438 86.875 69.1875 91.8125 69.1875 91.8125C65.3438 100.875 74.5312 104.906 74.5312 104.906C74.5312 104.906 80.4062 102.344 82.5312 100.281C82.5312 100.281 83.5625 110.531 75.3438 119.531C67.125 128.531 59.4375 132.844 59.4375 132.844C59.4375 132.844 64.5312 143.25 77.5312 148.812C90.5312 154.375 101.531 152.938 101.531 152.938C101.531 152.938 105.906 160.812 113.844 163.5C121.781 166.188 128.438 165.438 128.438 165.438L150.469 135.25C150.469 135.25 167.219 148.438 178.375 151.031C189.531 153.625 198.813 149.344 198.813 149.344C198.813 149.344 213.719 143.062 216.906 128.531C220.094 114 207.844 103.5 207.844 103.5C207.844 103.5 214.781 96.5312 214.531 89.2812C214.281 82.0312 206.813 76.125 206.813 76.125C206.813 76.125 208.031 70.8125 198.813 68.25Z" fill="white"/>
              </svg>
            </div>
            <h3>Login with Bluesky</h3>
            <input
              type="text"
              value={blueskyId}
              onChange={(e) => setBlueskyId(e.target.value)}
              placeholder="handle or email"
              className="input-field"
            />
            <input
              type="password"
              value={blueskyPass}
              onChange={(e) => setBlueskyPass(e.target.value)}
              placeholder="app password"
              className="input-field"
            />
            <button onClick={loginBluesky} className="bluesky-button">Log in with Bluesky</button>
          </section>
        )}

        {showTelegram && (
          <section className="card">
            <div className="logo-container telegram-logo">
              <svg width="50" height="50" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg">
                <circle cx="120" cy="120" r="120" fill="#229ED9"/>
                <path d="M180.5 72.5L157.5 180.5C155.5 188.5 150.5 190.5 143.5 186.5L110.5 161.5L94.5 176.5C92.5 178.5 91 180 87.5 180L90.5 145.5L157.5 84.5C160.5 81.5 157.5 80 153.5 83.5L77.5 140.5L44.5 130.5C37.5 128.5 37.5 123.5 46.5 120.5L172.5 74.5C178.5 72.5 182.5 75.5 180.5 72.5Z" fill="white"/>
              </svg>
            </div>
            <h3>Login with Telegram</h3>
            <div style={{ marginTop: '20px' }}>
              <Script
                src="https://telegram.org/js/telegram-widget.js?22"
                strategy="lazyOnload"
                data-telegram-login="distromedia_bot"
                data-size="large"
                data-radius="8"
                data-userpic="true"
                data-request-access="write"
                data-onauth="onTelegramAuth(user)"
              />
            </div>
          </section>
        )}
      </div>

      <style jsx>{`
        .container {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .card-container {
          display: flex;
          justify-content: center;
          gap: 32px;
          flex-wrap: wrap;
        }
        .card {
          background: #fff;
          padding: 24px;
          text-align: center;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          border-radius: 16px;
          min-width: 300px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
        }
        .logo-container {
          margin-bottom: 20px;
        }
        .logo-container svg {
          width: 50px;
          height: 50px;
        }
        h3 {
          margin-bottom: 20px;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .input-field {
          width: 100%;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 8px;
          border: 1px solid #ddd;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }
        .linkedin-button { background-color: #0A66C2; }
        .linkedin-button:hover { background-color: #004182; }
        .bluesky-button { background-color: #1185FE; }
        .bluesky-button:hover { background-color: #005fcc; }
      `}</style>
    </main>
  );
}

export default NewHomePage;
