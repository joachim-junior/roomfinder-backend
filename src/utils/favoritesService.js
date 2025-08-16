const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class FavoritesService {
  // Add a property to user's favorites
  async addToFavorites(userId, propertyId) {
    try {
      // Check if property exists
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        throw new Error("Property not found");
      }

      // Check if already in favorites
      const existingFavorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      if (existingFavorite) {
        throw new Error("Property is already in favorites");
      }

      // Add to favorites
      const favorite = await prisma.favorite.create({
        data: {
          userId,
          propertyId,
        },
        include: {
          property: {
            include: {
              host: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  reviews: true,
                  bookings: true,
                },
              },
            },
          },
        },
      });

      return favorite;
    } catch (error) {
      throw error;
    }
  }

  // Remove a property from user's favorites
  async removeFromFavorites(userId, propertyId) {
    try {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      if (!favorite) {
        throw new Error("Property is not in favorites");
      }

      await prisma.favorite.delete({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      return { message: "Property removed from favorites" };
    } catch (error) {
      throw error;
    }
  }

  // Get user's favorite properties
  async getUserFavorites(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [favorites, total] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId },
          skip,
          take: limit,
          include: {
            property: {
              include: {
                host: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatar: true,
                  },
                },
                _count: {
                  select: {
                    reviews: true,
                    bookings: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.favorite.count({
          where: { userId },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        favorites: favorites.map((fav) => fav.property),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if a property is in user's favorites
  async isPropertyFavorited(userId, propertyId) {
    try {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_propertyId: {
            userId,
            propertyId,
          },
        },
      });

      return !!favorite;
    } catch (error) {
      throw error;
    }
  }

  // Get favorite count for a property
  async getPropertyFavoriteCount(propertyId) {
    try {
      const count = await prisma.favorite.count({
        where: { propertyId },
      });

      return count;
    } catch (error) {
      throw error;
    }
  }

  // Get user's favorite count
  async getUserFavoriteCount(userId) {
    try {
      const count = await prisma.favorite.count({
        where: { userId },
      });

      return count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FavoritesService();
