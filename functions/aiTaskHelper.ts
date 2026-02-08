import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, tasks } = await req.json();

    const systemPrompt = `You are an AI assistant helping users organize their Kanban board tasks. 
The user has two columns: "To-do" and "In Progress".
Current tasks: ${JSON.stringify(tasks)}

When the user asks you to organize, prioritize, or modify tasks, you should:
1. Analyze their request
2. Suggest specific changes (change priority, move between columns, reorder)
3. Return a friendly message explaining what you'll do
4. Return an array of updates to apply

Return a JSON with:
{
  "message": "your friendly explanation",
  "updates": [
    {"id": "task_id", "data": {"priority": "high", "status": "in_progress"}},
    ...
  ]
}

If no changes are needed, return empty updates array.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nUser request: ${message}`,
      response_json_schema: {
        type: "object",
        properties: {
          message: { type: "string" },
          updates: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                data: { type: "object" }
              }
            }
          }
        }
      }
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});