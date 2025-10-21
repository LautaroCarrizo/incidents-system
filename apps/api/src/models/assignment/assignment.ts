import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db/sequelizeConn.js";

export const ASSIGNMENT_STATUS = [
  "ASSIGNED",
  "ACCEPTED",
  "REJECTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "RESOLVED",
  "CLOSED",
];

export const Assignment = sequelize.define(
  "assignments",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    incidentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "incidents", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    agentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "agents", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM(...ASSIGNMENT_STATUS),
      allowNull: false,
      defaultValue: "ASSIGNED",
    },

    slaDueAt: { type: DataTypes.DATE, allowNull: true },
    acceptedAt: { type: DataTypes.DATE, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
    closedAt: { type: DataTypes.DATE, allowNull: true },

    notes: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    tableName: "assignments",
    timestamps: true,
    indexes: [
      { fields: ["incidentId"] },
      { fields: ["agentId"] },
      { fields: ["status"] },
      { fields: ["agentId", "status"] },
    ],
  }
);
