import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getUpNext, getUpNextFromQueue, recordSkip } from '../services/recommendationService';

export async function upNext(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const trackId = req.query.track_id as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 30);
    const manualQueue = req.query.manual_queue
      ? (req.query.manual_queue as string).split(',')
      : [];

    if (!trackId) {
      return res.status(400).json({ error: 'track_id is required' });
    }

    if (manualQueue.length > 0) {
      const result = await getUpNextFromQueue(trackId, manualQueue, userId, limit);
      return res.json(result);
    }

    const result = await getUpNext(trackId, userId, limit);
    res.json(result);
  } catch (err) {
    console.error('Recommendation error:', err);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}

export async function skip(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { track_id } = req.body;

    if (!track_id) {
      return res.status(400).json({ error: 'track_id is required' });
    }

    await recordSkip(track_id, userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Skip recording error:', err);
    res.status(500).json({ error: 'Failed to record skip' });
  }
}
