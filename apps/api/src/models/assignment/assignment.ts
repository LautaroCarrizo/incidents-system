import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../config/db/sequelizeConn.js";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import {
  AssignmentStatusZ,
  type AssignmentStatus,
} from "../../enums/enumsWithZod.js";

const ASSIGNMENT_STATUS_VALUES = AssignmentStatusZ.options;

export class AssignmentModel extends Model<
  InferAttributes<AssignmentModel, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<AssignmentModel, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare incidentId: number;
  declare agentId: number;
  declare status: CreationOptional<AssignmentStatus>;
  declare slaDueAt: CreationOptional<Date | null>;
  declare acceptedAt: CreationOptional<Date | null>;
  declare startedAt: CreationOptional<Date | null>;
  declare resolvedAt: CreationOptional<Date | null>;
  declare closedAt: CreationOptional<Date | null>;
  declare notes: CreationOptional<string | null>;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AssignmentModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    incidentId: { type: DataTypes.INTEGER, allowNull: false },

    agentId: { type: DataTypes.INTEGER, allowNull: false },

    status: {
      type: DataTypes.ENUM(...ASSIGNMENT_STATUS_VALUES),
      allowNull: false,
      defaultValue: "ASSIGNED" satisfies AssignmentStatus,
    },

    slaDueAt: { type: DataTypes.DATE, allowNull: true },
    acceptedAt: { type: DataTypes.DATE, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
    closedAt: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.STRING(500), allowNull: true },
  },
  {
    sequelize,
    tableName: "assignments",
    timestamps: true,
  }
);

export type AssignmentAttributes = InferAttributes<
  AssignmentModel,
  { omit: "createdAt" | "updatedAt" }
>;
export type AssignmentCreationAttributes = InferCreationAttributes<
  AssignmentModel,
  { omit: "createdAt" | "updatedAt" }
>;
