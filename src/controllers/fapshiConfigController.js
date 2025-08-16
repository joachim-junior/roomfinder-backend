const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");
const prisma = new PrismaClient();

class FapshiConfigController {
  /**
   * Get all Fapshi configurations
   */
  async getAllConfigs(req, res) {
    try {
      const configs = await prisma.fapshiConfig.findMany({
        orderBy: [{ serviceType: "asc" }, { environment: "asc" }],
      });

      res.json({
        success: true,
        data: configs,
      });
    } catch (error) {
      console.error("Get Fapshi configs error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get Fapshi configurations",
      });
    }
  }

  /**
   * Get Fapshi configuration by service type and environment
   */
  async getConfig(req, res) {
    try {
      const { serviceType, environment } = req.params;

      const config = await prisma.fapshiConfig.findUnique({
        where: {
          serviceType_environment: {
            serviceType,
            environment,
          },
        },
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Fapshi configuration not found",
        });
      }

      res.json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error("Get Fapshi config error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get Fapshi configuration",
      });
    }
  }

  /**
   * Create or update Fapshi configuration
   */
  async upsertConfig(req, res) {
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
        serviceType,
        environment = "PRODUCTION",
        apiKey,
        apiUser,
        webhookUrl,
        isActive = false,
      } = req.body;

      const config = await prisma.fapshiConfig.upsert({
        where: {
          serviceType_environment: {
            serviceType,
            environment,
          },
        },
        update: {
          apiKey,
          apiUser,
          webhookUrl,
          isActive,
          updatedAt: new Date(),
        },
        create: {
          serviceType,
          environment,
          apiKey,
          apiUser,
          webhookUrl,
          isActive,
        },
      });

      res.json({
        success: true,
        message: `Fapshi ${serviceType} configuration ${
          config.id ? "updated" : "created"
        } successfully`,
        data: config,
      });
    } catch (error) {
      console.error("Upsert Fapshi config error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save Fapshi configuration",
      });
    }
  }

  /**
   * Update Fapshi configuration
   */
  async updateConfig(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { configId } = req.params;
      const { apiKey, apiUser, webhookUrl, isActive } = req.body;

      const config = await prisma.fapshiConfig.update({
        where: { id: configId },
        data: {
          apiKey,
          apiUser,
          webhookUrl,
          isActive,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: "Fapshi configuration updated successfully",
        data: config,
      });
    } catch (error) {
      console.error("Update Fapshi config error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update Fapshi configuration",
      });
    }
  }

  /**
   * Toggle Fapshi configuration active status
   */
  async toggleConfigStatus(req, res) {
    try {
      const { configId } = req.params;

      const config = await prisma.fapshiConfig.findUnique({
        where: { id: configId },
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Fapshi configuration not found",
        });
      }

      const updatedConfig = await prisma.fapshiConfig.update({
        where: { id: configId },
        data: {
          isActive: !config.isActive,
          updatedAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: `Fapshi ${config.serviceType} configuration ${
          updatedConfig.isActive ? "activated" : "deactivated"
        } successfully`,
        data: updatedConfig,
      });
    } catch (error) {
      console.error("Toggle Fapshi config status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle Fapshi configuration status",
      });
    }
  }

  /**
   * Delete Fapshi configuration
   */
  async deleteConfig(req, res) {
    try {
      const { configId } = req.params;

      const config = await prisma.fapshiConfig.findUnique({
        where: { id: configId },
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Fapshi configuration not found",
        });
      }

      await prisma.fapshiConfig.delete({
        where: { id: configId },
      });

      res.json({
        success: true,
        message: "Fapshi configuration deleted successfully",
      });
    } catch (error) {
      console.error("Delete Fapshi config error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete Fapshi configuration",
      });
    }
  }

  /**
   * Test Fapshi configuration
   */
  async testConfig(req, res) {
    try {
      const { configId } = req.params;

      const config = await prisma.fapshiConfig.findUnique({
        where: { id: configId },
      });

      if (!config) {
        return res.status(404).json({
          success: false,
          message: "Fapshi configuration not found",
        });
      }

      // Test the configuration by making a simple API call
      const testResult = await this.testFapshiConnection(config);

      res.json({
        success: true,
        message: "Fapshi configuration test completed",
        data: {
          config: {
            serviceType: config.serviceType,
            environment: config.environment,
            isActive: config.isActive,
          },
          testResult,
        },
      });
    } catch (error) {
      console.error("Test Fapshi config error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to test Fapshi configuration",
        error: error.message,
      });
    }
  }

  /**
   * Test Fapshi API connection
   */
  async testFapshiConnection(config) {
    try {
      const baseUrl =
        config.environment === "PRODUCTION"
          ? "https://api.fapshi.com"
          : "https://sandbox.fapshi.com";

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
        "X-API-User": config.apiUser,
      };

      // Test endpoint based on service type
      const testEndpoint =
        config.serviceType === "COLLECTION"
          ? "/collection/balance"
          : "/disbursement/balance";

      const response = await fetch(`${baseUrl}${testEndpoint}`, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          message: "Connection successful",
          data: data,
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: "Connection failed",
          error: errorData.message || response.statusText,
          status: response.status,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: "Connection failed",
        error: error.message,
      };
    }
  }

  /**
   * Get Fapshi configuration statistics
   */
  async getConfigStats(req, res) {
    try {
      const stats = await prisma.fapshiConfig.groupBy({
        by: ["serviceType", "environment", "isActive"],
        _count: {
          id: true,
        },
      });

      const summary = {
        total: 0,
        active: 0,
        inactive: 0,
        byServiceType: {
          COLLECTION: { total: 0, active: 0, inactive: 0 },
          DISBURSEMENT: { total: 0, active: 0, inactive: 0 },
        },
        byEnvironment: {
          SANDBOX: { total: 0, active: 0, inactive: 0 },
          PRODUCTION: { total: 0, active: 0, inactive: 0 },
        },
      };

      stats.forEach((stat) => {
        const count = stat._count.id;
        summary.total += count;

        if (stat.isActive) {
          summary.active += count;
        } else {
          summary.inactive += count;
        }

        // By service type
        summary.byServiceType[stat.serviceType].total += count;
        if (stat.isActive) {
          summary.byServiceType[stat.serviceType].active += count;
        } else {
          summary.byServiceType[stat.serviceType].inactive += count;
        }

        // By environment
        summary.byEnvironment[stat.environment].total += count;
        if (stat.isActive) {
          summary.byEnvironment[stat.environment].active += count;
        } else {
          summary.byEnvironment[stat.environment].inactive += count;
        }
      });

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      console.error("Get Fapshi config stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get Fapshi configuration statistics",
      });
    }
  }
}

module.exports = new FapshiConfigController();
