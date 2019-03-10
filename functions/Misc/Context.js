module.exports = {

clearContext:function(agent, contextname) { //used to clear contexts properly, this should always be used instead of just using .delete
 agent.context.set({
                     'name': contextname,
                     'lifespan': 0,
                     'parameters': {}
 });
 agent.context.delete(contextname);
},

clearAll:function(agent) { //clear all authentication-related contexts
module.exports.clearContext(agent, "sessionvars");
module.exports.clearContext(agent, "auth");
module.exports.clearContext(agent, "token");
module.exports.clearContext(agent, "sid");
agent.add("Cleared");
}
}