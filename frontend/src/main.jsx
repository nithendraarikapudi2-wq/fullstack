import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// Pointing to FastAPI API Gateway
const API_BASE = 'http://localhost:8000/api';
const AUTH_USER_KEY = 'knowledgePortalUser';

const fallbackCategories = [
  { id: 1, name: 'Architecture', description: 'System design and software architecture' },
  { id: 2, name: 'Cloud', description: 'Cloud deployment and operations' },
  { id: 3, name: 'Database', description: 'Data modelling and storage references' },
  { id: 4, name: 'Accessibility', description: 'Inclusive content and UI guidance' }
];

const fallbackDocuments = [
  {
    id: 1,
    title: 'Microservices Architecture Concepts',
    summary: 'Bounded contexts, independent deployment, API gateways, service discovery, and observability.',
    body: 'Microservices architecture organizes software as small independently deployable services. Each service owns a bounded business capability and communicates through lightweight APIs.',
    type: 'ARTICLE',
    authorName: 'Asha Menon',
    categoryName: 'Architecture',
    tags: 'microservices,services,architecture',
    createdAt: '2026-05-20T10:00:00'
  },
  {
    id: 2,
    title: 'Cloud Deployment Strategies',
    summary: 'Blue-green, rolling, canary, immutable infrastructure, and rollback planning for reliable cloud releases.',
    body: 'Cloud deployment strategies reduce release risk by controlling rollout speed, monitoring health, and keeping rollback paths available.',
    type: 'REFERENCE',
    authorName: 'Rahul Verma',
    categoryName: 'Cloud',
    tags: 'cloud,deployment,devops',
    createdAt: '2026-05-21T10:00:00'
  },
  {
    id: 3,
    title: 'Accessible Knowledge Reading Checklist',
    summary: 'Readable typography, keyboard navigation, landmarks, contrast, focus states, and clear document hierarchy.',
    body: 'Accessible knowledge interfaces help readers consume content through semantic headings, visible focus, skip links, and high contrast colors.',
    type: 'DOCUMENT',
    authorName: 'Nisha Rao',
    categoryName: 'Accessibility',
    tags: 'accessibility,wcag,reading',
    createdAt: '2026-05-22T10:00:00'
  }
];

