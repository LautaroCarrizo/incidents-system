import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../config/db/sequelizeConn.js";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { IncidentStatusZ, type IncidentStatus } from "../../enums/enumsWithZod.js"
import { IncidentTypeZ, type IncidentType } from "../../enums/enumsWithZod.js"

const INCIDENT_STATUS_VALUE = IncidentStatusZ.options;
const INCIDENT_TYPES_VALUE = IncidentTypeZ.options;

export class IncidentModel extends Model<
  InferAttributes<IncidentModel, { omit: "createdAt" | "updatedAt" }>,
  InferCreationAttributes<IncidentModel, { omit: "createdAt" | "updatedAt" }>
> {
  declare id: CreationOptional<number>;
  declare typeIncident: CreationOptional<IncidentType>;
  declare message: string;
  declare latitude: CreationOptional<number | null>;
  declare longitude: CreationOptional<number | null>;
  declare address: CreationOptional<string | null>;
  declare reporterId: CreationOptional<number | null>;
  declare status: CreationOptional<IncidentStatus>;

  // timestamps manejados por Sequelize
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

IncidentModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    typeIncident: {
      type: DataTypes.ENUM(...INCIDENT_TYPES_VALUE),
      allowNull: false,
      defaultValue:"EMERGENCY" satisfies IncidentType,
    },

    message: { type: DataTypes.STRING(500), allowNull: false },

    latitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },

    longitude: { type: DataTypes.DECIMAL(10, 7), allowNull: true },

    address: { type: DataTypes.STRING(255), allowNull: true },

    reporterId: { type: DataTypes.INTEGER, allowNull: true },

    status: {
      type: DataTypes.ENUM(...INCIDENT_STATUS_VALUE),
      allowNull: false,
      defaultValue: "PENDING" satisfies IncidentStatus,
    },
  },
  {
    sequelize,
    tableName: "incidents",
    timestamps: true,
  }
);

export type IncidentAttributes = InferAttributes<
  IncidentModel,
  { omit: "createdAt" | "updatedAt" }
>;
export type IncidentCreationAttributes = InferCreationAttributes<
  IncidentModel,
  { omit: "createdAt" | "updatedAt" }
>;
