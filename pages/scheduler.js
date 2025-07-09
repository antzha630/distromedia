import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function SchedulerPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [tweet, setTweet] = useState('');
  const [blueskySession, setBlueskySession] = useState(null);
  const [blueskyUserHandle, setBlueskyUserHandle] = useState('');
  const [linkedinSession, setLinkedinSession] = useState(null);
  const [articleUrl, setArticleUrl] = useState('');
  const [articleMetadata, setArticleMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [telegramSession, setTelegramSession] = useState(null);
  const [summarizing, setSummarizing] = useState(false);
  const [twitterSession, setTwitterSession] = useState(null);

  // Load sessions from sessionStorage on mount
  useEffect(() => {
    const storedBlueskySession = sessionStorage.getItem('blueskySession');
    const storedBlueskyHandle = sessionStorage.getItem('blueskyHandle');
    const storedLinkedinSession = sessionStorage.getItem('linkedinSession');
    const storedTelegramSession = sessionStorage.getItem('telegramSession');
    const storedTwitterSession = sessionStorage.getItem('twitterSession');

    if (storedBlueskySession) {
      setBlueskySession(JSON.parse(storedBlueskySession));
    }
    if (storedBlueskyHandle) {
      setBlueskyUserHandle(storedBlueskyHandle);
    }
    if (storedLinkedinSession) {
      setLinkedinSession(JSON.parse(storedLinkedinSession));
    }
    if (storedTelegramSession) setTelegramSession(JSON.parse(storedTelegramSession));
    if (storedTwitterSession) setTwitterSession(JSON.parse(storedTwitterSession));

    // Handle Twitter session from URL
    if (router.query.twitterSession) {
      try {
        const session = JSON.parse(decodeURIComponent(router.query.twitterSession));
        sessionStorage.setItem('twitterSession', JSON.stringify(session));
        setTwitterSession(session);
        // Remove the query param from the URL after storing
        router.replace('/scheduler', undefined, { shallow: true });
      } catch (error) {
        console.error('Failed to parse Twitter session:', error);
      }
    }
  }, [router]);

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
      sessionStorage.setItem('articleUrl', articleUrl);
      sessionStorage.setItem('articleMetadata', JSON.stringify(data));
      // Pre-fill the input text with the full article text if available
      if (data.articleText && data.articleText.length > 0) {
        setInputText(data.articleText);
      } else {
        setInputText(`${data.title}\n\n${data.description || ''}`);
      }
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
    setSummarizing(true);
    try {
      // LinkedIn summary (professional)
      const resLinkedIn = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          platform: 'linkedin'
        }),
      });
      const dataLinkedIn = await resLinkedIn.json();

      // Bluesky summary (casual)
      const resBluesky = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          platform: 'bluesky'
        }),
      });
      const dataBluesky = await resBluesky.json();

      // Telegram summary (direct and concise)
      const resTelegram = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          platform: 'telegram'
        }),
      });
      const dataTelegram = await resTelegram.json();

      if (dataLinkedIn.summary) {
        sessionStorage.setItem('linkedinSummary', dataLinkedIn.summary);
      }
      if (dataBluesky.summary) {
        sessionStorage.setItem('blueskySummary', dataBluesky.summary);
      }
      if (dataTelegram.summary) {
        sessionStorage.setItem('telegramMessage', dataTelegram.summary);
      }
      if (!dataLinkedIn.summary && !dataBluesky.summary && !dataTelegram.summary) {
        alert('❌ No summary was generated. Please try again.');
      } else {
        alert('✅ Summaries generated! Go to the Post page to review and post.');
      }
    } catch (error) {
      console.error('Summarize error:', error);
      alert('❌ Failed to generate summary. Please try again.');
    } finally {
      setSummarizing(false);
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

  const postToTwitter = async () => {
    if (!twitterSession) {
      alert('Please log in to X (Twitter) first via the homepage.');
      return;
    }
    if (!tweet) {
      alert('Please enter a summary to post.');
      return;
    }
    try {
      const res = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tweet,
          accessToken: twitterSession.accessToken,
          accessSecret: twitterSession.accessSecret
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Posted to X (Twitter)!');
      } else {
        alert('❌ X (Twitter) post failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('X (Twitter) post error:', error);
      alert('❌ Failed to post to X (Twitter)');
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
            <br />
          </>
        )}
        {telegramSession && (
          <>
            <span style={{ color: '#229ED9', fontWeight: 600 }}>
              {telegramSession.firstName || telegramSession.first_name || ''} {telegramSession.lastName || telegramSession.last_name || ''}
              {telegramSession.username ? ` (@${telegramSession.username})` : ''}
            </span> on Telegram
            <br />
          </>
        )}
        {twitterSession && (
          <>
            <span style={{ color: '#1DA1F2', fontWeight: 600 }}>
              {twitterSession.firstName || twitterSession.first_name || ''} {twitterSession.lastName || twitterSession.last_name || ''}
              {twitterSession.username ? ` (@${twitterSession.username})` : ''}
            </span> on X (Twitter)
            <br />
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
        <button onClick={summarize} disabled={summarizing}>{summarizing ? 'Summarizing...' : 'Summarize'}</button>
        {twitterSession && (
          <button onClick={postToTwitter} style={{ background: '#1DA1F2', color: '#fff', fontWeight: 700, fontSize: '1.1em', padding: '0.9em 2.2em', borderRadius: 999, boxShadow: '0 2px 8px #0002', marginTop: 12 }}>
            Post to X (Twitter)
          </button>
        )}
      </section>

      <div style={{ textAlign: 'center', marginTop: '30px', marginBottom: '40px' }}>
        <a href="/post">
          <button style={{ minWidth: 200 }}>Go to Post Page</button>
        </a>
      </div>

      {(!blueskySession || !linkedinSession || !telegramSession || !twitterSession) && (
        <section className="card">
          {!blueskySession && (
            <p>To post to BlueSky, please <a href="/">log in</a> on the homepage.</p>
          )}
          {!linkedinSession && (
            <p>To post to LinkedIn, please <a href="/">log in</a> on the homepage.</p>
          )}
          {!telegramSession && (
            <p>To post to Telegram, please <a href="/">log in</a> on the homepage.</p>
          )}
          {!twitterSession && (
            <p>To post to X (Twitter), please <a href="/">log in</a> on the homepage.</p>
          )}
        </section>
      )}
    </main>
  );
}

export default SchedulerPage; 