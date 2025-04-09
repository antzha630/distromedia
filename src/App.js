import { useState } from 'react';
import React from 'react';
function App() {
  const [inputText, setInputText] = useState('');
  const [tweet, setTweet] = useState('');

  const summarize = async () => {
    const res = await fetch('http://localhost:3001/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: inputText }),
    });

    const data = await res.json();
    setTweet(data.summary);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>Tweet Summarizer</h1>
      <textarea
        rows="6"
        cols="60"
        placeholder="Paste text here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <br />
      <button onClick={summarize} style={{ marginTop: '1rem' }}>Summarize</button>

      <h3 style={{ marginTop: '2rem' }}>AI-Generated Tweet:</h3>
      <textarea
        rows="3"
        cols="60"
        value={tweet}
        onChange={(e) => setTweet(e.target.value)}
      />
    </div>
  );
}

export default App;
