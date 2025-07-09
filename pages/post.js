import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function PostPage() {
  const router = useRouter();
  const [linkedinSummary, setLinkedinSummary] = useState('');
  const [blueskySummary, setBlueskySummary] = useState('');
  const [articleUrl, setArticleUrl] = useState('');
  const [articleMetadata, setArticleMetadata] = useState(null);
  const [blueskySession, setBlueskySession] = useState(null);
  const [blueskyUserHandle, setBlueskyUserHandle] = useState('');
  const [linkedinSession, setLinkedinSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'linkedin' or 'bluesky' or 'telegram'
  const [blueskyAvatarUrl, setBlueskyAvatarUrl] = useState('');
  const [telegramSession, setTelegramSession] = useState(null);
  const [telegramMessage, setTelegramMessage] = useState('');
  const [telegramGroupId, setTelegramGroupId] = useState('');
  const [twitterSession, setTwitterSession] = useState(null);

  useEffect(() => {
    const storedLinkedinSummary = sessionStorage.getItem('linkedinSummary');
    const storedBlueskySummary = sessionStorage.getItem('blueskySummary');
    const storedArticleUrl = sessionStorage.getItem('articleUrl');
    const storedArticleMetadata = sessionStorage.getItem('articleMetadata');
    const storedBlueskySession = sessionStorage.getItem('blueskySession');
    const storedBlueskyHandle = sessionStorage.getItem('blueskyHandle');
    const storedLinkedinSession = sessionStorage.getItem('linkedinSession');
    const storedBlueskyAvatarUrl = sessionStorage.getItem('blueskyAvatarUrl');
    const storedTelegramSession = sessionStorage.getItem('telegramSession');
    const storedTelegramMessage = sessionStorage.getItem('telegramMessage');
    const storedTwitterSession = sessionStorage.getItem('twitterSession');

    if (storedLinkedinSummary) setLinkedinSummary(storedLinkedinSummary);
    if (storedBlueskySummary) setBlueskySummary(storedBlueskySummary);
    if (storedArticleUrl) setArticleUrl(storedArticleUrl);
    if (storedArticleMetadata) setArticleMetadata(JSON.parse(storedArticleMetadata));
    if (storedBlueskySession) setBlueskySession(JSON.parse(storedBlueskySession));
    if (storedBlueskyHandle) setBlueskyUserHandle(storedBlueskyHandle);
    if (storedLinkedinSession) setLinkedinSession(JSON.parse(storedLinkedinSession));
    if (storedBlueskyAvatarUrl) setBlueskyAvatarUrl(storedBlueskyAvatarUrl);
    if (storedTelegramSession) setTelegramSession(JSON.parse(storedTelegramSession));
    if (storedTelegramMessage) setTelegramMessage(storedTelegramMessage);
    if (storedTwitterSession) setTwitterSession(JSON.parse(storedTwitterSession));

    // Handle Twitter session from URL
    if (router.query.twitterSession) {
      try {
        const session = JSON.parse(decodeURIComponent(router.query.twitterSession));
        sessionStorage.setItem('twitterSession', JSON.stringify(session));
        setTwitterSession(session);
        // Remove the query param from the URL after storing
        router.replace('/post', undefined, { shallow: true });
      } catch (error) {
        console.error('Failed to parse Twitter session:', error);
      }
    }
  }, [router]);

  useEffect(() => {
    sessionStorage.setItem('linkedinSummary', linkedinSummary);
    sessionStorage.setItem('blueskySummary', blueskySummary);
    sessionStorage.setItem('articleUrl', articleUrl);
    if (articleMetadata) sessionStorage.setItem('articleMetadata', JSON.stringify(articleMetadata));
  }, [linkedinSummary, blueskySummary, articleUrl, articleMetadata]);

  const postToBluesky = async () => {
    if (!blueskySession) {
      alert('Please log in to Bluesky first via the homepage.');
      return;
    }
    if (!articleUrl || !articleMetadata) {
      alert('Please fetch an article and generate a summary before posting.');
      return;
    }
    if (blueskySummary.length > 280) {
      alert('❌ Summary is too long. Please edit it to be under 280 characters.');
      return;
    }
    const postText = blueskySummary;
    console.log('Posting to Bluesky with:', { postText, articleUrl, articleMetadata });
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
            thumb: articleMetadata.image || undefined,
          }
        } : undefined
      }),
    });
    const data = await res.json();
    if (data.success) {
      alert('✅ Posted to Bluesky!');
      setBlueskySummary('');
    } else {
      alert('❌ Bluesky post failed: ' + (data.error || 'Unknown error'));
    }
  };

  const postToLinkedIn = async () => {
    if (!linkedinSession) {
      alert('Please log in to LinkedIn first via the homepage.');
      return;
    }
    if (!articleUrl) {
      alert('Please fetch an article and generate a summary before posting.');
      return;
    }
    console.log('Posting to LinkedIn with:', { linkedinSummary, articleUrl, articleMetadata });
    try {
      const res = await fetch('/api/linkedin/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: linkedinSummary,
          url: articleUrl || '',
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

  const postToTelegram = async (chatId) => {
    if (!telegramSession) {
      alert('Please log in to Telegram first via the homepage.');
      return;
    }
    if (!telegramMessage) {
      alert('Please enter a message to send.');
      return;
    }
    if (!chatId) {
      alert('Please enter a valid chat ID.');
      return;
    }
    try {
      const res = await fetch('/api/telegram/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: telegramMessage,
          link: articleUrl || ''
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Sent to Telegram!');
      } else {
        alert('❌ Telegram post failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Telegram post error:', error);
      alert('❌ Failed to post to Telegram');
    }
  };

  const postToTwitter = async () => {
    if (!twitterSession) {
      alert('Please log in to X (Twitter) first via the homepage.');
      return;
    }
    if (!blueskySummary) {
      alert('Please enter a summary to post.');
      return;
    }
    try {
      const res = await fetch('/api/twitter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: blueskySummary,
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

  // Confirmation modal logic
  const handleSendClick = (platform) => {
    setPendingAction(platform);
    setShowModal(true);
  };
  const handleModalYes = () => {
    setShowModal(false);
    if (pendingAction === 'linkedin') postToLinkedIn();
    if (pendingAction === 'bluesky') postToBluesky();
    if (pendingAction === 'telegram') postToTelegram(telegramSession.id);
    if (pendingAction === 'twitter') postToTwitter();
    setPendingAction(null);
  };
  const handleModalNo = () => {
    setShowModal(false);
    setPendingAction(null);
  };

  // Post All logic
  const postAll = async () => {
    let results = [];
    // Bluesky
    if (blueskySession && blueskySummary && articleUrl && articleMetadata && blueskySummary.length <= 280) {
      try {
        await postToBluesky();
        results.push('✅ Posted to Bluesky!');
      } catch (e) {
        results.push('❌ Bluesky post failed');
      }
    }
    // LinkedIn
    if (linkedinSession && linkedinSummary && articleUrl) {
      try {
        await postToLinkedIn();
        results.push('✅ Posted to LinkedIn!');
      } catch (e) {
        results.push('❌ LinkedIn post failed');
      }
    }
    // Telegram (DM only)
    if (telegramSession && telegramMessage) {
      try {
        await postToTelegram(telegramSession.id);
        results.push('✅ Sent to Telegram!');
      } catch (e) {
        results.push('❌ Telegram post failed');
      }
    }
    // Twitter (DM only)
    if (twitterSession && blueskySummary) {
      try {
        await postToTwitter();
        results.push('✅ Sent to X (Twitter)!');
      } catch (e) {
        results.push('❌ X (Twitter) post failed');
      }
    }
    if (results.length === 0) {
      alert('No platforms to post to. Please log in and fill out your content.');
    } else {
      alert(results.join('\n'));
    }
  };

  return (
    <main className="container">
      <h1 style={{ marginBottom: '1.2rem', marginTop: '0.5rem' }}>🚀 Post Your Content</h1>
      <p style={{ textAlign: 'left', marginTop: '10px', marginBottom: '30px' }}>
        Use your AI-generated content and post to your connected social accounts.
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
            <a
              href={`https://t.me/${telegramSession.username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#229ED9' }}
            >
              {telegramSession.firstName || telegramSession.first_name}{telegramSession.lastName ? ' ' + (telegramSession.lastName || telegramSession.last_name) : telegramSession.last_name ? ' ' + telegramSession.last_name : ''}
            </a> on Telegram
            <br />
          </>
        )}
        {twitterSession && (
          <>
            <a
              href={`https://twitter.com/${twitterSession.screenName}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1DA1F2' }}
            >
              {twitterSession.screenName || 'X (Twitter) User'}
            </a> on X (Twitter)
            <br />
          </>
        )}
      </p>

      {/* Only show the output box for platforms the user is logged into */}
      {linkedinSession && (
        <section className="card" style={{ background: '#fff', color: '#222', maxWidth: 600, margin: '0 auto 32px auto', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <img src={linkedinSession.profileImageUrl || '/images/linkedin-profile.png'} alt="LinkedIn Profile" style={{ width: 48, height: 48, borderRadius: '50%', background: '#eee', objectFit: 'cover' }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: '1.1em' }}>{linkedinSession.name || 'LinkedIn User'}</span>
                <span style={{ color: '#666', fontSize: '1.1em' }}>•</span>
                <span style={{ color: '#666', fontSize: '0.95em' }}>You</span>
              </div>
              <div style={{ color: '#888', fontSize: '0.97em', marginTop: 2 }}>Your job title</div>
            </div>
          </div>
          <textarea
            rows="3"
            value={linkedinSummary}
            onChange={(e) => setLinkedinSummary(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              fontSize: '1.1em',
              color: '#222',
              resize: 'vertical',
              marginBottom: 12,
              fontFamily: 'inherit',
              outline: 'none',
              fontWeight: 400,
              minHeight: 60,
              boxSizing: 'border-box',
              padding: 0
            }}
          />
          {articleMetadata && (
            <div style={{
              border: '1.5px solid #eee',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'flex-start',
              margin: '12px 0 8px 0',
              background: '#fafbfc',
              overflow: 'hidden'
            }}>
              {articleMetadata.image && (
                <img src={articleMetadata.image} alt={articleMetadata.title} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: '12px 0 0 12px' }} />
              )}
              <div style={{ padding: '10px 14px', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05em', marginBottom: 2 }}>{articleMetadata.title}</div>
                <div style={{ color: '#666', fontSize: '0.97em', marginBottom: 2 }}>{articleMetadata.description}</div>
                <div style={{ color: '#888', fontSize: '0.93em', marginTop: 2 }}>{articleUrl && (new URL(articleUrl)).hostname}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', marginTop: 10 }}>
            {linkedinSummary && (
              <button onClick={() => handleSendClick('linkedin')} style={{ background: '#0A66C2', color: '#fff' }}>
                Send to LinkedIn {articleUrl ? 'with Article' : ''}
              </button>
            )}
          </div>
        </section>
      )}

      {blueskySession && (
        <section className="card" style={{ background: '#181c22', color: '#f0f0f0', maxWidth: 600, margin: '0 auto 32px auto', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <img src={blueskyAvatarUrl || '/images/Bluesky_Logo.png'} alt="Bluesky Profile" style={{ width: 48, height: 48, borderRadius: '50%', background: '#222', objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{blueskySession.handle || 'Bluesky User'}</div>
              <div style={{ color: '#aaa', fontSize: '0.95em' }}>@{blueskySession.handle || 'handle'}</div>
            </div>
          </div>
          <textarea
            rows="3"
            value={blueskySummary}
            onChange={(e) => setBlueskySummary(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              fontSize: '1.1em',
              color: '#f0f0f0',
              resize: 'vertical',
              marginBottom: 12,
              fontFamily: 'inherit',
              outline: 'none',
              fontWeight: 400,
              minHeight: 60,
              boxSizing: 'border-box',
              padding: 0
            }}
          />
          {articleMetadata && (
            <div style={{
              border: '1.5px solid #222',
              borderRadius: 12,
              background: '#23272e',
              margin: '12px 0 8px 0',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'flex-start'
            }}>
              {articleMetadata.image && (
                <img src={articleMetadata.image} alt={articleMetadata.title} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: '12px 0 0 12px' }} />
              )}
              <div style={{ padding: '10px 14px', flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1.05em', marginBottom: 2 }}>{articleMetadata.title}</div>
                <div style={{ color: '#aaa', fontSize: '0.97em', marginBottom: 2 }}>{articleMetadata.description}</div>
                <div style={{ color: '#888', fontSize: '0.93em', marginTop: 2 }}>{articleUrl && (new URL(articleUrl)).hostname}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', marginTop: 10 }}>
            {blueskySummary && (
              <button onClick={() => handleSendClick('bluesky')} style={{ background: '#3f51b5', color: '#fff' }}>
                Post to Bluesky
              </button>
            )}
          </div>
        </section>
      )}

      {telegramSession && (
        <section className="card" style={{ background: '#222e35', color: '#fff', maxWidth: 600, margin: '0 auto 32px auto', boxShadow: '0 2px 12px #0002', border: '1.5px solid #229ED9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <img src={telegramSession.photo_url || '/images/telegram-profile.png'} alt="Telegram Profile" style={{ width: 48, height: 48, borderRadius: '50%', background: '#229ED9', objectFit: 'cover' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1em', color: '#229ED9' }}>{(telegramSession.firstName || telegramSession.first_name) || 'Telegram User'}{telegramSession.lastName ? ' ' + (telegramSession.lastName || telegramSession.last_name) : telegramSession.last_name ? ' ' + telegramSession.last_name : ''}</div>
              <div style={{ color: '#aaa', fontSize: '0.95em' }}>@{telegramSession.username || 'username'}</div>
            </div>
          </div>
          <textarea
            rows="3"
            value={telegramMessage}
            onChange={(e) => setTelegramMessage(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: '#2a3942',
              fontSize: '1.1em',
              color: '#fff',
              resize: 'vertical',
              marginBottom: 12,
              fontFamily: 'inherit',
              outline: 'none',
              fontWeight: 400,
              minHeight: 60,
              boxSizing: 'border-box',
              padding: 0,
              borderRadius: 8
            }}
          />
          <div style={{ marginBottom: 10 }}>
            <label style={{ color: '#aaa', fontSize: '0.97em' }}>
              Group Chat ID (for group posting):
              <input
                type="text"
                value={telegramGroupId}
                onChange={e => setTelegramGroupId(e.target.value)}
                placeholder="e.g. -1001234567890"
                style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: '1px solid #444', background: '#2a3942', color: '#fff', width: 200 }}
              />
            </label>
            <div style={{ color: '#888', fontSize: '0.93em', marginTop: 4 }}>
              The bot must be an admin in the group. <br />Group chat IDs usually start with <b>-100</b>.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-start', marginTop: 10 }}>
            {telegramMessage && (
              <>
                <button onClick={() => postToTelegram(telegramSession.id)} style={{ background: '#229ED9', color: '#fff' }}>
                  Send to Telegram DM
                </button>
                <button onClick={() => postToTelegram(telegramGroupId)} style={{ background: '#229ED9', color: '#fff' }} disabled={!telegramGroupId}>
                  Send to Telegram Group
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {twitterSession && (
        <section className="card" style={{ background: '#181c22', color: '#f0f0f0', maxWidth: 600, margin: '0 auto 32px auto', boxShadow: '0 2px 12px #0002' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <svg width="48" height="48" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="60" fill="#1DA1F2"/>
              <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="32" fill="#fff">X</text>
            </svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1em' }}>{twitterSession.screenName || 'X (Twitter) User'}</div>
              <div style={{ color: '#aaa', fontSize: '0.95em' }}>@{twitterSession.screenName || 'username'}</div>
            </div>
          </div>
          <textarea
            rows="3"
            value={blueskySummary}
            onChange={(e) => setBlueskySummary(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              fontSize: '1.1em',
              color: '#f0f0f0',
              resize: 'vertical',
              marginBottom: 12,
              fontFamily: 'inherit',
              outline: 'none',
              fontWeight: 400,
              minHeight: 60,
              boxSizing: 'border-box',
              padding: 0
            }}
          />
          <button onClick={postToTwitter} style={{ background: '#1DA1F2', color: '#fff', fontWeight: 700, fontSize: '1.1em', padding: '0.9em 2.2em', borderRadius: 999, boxShadow: '0 2px 8px #0002', marginTop: 12 }}>
            Post to X (Twitter)
          </button>
        </section>
      )}

      {/* Post All Button: show if logged into at least 2 platforms */}
      {(!!blueskySession + !!linkedinSession + !!telegramSession + !!twitterSession >= 2) && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <button onClick={postAll} style={{ background: 'linear-gradient(90deg, #3f51b5 0%, #229ED9 100%)', color: '#fff', fontWeight: 700, fontSize: '1.1em', padding: '0.9em 2.2em', borderRadius: 999, boxShadow: '0 2px 8px #0002' }}>
            Post All
          </button>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <a href="/scheduler">
          <button style={{ minWidth: 200 }}>Back to Content Generator</button>
        </a>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#232526',
            padding: '2.5rem 2rem',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
            minWidth: 320,
            textAlign: 'center',
            color: '#f0f0f0'
          }}>
            <h2 style={{ marginBottom: 24 }}>Are you sure you want to send?</h2>
            <div style={{ display: 'flex', gap: '24px', justifyContent: 'center' }}>
              <button style={{ background: '#0A66C2', minWidth: 80 }} onClick={handleModalYes}>Yes</button>
              <button style={{ background: '#333', minWidth: 80 }} onClick={handleModalNo}>No</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default PostPage; 