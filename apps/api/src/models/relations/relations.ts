import User from "../users/user.js";
import { Incident } from "../incidents/incidents.js";
import { Agent } from "../agents/agents.js";
import { Assignment } from "../assignment/assignment.js";

export function applyRelations() {
  User.hasOne(Agent, { foreignKey: "userId", as: "agentProfile" });
  Agent.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(Incident, { foreignKey: "reporterId", as: "reportedIncidents" });
  Incident.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });

  Incident.hasMany(Assignment, { foreignKey: "incidentId", as: "assignments" });
  Assignment.belongsTo(Incident, { foreignKey: "incidentId", as: "incident" });

  Agent.hasMany(Assignment, { foreignKey: "agentId", as: "assignments" });
  Assignment.belongsTo(Agent, { foreignKey: "agentId", as: "agent" });
}
