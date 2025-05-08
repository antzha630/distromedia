import { useState } from 'react';
import { useRouter } from 'next/router';

function NewHomePage() {
  const router = useRouter();
  const name = "Brad";

  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');

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
      </div>
    </main>
  );
}

export default NewHomePage;
