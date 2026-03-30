import { Request, Response } from 'express';
import Feedback from '../models/Feedback';
import { analyzeFeedback } from '../services/gemini.service';

export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { title, description, category, submitterName, submitterEmail } = req.body;

    // 1. Save initial feedback to MongoDB
    const newFeedback = new Feedback({
      title,
      description,
      category,
      submitterName,
      submitterEmail,
    });

    const savedFeedback = await newFeedback.save();

    // 2. Trigger AI Analysis (Requirement 2.1)
    const aiAnalysis = await analyzeFeedback(title, description);

    if (aiAnalysis) {
      // 3. Update the document with AI results (Requirement 2.2)
      savedFeedback.ai_category = aiAnalysis.category;
      savedFeedback.ai_sentiment = aiAnalysis.sentiment;
      savedFeedback.ai_priority = aiAnalysis.priority_score;
      savedFeedback.ai_summary = aiAnalysis.summary;
      savedFeedback.ai_tags = aiAnalysis.tags;
      savedFeedback.ai_processed = true;
      await savedFeedback.save();
    }

    res.status(201).json({ success: true, data: savedFeedback });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add this to get all feedback for the Admin Dashboard (Requirement 3.2, 4.2)
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }
    res.status(200).json({ success: true, data: feedback });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};