import { Model, DataTypes } from "sequelize";
import { sequelize } from "../../config/db/sequelizeConn.js";
import type {
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";

export class UserModel extends Model<
  InferAttributes<UserModel>, // Atributos que EXISTEN en la fila (lectura)
  InferCreationAttributes<UserModel> // Atributos requeridos al CREAR (inserción)
> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: string; // bcrypt! => longitud 60
  declare isAdmin: CreationOptional<boolean>;
}
UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(60), // bcrypt ≈ 60 chars
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "users",
    timestamps: false,
  }
);
export type UserAttributes = InferAttributes<UserModel>;
export type UserCreationAttributes = InferCreationAttributes<UserModel>;
