import { useState } from 'react';

function HomePage() {
  const [inputText, setInputText] = useState('');
  const [tweet, setTweet] = useState('');

  const [blueskySession, setBlueskySession] = useState(null);
  const [blueskyId, setBlueskyId] = useState('');
  const [blueskyPass, setBlueskyPass] = useState('');

  const summarize = async () => {
    const res = await fetch('/api/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: inputText }),
    });
    const data = await res.json();
    setTweet(data.summary);
  };

  const publishTweet = async () => {
    const res = await fetch('/api/tweet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweet }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('✅ Tweet posted successfully!');
    } else {
      alert('❌ Error: ' + data.error);
    }
  };

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
      setBlueskySession(data.session);
    } else {
      alert('❌ Bluesky login failed');
    }
  };

  const postToBluesky = async () => {
    if (!blueskySession) {
      alert('Please log in to Bluesky first');
      return;
    }

    const res = await fetch('/api/bluesky/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: tweet,
        accessJwt: blueskySession.accessJwt,
        did: blueskySession.did,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Posted to Bluesky!');
    } else {
      alert('❌ Bluesky post failed: ' + data.error);
    }
  };

  return (
    <main className="container">
      <h1>🧠 Tweet Summarizer</h1>

      <section className="card">
        <label htmlFor="articleInput">Paste your article:</label>
        <textarea
          id="articleInput"
          rows="6"
          placeholder="Paste text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button onClick={summarize}>Summarize</button>
      </section>

      <section className="card">
        <h3>AI-Generated Tweet:</h3>
        <textarea
          rows="3"
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
        />
        {tweet && <button onClick={publishTweet}>Publish to Twitter</button>}
      </section>

      <section className="card">
        <h3>Bluesky Login:</h3>
        <input
          placeholder="Bluesky handle"
          value={blueskyId}
          onChange={(e) => setBlueskyId(e.target.value)}
        />
        <input
          type="password"
          placeholder="App Password"
          value={blueskyPass}
          onChange={(e) => setBlueskyPass(e.target.value)}
        />
        <button onClick={loginBluesky}>Log in to Bluesky</button>

        {tweet && blueskySession && (
          <button onClick={postToBluesky}>Post to Bluesky</button>
        )}
      </section>
    </main>
  );
}

export default HomePage;
