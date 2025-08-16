const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const prisma = new PrismaClient();

class BlogController {
  // Get all blogs (public)
  async getAllBlogs(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status = "PUBLISHED",
        tag,
        search,
      } = req.query;
      const skip = (page - 1) * limit;

      const where = {
        status: status === "ALL" ? undefined : status,
      };

      if (tag) {
        where.tags = {
          some: {
            slug: tag,
          },
        };
      }

      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
        ];
      }

      const blogs = await prisma.blog.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { publishedAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          tags: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      const total = await prisma.blog.count({ where });

      res.json({
        success: true,
        data: {
          blogs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get all blogs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get blogs",
      });
    }
  }

  // Get blog by slug (public)
  async getBlogBySlug(req, res) {
    try {
      const { slug } = req.params;

      const blog = await prisma.blog.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          tags: true,
          comments: {
            where: { isApproved: true },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Increment view count
      await prisma.blog.update({
        where: { id: blog.id },
        data: { viewCount: { increment: 1 } },
      });

      res.json({
        success: true,
        data: blog,
      });
    } catch (error) {
      console.error("Get blog by slug error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get blog",
      });
    }
  }

  // Create blog (admin only)
  async createBlog(req, res) {
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
        excerpt,
        content,
        featuredImage,
        status = "DRAFT",
        tagIds = [],
      } = req.body;

      // Check if slug already exists
      const existingBlog = await prisma.blog.findUnique({
        where: { slug },
      });

      if (existingBlog) {
        return res.status(400).json({
          success: false,
          message: "Blog with this slug already exists",
        });
      }

      const blogData = {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
        authorId: req.user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      };

      if (tagIds.length > 0) {
        blogData.tags = {
          connect: tagIds.map((id) => ({ id })),
        };
      }

      const blog = await prisma.blog.create({
        data: blogData,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          tags: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Blog created successfully",
        data: blog,
      });
    } catch (error) {
      console.error("Create blog error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create blog",
      });
    }
  }

  // Update blog (admin only)
  async updateBlog(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { blogId } = req.params;
      const {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
        tagIds = [],
      } = req.body;

      // Check if blog exists
      const existingBlog = await prisma.blog.findUnique({
        where: { id: blogId },
      });

      if (!existingBlog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      // Check if new slug already exists (if changed)
      if (slug && slug !== existingBlog.slug) {
        const slugExists = await prisma.blog.findUnique({
          where: { slug },
        });

        if (slugExists) {
          return res.status(400).json({
            success: false,
            message: "Blog with this slug already exists",
          });
        }
      }

      const updateData = {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        status,
      };

      // Set publishedAt if status is changing to PUBLISHED
      if (status === "PUBLISHED" && existingBlog.status !== "PUBLISHED") {
        updateData.publishedAt = new Date();
      }

      // Handle tags
      if (tagIds.length > 0) {
        updateData.tags = {
          set: tagIds.map((id) => ({ id })),
        };
      }

      const blog = await prisma.blog.update({
        where: { id: blogId },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          tags: true,
        },
      });

      res.json({
        success: true,
        message: "Blog updated successfully",
        data: blog,
      });
    } catch (error) {
      console.error("Update blog error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update blog",
      });
    }
  }

  // Delete blog (admin only)
  async deleteBlog(req, res) {
    try {
      const { blogId } = req.params;

      const blog = await prisma.blog.findUnique({
        where: { id: blogId },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      await prisma.blog.delete({
        where: { id: blogId },
      });

      res.json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error) {
      console.error("Delete blog error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete blog",
      });
    }
  }

  // Get all blog tags
  async getAllTags(req, res) {
    try {
      const tags = await prisma.blogTag.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              blogs: true,
            },
          },
        },
      });

      res.json({
        success: true,
        data: tags,
      });
    } catch (error) {
      console.error("Get all tags error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get tags",
      });
    }
  }

  // Create blog tag (admin only)
  async createTag(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, slug } = req.body;

      // Check if tag already exists
      const existingTag = await prisma.blogTag.findFirst({
        where: {
          OR: [{ name }, { slug }],
        },
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Tag with this name or slug already exists",
        });
      }

      const tag = await prisma.blogTag.create({
        data: { name, slug },
      });

      res.status(201).json({
        success: true,
        message: "Tag created successfully",
        data: tag,
      });
    } catch (error) {
      console.error("Create tag error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create tag",
      });
    }
  }

  // Add comment to blog (authenticated users)
  async addComment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { blogId } = req.params;
      const { content } = req.body;

      // Check if blog exists
      const blog = await prisma.blog.findUnique({
        where: { id: blogId },
      });

      if (!blog) {
        return res.status(404).json({
          success: false,
          message: "Blog not found",
        });
      }

      const comment = await prisma.blogComment.create({
        data: {
          content,
          blogId,
          userId: req.user.id,
          isApproved: req.user.role === "ADMIN", // Auto-approve admin comments
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
      });
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add comment",
      });
    }
  }

  // Approve/Reject comment (admin only)
  async moderateComment(req, res) {
    try {
      const { commentId } = req.params;
      const { isApproved } = req.body;

      const comment = await prisma.blogComment.findUnique({
        where: { id: commentId },
      });

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      const updatedComment = await prisma.blogComment.update({
        where: { id: commentId },
        data: { isApproved },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: `Comment ${isApproved ? "approved" : "rejected"} successfully`,
        data: updatedComment,
      });
    } catch (error) {
      console.error("Moderate comment error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to moderate comment",
      });
    }
  }
}

module.exports = new BlogController();
