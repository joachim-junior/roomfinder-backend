const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const prisma = new PrismaClient();

class HelpCenterController {
  // Get all help articles (public)
  async getAllArticles(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        priority,
        search,
        isPublished = true,
      } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        isPublished: isPublished === "true",
      };

      if (category) {
        where.category = category;
      }

      if (priority) {
        where.priority = priority;
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ];
      }

      const articles = await prisma.helpCenter.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [
          { priority: "desc" },
          { viewCount: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const total = await prisma.helpCenter.count({ where });

      res.json({
        success: true,
        data: {
          articles,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get all articles error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get articles",
      });
    }
  }

  // Get articles by category (public)
  async getArticlesByCategory(req, res) {
    try {
      const { category } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const articles = await prisma.helpCenter.findMany({
        where: {
          category,
          isPublished: true,
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [
          { priority: "desc" },
          { viewCount: "desc" },
          { createdAt: "desc" },
        ],
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const total = await prisma.helpCenter.count({
        where: {
          category,
          isPublished: true,
        },
      });

      res.json({
        success: true,
        data: {
          articles,
          category,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get articles by category error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get articles by category",
      });
    }
  }

  // Get article by slug (public)
  async getArticleBySlug(req, res) {
    try {
      const { slug } = req.params;

      const article = await prisma.helpCenter.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      // Increment view count
      await prisma.helpCenter.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({
        success: true,
        data: article,
      });
    } catch (error) {
      console.error("Get article by slug error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get article",
      });
    }
  }

  // Create article (admin only)
  async createArticle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        title,
        slug,
        content,
        category,
        priority = "MEDIUM",
        isPublished = false,
      } = req.body;

      // Check if slug already exists
      const existingArticle = await prisma.helpCenter.findUnique({
        where: { slug },
      });

      if (existingArticle) {
        return res.status(400).json({
          success: false,
          message: "Article with this slug already exists",
        });
      }

      const article = await prisma.helpCenter.create({
        data: {
          title,
          slug,
          content,
          category,
          priority,
          isPublished,
          authorId: req.user.id,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Article created successfully",
        data: article,
      });
    } catch (error) {
      console.error("Create article error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create article",
      });
    }
  }

  // Update article (admin only)
  async updateArticle(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { articleId } = req.params;
      const { title, slug, content, category, priority, isPublished } =
        req.body;

      // Check if article exists
      const existingArticle = await prisma.helpCenter.findUnique({
        where: { id: articleId },
      });

      if (!existingArticle) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      // Check if new slug already exists (if changed)
      if (slug && slug !== existingArticle.slug) {
        const slugExists = await prisma.helpCenter.findUnique({
          where: { slug },
        });

        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: "Article with this slug already exists",
          });
        }
      }

      const article = await prisma.helpCenter.update({
        where: { id: articleId },
        data: {
          title,
          slug,
          content,
          category,
          priority,
          isPublished,
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Article updated successfully",
        data: article,
      });
    } catch (error) {
      console.error("Update article error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update article",
      });
    }
  }

  // Delete article (admin only)
  async deleteArticle(req, res) {
    try {
      const { articleId } = req.params;

      const article = await prisma.helpCenter.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      await prisma.helpCenter.delete({
        where: { id: articleId },
      });

      res.json({
        success: true,
        message: "Article deleted successfully",
      });
    } catch (error) {
      console.error("Delete article error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete article",
      });
    }
  }

  // Mark article as helpful/not helpful (public)
  async rateArticle(req, res) {
    try {
      const { articleId } = req.params;
      const { isHelpful } = req.body;

      const article = await prisma.helpCenter.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      const updateData = {};
      if (isHelpful) {
        updateData.helpfulCount = { increment: 1 };
      } else {
        updateData.notHelpfulCount = { increment: 1 };
      }

      const updatedArticle = await prisma.helpCenter.update({
        where: { id: articleId },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Article rated successfully",
        data: updatedArticle,
      });
    } catch (error) {
      console.error("Rate article error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to rate article",
      });
    }
  }

  // Get help center statistics (admin only)
  async getHelpCenterStats(req, res) {
    try {
      const totalArticles = await prisma.helpCenter.count();
      const publishedArticles = await prisma.helpCenter.count({
        where: { isPublished: true },
      });
      const draftArticles = await prisma.helpCenter.count({
        where: { isPublished: false },
      });

      const categoryStats = await prisma.helpCenter.groupBy({
        by: ["category"],
        _count: {
          id: true,
        },
        where: { isPublished: true },
      });

      const priorityStats = await prisma.helpCenter.groupBy({
        by: ["priority"],
        _count: {
          id: true,
        },
        where: { isPublished: true },
      });

      const topArticles = await prisma.helpCenter.findMany({
        where: { isPublished: true },
        orderBy: { viewCount: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          helpfulCount: true,
          category: true,
        },
      });

      res.json({
        success: true,
        data: {
          totalArticles,
          publishedArticles,
          draftArticles,
          categoryStats,
          priorityStats,
          topArticles,
        },
      });
    } catch (error) {
      console.error("Get help center stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get help center statistics",
      });
    }
  }

  // Search articles (public)
  async searchArticles(req, res) {
    try {
      const { q, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const articles = await prisma.helpCenter.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: [{ priority: "desc" }, { viewCount: "desc" }],
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const total = await prisma.helpCenter.count({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
      });

      res.json({
        success: true,
        data: {
          articles,
          query: q,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Search articles error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search articles",
      });
    }
  }
}

module.exports = new HelpCenterController();
