import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../config/db/sequelizeConn.js";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import {
  AgentStatusZ,
  AgentTypeZ,
  type AgentStatus,
  type AgentTypes,
} from "../../enums/enumsWithZod.js";

const AGENT_STATUS = AgentStatusZ.options;
const AGENT_TYPES = AgentTypeZ.options;
export class AgentModel extends Model<
  InferAttributes<AgentModel, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<AgentModel, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare agentName: string;
  declare agentType: CreationOptional<AgentTypes>;
  declare userId: number;
  declare status: CreationOptional<AgentStatus>;
  declare capacity: CreationOptional<number>;
  declare activeAssignmentsCount: CreationOptional<number>;
  declare jurisdiction: CreationOptional<string | null>;
  declare isOnCall: CreationOptional<boolean>;
  declare autoAccept: CreationOptional<boolean>;
  declare lastSeenAt: CreationOptional<Date | null>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AgentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agentName: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    agentType: {
      type: DataTypes.ENUM(...AGENT_TYPES),
      allowNull: false,
      defaultValue: "POLICE" satisfies AgentTypes,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...AGENT_STATUS),
      allowNull: false,
      defaultValue: "OFFLINE" satisfies AgentStatus,
    },

    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
    },

    activeAssignmentsCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    jurisdiction: {
      type: DataTypes.STRING(120),
      allowNull: true,
      defaultValue: null,
    },

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

    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },

  {
    sequelize,
    tableName: "agents",
    timestamps: true,
    underscored: false,
  }
);
export type AgentAttributes = InferAttributes<
  AgentModel,
  { omit: "createdAt" | "updatedAt" }
>;
export type AgentCreationAttributes = InferCreationAttributes<
  AgentModel,
  { omit: "createdAt" | "updatedAt" }
>;