function Icon({ label, symbol }) {
  return (
    <span className="icon" aria-hidden="true" title={label}>
      {symbol}
    </span>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authStatus, setAuthStatus] = useState('Log in to access the knowledge portal.');
  const [authForm, setAuthForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });
  const [documents, setDocuments] = useState(fallbackDocuments);
  const [allDocuments, setAllDocuments] = useState(fallbackDocuments);
  const [categories, setCategories] = useState(fallbackCategories);
  const [users, setUsers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [activeDocument, setActiveDocument] = useState(fallbackDocuments[0]);
  const [searchMode, setSearchMode] = useState('semantic');
  const [status, setStatus] = useState('Offline demo data loaded. Connecting to Gateway...');
  
  // Comments states
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const [form, setForm] = useState({
    title: '',
    summary: '',
    body: '',
    type: 'ARTICLE',
    authorName: '',
    categoryId: 1,
    tags: ''
  });

  const isAdmin = currentUser?.role === 'ADMIN';
  const isAuthor = currentUser?.role === 'AUTHOR';
  const isPublisher = isAdmin || isAuthor;

  function authHeaders() {
    const headers = {};
    if (currentUser?.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`;
    }
    // Inject headers directly for development fallback safety
    headers['X-User-Email'] = currentUser?.email || '';
    headers['X-User-Role'] = currentUser?.role || '';
    headers['X-User-Name'] = currentUser?.fullName || '';
    return headers;
  }

  // Restore session
  useEffect(() => {
    const savedUser = window.localStorage.getItem(AUTH_USER_KEY);
    if (!savedUser) {
      return;
    }

    try {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setForm((current) => ({ ...current, authorName: user.fullName || '' }));
      setAuthStatus(`Session restored as ${user.role || 'READER'}.`);
    } catch (error) {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  }, []);

  // Submit Authentication (Login / Signup)
  async function submitAuth(event) {
    event.preventDefault();
    const endpoint = authMode === 'signup' ? 'signup' : 'login';
    const payload = {
      email: authForm.email.trim(),
      password: authForm.password
    };

    if (authMode === 'signup') {
      payload.fullName = authForm.fullName.trim();
    }

    try {
      const response = await fetch(`${API_BASE}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Authentication failed');
      }

      const user = await response.json();
      setCurrentUser(user);
      setAuthStatus(`${user.message || 'Welcome back.'} Role: ${user.role || 'READER'}.`);
      setForm((current) => ({ ...current, authorName: user.fullName }));
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (error) {
      setAuthStatus(error.message || 'Enter a valid email and a password with at least 6 characters.');
    }
  }

  function switchAuthMode(mode) {
    setAuthMode(mode);
    if (mode === 'signup') {
      setAuthStatus('Create an account to start collecting knowledge.');
    } else if (mode === 'admin') {
      setAuthStatus('Admin login is for portal managers.');
    } else {
      setAuthStatus('Log in to access the knowledge portal.');
    }
  }

  function signOut() {
    setCurrentUser(null);
    setUsers([]);
    setComments([]);
    setAuthForm({ fullName: '', email: '', password: '' });
    setAuthStatus('Signed out.');
    window.localStorage.removeItem(AUTH_USER_KEY);
  }

  // Load Categories & Documents
  useEffect(() => {
    async function loadData() {
      try {
        const [docResponse, categoryResponse] = await Promise.all([
          fetch(`${API_BASE}/documents`, { headers: authHeaders() }),
          fetch(`${API_BASE}/categories`, { headers: authHeaders() })
        ]);

        if (!docResponse.ok || !categoryResponse.ok) {
          throw new Error('Gateway/Backend did not return portal data.');
        }

        const docData = await docResponse.json();
        const categoryData = await categoryResponse.json();
        setAllDocuments(docData);
        setDocuments(docData);
        setCategories(categoryData);
        if (docData.length > 0) {
          setActiveDocument(docData[0]);
        }
        setStatus('Connected to API Gateway.');
      } catch (error) {
        setStatus('Gateway offline. Using built-in demo data.');
      }
    }

    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Load Users (Admin only)
  useEffect(() => {
    async function loadUsers() {
      if (!isAdmin) {
        setUsers([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/users`, {
          headers: authHeaders()
        });

        if (!response.ok) {
          throw new Error('User list unavailable');
        }

        setUsers(await response.json());
      } catch (error) {
        setUsers([]);
      }
    }

    loadUsers();
  }, [isAdmin, currentUser]);

  // Load Comments for selected document
  useEffect(() => {
    async function loadComments() {
      if (!activeDocument || !currentUser) {
        setComments([]);
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/comments?documentId=${activeDocument.id}`, {
          headers: authHeaders()
        });
        if (response.ok) {
          setComments(await response.json());
        } else {
          setComments([]);
        }
      } catch (error) {
        setComments([]);
      }
    }

    loadComments();
  }, [activeDocument, currentUser]);

  // Post Comment
  async function submitComment(event) {
    event.preventDefault();
    const content = newComment.trim();
    if (!content || !activeDocument) return;

    try {
      const response = await fetch(`${API_BASE}/comments`, {
        method: 'POST',
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: activeDocument.id,
          content
        })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to post comment');
      }

      const saved = await response.json();
      setComments((current) => [saved, ...current]);
      setNewComment('');
      setStatus('Comment published.');
    } catch (error) {
      setStatus(`Comment error: ${error.message}`);
    }
  }

  // Delete Comment
  async function deleteComment(commentId) {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (!response.ok && response.status !== 204) {
        const message = await response.text();
        throw new Error(message || 'Failed to delete comment');
      }

      setComments((current) => current.filter((c) => c._id !== commentId));
      setStatus('Comment deleted.');
    } catch (error) {
      setStatus(`Delete comment error: ${error.message}`);
    }
  }

  // Run Search
  async function runSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setDocuments(allDocuments);
      setActiveDocument(allDocuments[0] || null);
      setStatus('Showing all loaded resources.');
      return;
    }

    try {
      const endpoint = searchMode === 'semantic' ? 'search/semantic' : 'search';
      const response = await fetch(`${API_BASE}/${endpoint}?query=${encodeURIComponent(trimmed)}`, {
        headers: authHeaders()
      });
      if (!response.ok) {
        throw new Error('Search failed');
      }
      const results = await response.json();
      setDocuments(results);
      setActiveDocument(results[0] || null);
      setStatus(`${results.length} result${results.length === 1 ? '' : 's'} returned for "${trimmed}".`);
    } catch (error) {
      const terms = trimmed.toLowerCase().split(/\s+/);
      const localResults = fallbackDocuments.filter((doc) => {
        const haystack = `${doc.title} ${doc.summary} ${doc.body} ${doc.tags}`.toLowerCase();
        return terms.some((term) => haystack.includes(term));
      });
      setDocuments(localResults);
      setActiveDocument(localResults[0] || null);
      setStatus('Gateway search unavailable. Showing local demo matches.');
    }
  }

  // Create Document
  async function createDocument(event) {
    event.preventDefault();
    if (!isPublisher) {
      setStatus('Authorized permission required to publish resources.');
      return;
    }

    const category = categories.find((item) => Number(item.id) === Number(form.categoryId));
    const newDocument = {
      ...form,
      id: Date.now(),
      categoryName: category?.name || 'Uncategorized',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders()
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Create failed');
      }

      const saved = await response.json();
      setAllDocuments((current) => [saved, ...current]);
      setDocuments((current) => [saved, ...current]);
      setActiveDocument(saved);
      setStatus(`Saved "${saved.title}" to PostgreSQL.`);
      
      if (isAdmin) {
        const userResponse = await fetch(`${API_BASE}/users`, { headers: authHeaders() });
        if (userResponse.ok) {
          setUsers(await userResponse.json());
        }
      }
    } catch (error) {
      setAllDocuments((current) => [newDocument, ...current]);
      setDocuments((current) => [newDocument, ...current]);
      setActiveDocument(newDocument);
      setStatus(`Added "${newDocument.title}" locally.`);
    }

    setForm({
      title: '',
      summary: '',
      body: '',
      type: 'ARTICLE',
      authorName: currentUser?.fullName || '',
      categoryId: categories[0]?.id || 1,
      tags: ''
    });
  }

  // Delete Document
  async function deleteDocument(documentId, title) {
    if (!isAdmin) {
      setStatus('Admin access is required to delete resources.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/documents/${documentId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Delete failed');
      }

      setAllDocuments((current) => current.filter((doc) => doc.id !== documentId));
      setDocuments((current) => {
        const nextDocuments = current.filter((doc) => doc.id !== documentId);
        setActiveDocument((active) => (active?.id === documentId ? nextDocuments[0] || null : active));
        return nextDocuments;
      });
      setStatus(`Deleted "${title}".`);
    } catch (error) {
      setStatus(error.message || 'Unable to delete this resource.');
    }
  }

  // Delete Reader
  async function deleteReader(userId, fullName) {
    if (!isAdmin) {
      setStatus('Admin access is required to delete readers.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Delete failed');
      }

      setUsers((current) => current.filter((user) => user.id !== userId));
      setStatus(`Deleted reader "${fullName}".`);
    } catch (error) {
      setStatus(error.message || 'Unable to delete this reader.');
    }
  }

  const visibleDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const categoryMatches = selectedCategory === 'All' || doc.categoryName === selectedCategory;
      return categoryMatches;
    });
  }, [documents, selectedCategory]);

  // Login view
  if (!currentUser) {
    return (
      <main className="auth-shell">
        <section className="auth-intro" aria-labelledby="auth-title">
          <div className="brand auth-brand">
            <div className="icon">KB</div>
            <div>
              <strong>Knowledge Portal</strong>
              <span>Accessible resource hub</span>
            </div>
          </div>
          <p className="eyebrow">PS-06 Ecosystem</p>
          <h1 id="auth-title">Log in to manage knowledge resources</h1>
          <p>
            Create, retrieve, categorize, and read resources through a modernized high-fidelity dashboard built with microservices integration.
          </p>
        </section>

        <section className="auth-panel" aria-label="Authentication">
          <div className="auth-container">
            <div className="auth-tabs" aria-label="Choose authentication mode">
              <button
                type="button"
                className={authMode === 'login' ? 'selected' : ''}
                onClick={() => switchAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'admin' ? 'selected' : ''}
                onClick={() => switchAuthMode('admin')}
              >
                Admin Login
              </button>
              <button
                type="button"
                className={authMode === 'signup' ? 'selected' : ''}
                onClick={() => switchAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form className="auth-form" onSubmit={submitAuth}>
              <h2>
                {authMode === 'signup' ? 'Create account' : authMode === 'admin' ? 'Admin login' : 'Welcome back'}
              </h2>
              {authMode === 'signup' && (
                <label>
                  Full name
                  <input
                    autoComplete="name"
                    required
                    value={authForm.fullName}
                    onChange={(event) => setAuthForm({ ...authForm, fullName: event.target.value })}
                  />
                </label>
              )}
              <label>
                Email
                <input
                  autoComplete="email"
                  required
                  type="email"
                  placeholder={authMode === 'admin' ? 'admin@example.com' : 'user@example.com'}
                  value={authForm.email}
                  onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                />
              </label>
              <label>
                Password
                <input
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  minLength="6"
                  required
                  type="password"
                  value={authForm.password}
                  onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                />
              </label>
              <button className="primary-action" type="submit">
                {authMode === 'signup' ? 'Sign Up' : authMode === 'admin' ? 'Admin Login' : 'Login'}
              </button>
              <p className="auth-status" role="status">{authStatus}</p>
            </form>
          </div>
        </section>
      </main>
    );
  }

  // Workspace view
  return (
    <main className="app-shell">
      <a className="skip-link" href="#content">Skip to content</a>
      <aside className="sidebar" aria-label="Knowledge navigation">
        <div className="brand">
          <div className="icon">KB</div>
          <div>
            <strong>Knowledge Portal</strong>
            <span>Accessible resource hub</span>
          </div>
        </div>

        <nav className="topic-nav" aria-label="Topics">
          <button
            className={selectedCategory === 'All' ? 'active' : ''}
            onClick={() => setSelectedCategory('All')}
          >
            <Icon label="Topics" symbol="T" />
            All Topics
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={selectedCategory === category.name ? 'active' : ''}
              onClick={() => setSelectedCategory(category.name)}
            >
              <Icon label="Category" symbol="#" />
              {category.name}
            </button>
          ))}
        </nav>

        <p className="connection-status" role="status">
          <span className="dot" /> {status}
        </p>
        <div className="user-panel" aria-label="Signed in user">
          <span>{currentUser.fullName}</span>
          <small>{currentUser.email}</small>
          <strong className={`role-badge ${currentUser.role?.toLowerCase()}`}>
            {currentUser.role || 'READER'}
          </strong>
          <button type="button" onClick={signOut}>Sign Out</button>
        </div>
      </aside>

      <section className="workspace" id="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PS-06 Accessible Portal</p>
            <h1>Knowledge Base</h1>
          </div>
          <form className="searchbar" onSubmit={runSearch} role="search">
            <div className="search-row">
              <Icon label="Search" symbol="🔍" />
              <input
                id="query"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search articles & references..."
              />
              <button type="submit">Search</button>
            </div>
            <div className="mode-toggle" aria-label="Search mode">
              <button
                type="button"
                className={searchMode === 'semantic' ? 'selected' : ''}
                onClick={() => setSearchMode('semantic')}
              >
                Semantic
              </button>
              <button
                type="button"
                className={searchMode === 'keyword' ? 'selected' : ''}
                onClick={() => setSearchMode('keyword')}
              >
                Keyword
              </button>
            </div>
          </form>
        </header>

        <section className={`content-grid ${isPublisher ? '' : 'reader-only'}`} aria-label="Knowledge workspace">
          <section className="document-list" aria-label="Documents">
            <div className="section-heading">
              <h2>Resources</h2>
              <span>{visibleDocuments.length}</span>
            </div>
            <div className="resource-cards-container">
              {visibleDocuments.map((doc) => (
                <article
                  key={doc.id}
                  className={`resource-card ${activeDocument?.id === doc.id ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="resource-select"
                    onClick={() => setActiveDocument(doc)}
                  >
                    <span className="resource-type">{doc.type}</span>
                    <strong>{doc.title}</strong>
                    <span>{doc.summary}</span>
                    <small>{doc.categoryName} - {doc.authorName || 'Unknown author'}</small>
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      className="danger-action"
                      onClick={() => deleteDocument(doc.id, doc.title)}
                    >
                      Delete
                    </button>
                  )}
                </article>
              ))}
              {visibleDocuments.length === 0 && (
                <p className="empty-state">No resources match this topic or query.</p>
              )}
            </div>
          </section>

          <article className="reader" aria-label="Selected document">
            {activeDocument ? (
              <>
                <div className="reader-meta">
                  <span>{activeDocument.categoryName}</span>
                  <span className="resource-type">{activeDocument.type}</span>
                </div>
                <h2>{activeDocument.title}</h2>
                <p className="summary">{activeDocument.summary}</p>
                <div className="byline">
                  <Icon label="Author" symbol="👤" />
                  {activeDocument.authorName || 'Unknown author'}
                </div>
                <div className="body-text">{activeDocument.body}</div>
                <div className="tag-row" aria-label="Document tags">
                  {(activeDocument.tags || '').split(',').filter(Boolean).map((tag) => (
                    <span key={tag}>#{tag.trim()}</span>
                  ))}
                </div>

                {/* MongoDB Comments Section */}
                <section className="comments-section">
                  <h3>Discussion ({comments.length})</h3>
                  
                  <form className="comment-form" onSubmit={submitComment}>
                    <textarea
                      required
                      placeholder="Add to the discussion..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button type="submit">Post Comment</button>
                  </form>

                  <div className="comments-list">
                    {comments.map((comment) => (
                      <div className="comment-card" key={comment._id}>
                        <div className="comment-header">
                          <span className="comment-author">{comment.authorName}</span>
                          <span className="comment-date">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="comment-body">{comment.content}</div>
                        {(isAdmin || comment.authorEmail === currentUser.email) && (
                          <button
                            type="button"
                            className="comment-delete-btn"
                            onClick={() => deleteComment(comment._id)}
                          >
                            Delete Comment
                          </button>
                        )}
                      </div>
                    ))}
                    {comments.length === 0 && (
                      <p className="empty-state">No comments yet. Start the conversation!</p>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <p className="empty-state">Select a resource to start reading.</p>
            )}
          </article>

          {isPublisher && (
            <form className="create-panel" onSubmit={createDocument} aria-label="Create knowledge content">
              <div className="section-heading">
                <h2>Create</h2>
                <Icon label="Create" symbol="+" />
              </div>
              <label>
                Title
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                />
              </label>
              <label>
                Summary
                <textarea
                  required
                  rows="2"
                  value={form.summary}
                  onChange={(event) => setForm({ ...form, summary: event.target.value })}
                />
              </label>
              <label>
                Content
                <textarea
                  required
                  rows="4"
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                />
              </label>
              <div className="form-row">
                <label>
                  Type
                  <select
                    value={form.type}
                    onChange={(event) => setForm({ ...form, type: event.target.value })}
                  >
                    <option>ARTICLE</option>
                    <option>DOCUMENT</option>
                    <option>REFERENCE</option>
                  </select>
                </label>
                <label>
                  Category
                  <select
                    value={form.categoryId}
                    onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Author
                <input
                  value={form.authorName}
                  onChange={(event) => setForm({ ...form, authorName: event.target.value })}
                />
              </label>
              <label>
                Tags
                <input
                  placeholder="cloud, deployment, devops"
                  value={form.tags}
                  onChange={(event) => setForm({ ...form, tags: event.target.value })}
                />
              </label>
              <button className="primary-action" type="submit">
                Publish Resource
              </button>

              {isAdmin && (
                <section className="admin-panel" aria-label="Admin users">
                  <div className="section-heading">
                    <h2>Manage Users</h2>
                    <span>{users.length}</span>
                  </div>
                  {users.map((user) => (
                    <div className="user-row" key={user.id}>
                      <div className="user-info">
                        <span>{user.fullName}</span>
                        <small>{user.email}</small>
                      </div>
                      <strong className={`role-badge ${user.role?.toLowerCase()}`}>{user.role}</strong>
                      {user.role === 'READER' && (
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() => deleteReader(user.id, user.fullName)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </form>
          )}
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
