import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function NewHomePage() {
  const router = useRouter();
  const name = "Brad";

  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');

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
    const res = await fetch('/api/bluesky/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: blueskyId,
        appPassword: blueskyPass,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Logged into Bluesky');
      sessionStorage.setItem('blueskySession', JSON.stringify(data.session));
      sessionStorage.setItem('blueskyHandle', blueskyId);
      router.push('/scheduler');
    } else {
      alert('❌ Bluesky login failed');
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
        
        <section className="card" style={{ marginTop: '40px', display: 'inline-block', textAlign: 'center' }}>
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
            placeholder="Password"
            value={blueskyPass}
            onChange={(e) => setBlueskyPass(e.target.value)}
            style={{ display: 'block', marginBottom: '10px' }}
          />
          <button onClick={loginBluesky}>Log in to BlueSky</button>
        </section>

        <section className="card" style={{ marginTop: '20px', display: 'inline-block', textAlign: 'center' }}>
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
      </div>
    </main>
  );
}

export default NewHomePage;
