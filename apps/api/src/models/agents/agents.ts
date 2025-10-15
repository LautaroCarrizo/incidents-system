import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";

export const Agent = sequelize.define(
  "Agent",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },

    status: {
      type: DataTypes.ENUM("AVAILABLE", "BUSY", "OFFLINE"),
      allowNull: false,
      defaultValue: "OFFLINE",
    },

    capacity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    activeAssignmentsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    jurisdiction: { type: DataTypes.STRING(120), allowNull: true },
    isOnCall: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    autoAccept: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    lastSeenAt: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "agents",
    timestamps: true,
    indexes: [
      { fields: ["status"] },
      { fields: ["jurisdiction"] },
      { unique: true, fields: ["userId"] },
    ],
  }
);
