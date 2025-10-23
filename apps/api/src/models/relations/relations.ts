import { UserModel } from "../users/user.js";
import { IncidentModel } from "../incidents/incidents.js";
import { AgentModel } from "../agents/agents.js";
import { AssignmentModel } from "../assignment/assignment.js";

export function applyRelations() {
  UserModel.hasOne(AgentModel, { foreignKey: "userId", as: "agentProfile" });
  AgentModel.belongsTo(UserModel, { foreignKey: "userId", as: "user" });

  UserModel.hasMany(IncidentModel, {
    foreignKey: "reporterId",
    as: "reportedIncidents",
  });
  IncidentModel.belongsTo(UserModel, {
    foreignKey: "reporterId",
    as: "reporter",
  });

  IncidentModel.hasMany(AssignmentModel, {
    foreignKey: "incidentId",
    as: "assignments",
  });
  AssignmentModel.belongsTo(IncidentModel, {
    foreignKey: "incidentId",
    as: "incident",
  });

  AgentModel.hasMany(AssignmentModel, {
    foreignKey: "agentId",
    as: "assignments",
  });
  AssignmentModel.belongsTo(AgentModel, { foreignKey: "agentId", as: "agent" });
}
