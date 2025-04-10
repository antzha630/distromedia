import { useState } from 'react';
import React from 'react'; // Keep for clarity, though maybe not strictly needed

function HomePage() { // Renamed from App to HomePage for clarity
  const [inputText, setInputText] = useState('');
  const [tweet, setTweet] = useState('');

  const summarize = async () => {
    // Update the fetch call to the Next.js API route
    const res = await fetch('/api/summarize', {
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
        onChange={(e) => setTweet(e.target.value)} // Keep original behavior
      />
      <br />
      {/* Conditionally render the Publish button if a tweet exists */}
      {tweet && (
        <button 
          style={{ marginTop: '1rem' }} 
          onClick={() => console.log('Publish Tweet clicked (no action yet)')}
        >
          Publish Tweet
        </button>
      )}
    </div>
  );
}

export default HomePage; 