import { Request, Response } from "express";
import SiteVisit, { ISiteVisit } from "../models/site-visits.model";

// Track a site visit
export const trackVisit = async (req: Request, res: Response) => {
  try {
    const { page, referrer, userAgent: bodyUserAgent, timestamp } = req.body;
    
    // Validate required fields
    if (!page) {
      return res.status(400).json({ error: "Page is required" });
    }

    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = bodyUserAgent || req.get('User-Agent') || 'unknown';
    const userId = req.user?._id;
    const visitTime = timestamp ? new Date(timestamp) : new Date();

    // Check for recent visits from the same IP/user to prevent spam
    const recentVisitThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    const recentVisitTime = new Date(visitTime.getTime() - recentVisitThreshold);

    const recentVisit = await SiteVisit.findOne({
      $and: [
        { ipAddress },
        { timestamp: { $gte: recentVisitTime } },
        { page }
      ]
    });

    // If there's a recent visit from the same IP to the same page, don't track
    if (recentVisit) {
      return res.status(200).json({ 
        message: "Visit not tracked - recent visit exists",
        duplicate: true 
      });
    }

    const visit = new SiteVisit({  
      ipAddress,
      userAgent,
      page,
      referrer,
      userId,
      timestamp: visitTime
    });

    await visit.save();

    res.status(201).json({ message: "Visit tracked successfully" });
  } catch (error) {
    console.error("Error tracking visit:", error);
    res.status(500).json({ error: "Failed to track visit" });
  }
};

// Get total site visits count
export const getTotalVisits = async (req: Request, res: Response) => {
  try {
    const totalVisits = await SiteVisit.countDocuments();
    
    res.status(200).json({ 
      totalVisits,
      message: "Total visits retrieved successfully" 
    });
  } catch (error) {
    console.error("Error getting total visits:", error);
    res.status(500).json({ error: "Failed to get total visits" });
  }
};

// Get site visits with pagination and optional filters
export const getVisits = async (req: Request, res: Response) => {
  try {
    const page = Math.max(parseInt((req.query.page as string) || "1", 10), 1);
    const limit = Math.min(
      Math.max(parseInt((req.query.limit as string) || "10", 10), 1),
      100
    );
    const search = ((req.query.search as string) || "").trim();

    const filter: any = {};
    if (search) {
      filter.$or = [
        { page: { $regex: search, $options: "i" } },
        { ipAddress: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, visits] = await Promise.all([
      SiteVisit.countDocuments(filter),
      SiteVisit.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'firstName lastName email')
        .lean(),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const data = visits.map((visit: any) => ({
      _id: visit._id,
      ipAddress: visit.ipAddress,
      page: visit.page,
      referrer: visit.referrer,
      timestamp: visit.timestamp,
      user: visit.userId ? {
        name: [visit.userId.firstName, visit.userId.lastName].filter(Boolean).join(" ").trim(),
        email: visit.userId.email
      } : null
    }));

    return res.status(200).json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getting visits:", error);
    return res.status(500).json({ error: "Failed to fetch visits" });
  }
};
