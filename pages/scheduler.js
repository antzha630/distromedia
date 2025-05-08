import { useState, useEffect } from 'react';

function SchedulerPage() {
  const [inputText, setInputText] = useState('');
  const [tweet, setTweet] = useState('');
  const [blueskySession, setBlueskySession] = useState(null);
  const [blueskyUserHandle, setBlueskyUserHandle] = useState('');

  // Load session from sessionStorage on mount
  useEffect(() => {
    const storedSession = sessionStorage.getItem('blueskySession');
    const storedHandle = sessionStorage.getItem('blueskyHandle');
    if (storedSession) {
      setBlueskySession(JSON.parse(storedSession));
    }
    if (storedHandle) {
      setBlueskyUserHandle(storedHandle);
    }
  }, []); // Empty dependency array ensures this runs only once on mount

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

  const postToBluesky = async () => {
    if (!blueskySession) {
      alert('Please log in to Bluesky first via the homepage.');
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
      <h1>🧠 AI Content Generator</h1>
      <p style={{ textAlign: 'left', marginTop: '10px', marginBottom: '30px' }}>
        This is where you can create social media content from your articles and publish them, all without leaving DistroMedia!
        <br />
        <br />
        Currently, you are signed in as:
        <br />
        <a 
          href="https://x.com/PlaceholderAccount" 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: '#3f51b5' }}
        >
          @PlaceholderAccount
        </a> on X
        {blueskySession && blueskyUserHandle && (
          <>
            <br />
            <a 
              href={`https://bsky.app/profile/${blueskyUserHandle.replace(/^@/, '')}`}
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3f51b5' }}
            >
              {blueskyUserHandle.startsWith('@') ? blueskyUserHandle : `@${blueskyUserHandle}`}
            </a> on BlueSky
          </>
        )}
      </p>

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
        <h3>AI-Generated Output (edit as needed):</h3>
        <textarea
          rows="3"
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
        />
        {tweet && <button onClick={publishTweet}>Upload to Twitter</button>}
        {tweet && blueskySession && (
          <button onClick={postToBluesky} style={{ marginLeft: '10px' }}>
            Upload to Bluesky
          </button>
        )}
      </section>

      {!blueskySession && (
        <section className="card">
            <p>To post to BlueSky, please <a href="/">log in</a> on the homepage.</p>
        </section>
      )}
    </main>
  );
}

export default SchedulerPage; 