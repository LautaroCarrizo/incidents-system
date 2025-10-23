import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../config/db/sequelizeConn.js";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { AgentStatusZ, type AgentStatus } from "../../enums/enumsWithZod.js";

const AGENT_STATUS = AgentStatusZ.options;

export class AgentModel extends Model<
  InferAttributes<AgentModel, { omit: "createdAt" | "updatedAt" }>, // atributos existentes al leer
  InferCreationAttributes<AgentModel, { omit: "createdAt" | "updatedAt" }> // atributos requeridos al crear
> {
  declare id: CreationOptional<number>;
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
