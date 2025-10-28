import { Op, type Transaction } from "sequelize";
import {
  AgentModel,
  type AgentAttributes,
} from "../../models/agents/agents.js";
import type { AgentCreateInput } from "../../schemas/agents/agentsSchema.js";
import type { AgentQueryInput } from "../../schemas/agents/agentsSchema.js";
import type { AgentUpdateInput } from "../../schemas/agents/agentsSchema.js";

class AgentRepo {
  async findAll(query: AgentQueryInput, tx?: Transaction | null) {
    const {
      agentName,
      agentType,
      userId,
      status,
      capacity,
      activeAssignmentsCount,
      jurisdiction,
      isOnCall,
      autoAccept,
      lastSeenAt,
    } = query;
    const agent : any = {};
    if(jurisdiction) agent.jurisdiction = jurisdiction;
    if(lastSeenAt) agent.lastSeenAt = lastSeenAt;
  }
}
