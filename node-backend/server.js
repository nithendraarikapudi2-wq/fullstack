const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8020;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/knowledge_portal';

let isMockDB = false;
let mockCommentsDb = [
  {
    _id: 'comment_1',
    documentId: 1,
    authorEmail: 'asha@example.com',
    authorName: 'Asha Menon',
    content: 'This microservices overview is incredibly clear and helpful. Thanks for sharing!',
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    _id: 'comment_2',
    documentId: 1,
    authorEmail: 'student@example.com',
    authorName: 'Student User',
    content: 'Agreed! The explanation of bounded contexts makes a lot of sense.',
    createdAt: new Date(Date.now() - 3600000)
  }
];

// Mongoose Comment Model definition (for real MongoDB)
const CommentSchema = new mongoose.Schema({
  documentId: { type: Number, required: true },
  authorEmail: { type: String, required: true },
  authorName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
let CommentModel;
try {
  CommentModel = mongoose.model('Comment', CommentSchema);
} catch (e) {
  CommentModel = mongoose.model('Comment');
}

// Controller routing
app.get('/api/comments', async (req, res) => {
  try {
    const { documentId } = req.query;
    if (!documentId) {
      return res.status(400).send('documentId parameter is required');
    }
    
    if (isMockDB) {
      const filtered = mockCommentsDb
        .filter(c => c.documentId === Number(documentId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(filtered);
    }
    
    const comments = await CommentModel.find({ documentId: Number(documentId) }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { documentId, content } = req.body;
    const authorEmail = req.headers['x-user-email'];
    const authorName = req.headers['x-user-name'] || authorEmail;

    if (!documentId || !content) {
      return res.status(400).send('documentId and content are required');
    }
    if (!authorEmail) {
      return res.status(401).send('Unauthorized: User email header missing');
    }

    if (isMockDB) {
      const newComment = {
        _id: 'comment_' + Date.now(),
        documentId: Number(documentId),
        authorEmail,
        authorName,
        content,
        createdAt: new Date()
      };
      mockCommentsDb.push(newComment);
      return res.status(201).json(newComment);
    }

    const comment = new CommentModel({
      documentId: Number(documentId),
      authorEmail,
      authorName,
      content
    });

    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const authorEmail = req.headers['x-user-email'];
    const role = req.headers['x-user-role'];

    if (!authorEmail) {
      return res.status(401).send('Unauthorized: User email header missing');
    }

    if (isMockDB) {
      const commentIndex = mockCommentsDb.findIndex(c => c._id === id);
      if (commentIndex === -1) {
        return res.status(404).send('Comment not found');
      }
      const comment = mockCommentsDb[commentIndex];
      if (role !== 'ADMIN' && comment.authorEmail !== authorEmail) {
        return res.status(403).send('Forbidden: You can only delete your own comments');
      }
      mockCommentsDb.splice(commentIndex, 1);
      return res.status(204).send();
    }

    const comment = await CommentModel.findById(id);
    if (!comment) {
      return res.status(404).send('Comment not found');
    }

    if (role !== 'ADMIN' && comment.authorEmail !== authorEmail) {
      return res.status(403).send('Forbidden: You can only delete your own comments');
    }

    await CommentModel.findByIdAndDelete(id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Setup Database Connection
async function startServer() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB database.');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('MongoDB connection failed. Using high-fidelity in-memory Mock MongoDB provider.');
    isMockDB = true;
  }

  app.listen(PORT, () => {
    console.log(`Node.js comments-service listening on port ${PORT} (${isMockDB ? 'Mock' : 'Real'} DB)`);
  });
}

startServer();
