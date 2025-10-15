import { DataTypes } from "sequelize";
import { sequelize } from "../../config/db.js";


const Incident = sequelize.define(
  "Incident",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    typeIncident: {
      type: DataTypes.ENUM("ASALTO", "INCENDIO", "ACCIDENTE", "EMERGENCIA"),
      allowNull: false,
      defaultValue: "EMERGENCIA"
    },

    message: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [5, 500],
      },
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("PENDIENTE", "EN_PROGRESO", "RESUELTO"),
      allowNull: false,
      defaultValue: "PENDIENTE",
    },

    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "incidents",
    timestamps: true,
  }
);

export { Incident };
