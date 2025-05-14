import { useState, useEffect } from 'react';

function SchedulerPage() {
  const [inputText, setInputText] = useState('');
  const [tweet, setTweet] = useState('');
  const [blueskySession, setBlueskySession] = useState(null);
  const [blueskyUserHandle, setBlueskyUserHandle] = useState('');
  const [linkedinSession, setLinkedinSession] = useState(null);
  const [articleUrl, setArticleUrl] = useState('');
  const [articleMetadata, setArticleMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load sessions from sessionStorage on mount
  useEffect(() => {
    const storedBlueskySession = sessionStorage.getItem('blueskySession');
    const storedBlueskyHandle = sessionStorage.getItem('blueskyHandle');
    const storedLinkedinSession = sessionStorage.getItem('linkedinSession');

    if (storedBlueskySession) {
      setBlueskySession(JSON.parse(storedBlueskySession));
    }
    if (storedBlueskyHandle) {
      setBlueskyUserHandle(storedBlueskyHandle);
    }
    if (storedLinkedinSession) {
      setLinkedinSession(JSON.parse(storedLinkedinSession));
    }
  }, []);

  const fetchArticleMetadata = async () => {
    if (!articleUrl) return;
    
    setIsLoading(true);
    try {
      const res = await fetch(`/api/fetchMetadata?url=${encodeURIComponent(articleUrl)}`);
      const data = await res.json();
      
      if (data.error) {
        alert('❌ Failed to fetch article metadata: ' + data.error);
        return;
      }

      setArticleMetadata(data);
      // Pre-fill the input text with article title and description
      setInputText(`${data.title}\n\n${data.description || ''}`);
    } catch (error) {
      alert('❌ Error fetching article metadata');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const summarize = async () => {
    if (!inputText) {
      alert('Please enter some text to summarize');
      return;
    }

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error('Summarize error:', data);
        alert(`❌ Error: ${data.error || 'Failed to generate summary'}`);
        return;
      }

      if (data.summary) {
        setTweet(data.summary);
      } else {
        alert('❌ No summary was generated. Please try again.');
      }
    } catch (error) {
      console.error('Summarize error:', error);
      alert('❌ Failed to generate summary. Please try again.');
    }
  };

  const postToBluesky = async () => {
    if (!blueskySession) {
      alert('Please log in to Bluesky first via the homepage.');
      return;
    }

    // Check if the text is too long
    if (tweet.length > 280) {
      alert('❌ Summary is too long. Please edit it to be under 280 characters.');
      return;
    }

    // Use only the summary text - the URL will be handled by the rich preview
    const postText = tweet;

    const res = await fetch('/api/bluesky/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: postText,
        accessJwt: blueskySession.accessJwt,
        did: blueskySession.did,
        embed: articleMetadata ? {
          $type: 'app.bsky.embed.external',
          external: {
            uri: articleUrl,
            title: articleMetadata.title,
            description: articleMetadata.description,
            thumb: articleMetadata.image,
          }
        } : undefined
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert('✅ Posted to Bluesky!');
      // Clear the form after successful post
      setInputText('');
      setTweet('');
      setArticleUrl('');
      setArticleMetadata(null);
    } else {
      alert('❌ Bluesky post failed: ' + (data.error || 'Unknown error'));
    }
  };

  const postToLinkedIn = async () => {
    if (!linkedinSession) {
      alert('Please log in to LinkedIn first via the homepage.');
      return;
    }

    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tweet,
          url: articleUrl,
          accessToken: linkedinSession.accessToken,
          userId: linkedinSession.userId
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('✅ Posted to LinkedIn!');
      } else {
        alert('❌ LinkedIn post failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('LinkedIn post error:', error);
      alert('❌ Failed to post to LinkedIn');
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
        {linkedinSession && (
          <>
            <a 
              href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(linkedinSession.name)}`}
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#0A66C2' }}
            >
              {linkedinSession.name}
            </a> on LinkedIn
            <br />
          </>
        )}
        {blueskySession && blueskyUserHandle && (
          <>
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
        <label htmlFor="urlInput">Article URL:</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            id="urlInput"
            type="url"
            placeholder="Paste article URL here..."
            value={articleUrl}
            onChange={(e) => setArticleUrl(e.target.value)}
            style={{ flex: 1, marginBottom: 0 }}
          />
          <button 
            onClick={fetchArticleMetadata}
            disabled={isLoading}
            style={{ marginTop: 0 }}
          >
            {isLoading ? 'Loading...' : 'Fetch Article'}
          </button>
        </div>

        {articleMetadata && (
          <div style={{ 
            backgroundColor: '#222',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Article Preview</h4>
            {articleMetadata.image && (
              <img 
                src={articleMetadata.image} 
                alt={articleMetadata.title}
                style={{ 
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  marginBottom: '10px'
                }}
              />
            )}
            <h3 style={{ margin: '0 0 5px 0' }}>{articleMetadata.title}</h3>
            <p style={{ margin: '0', color: '#aaa' }}>{articleMetadata.description}</p>
          </div>
        )}

        <label htmlFor="articleInput">Or paste your article text:</label>
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
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start' }}>
          {tweet && blueskySession && (
            <button onClick={postToBluesky}>
              Upload to Bluesky {articleMetadata ? 'with Preview' : ''}
            </button>
          )}
          {tweet && linkedinSession && (
            <button onClick={postToLinkedIn}>
              Upload to LinkedIn {articleUrl ? 'with Article' : ''}
            </button>
          )}
        </div>
      </section>

      {(!blueskySession || !linkedinSession) && (
        <section className="card">
          {!blueskySession && (
            <p>To post to BlueSky, please <a href="/">log in</a> on the homepage.</p>
          )}
          {!linkedinSession && (
            <p>To post to LinkedIn, please <a href="/">log in</a> on the homepage.</p>
          )}
        </section>
      )}
    </main>
  );
}

export default SchedulerPage; 