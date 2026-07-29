import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import roomRoutes from './routes/roomRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { initSocket } from './socket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const allowedOrigins = clientUrl.split(',').map((url) => url.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'YouTube Watch Party API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    version: "168906c",
    message: "Running latest backend"
  });
});

app.use('/api/rooms', roomRoutes);

if (process.env.NODE_ENV === 'production') {
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'YouTube Watch Party Backend is running',
    });
  });
}

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
