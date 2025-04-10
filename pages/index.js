import { useState } from 'react';

function HomePage() {
  const [inputText, setInputText] = useState('');
  const [tweet, setTweet] = useState('');

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
  return (
    <div className="container">
      <h1>Tweet Summarizer</h1>

      <label htmlFor="articleInput">Paste your article:</label>
      <textarea
        id="articleInput"
        rows="6"
        placeholder="Paste text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button onClick={summarize}>Summarize</button>

      <h3>AI-Generated Tweet:</h3>
      <textarea
        rows="3"
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
      />

      {tweet && (
        <button onClick={publishTweet}>
          Publish Tweet
        </button>
      )}
    </div>
  );
}

export default HomePage;
