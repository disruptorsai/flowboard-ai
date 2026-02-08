import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description } = await req.json();

    const systemPrompt = `You are an AI task prioritization assistant. Based on the task title and description, determine:
1. The appropriate priority level (low, medium, or high)
2. A suggested due date (if applicable)

Consider:
- Urgency indicators (ASAP, urgent, critical, etc.) = high priority, sooner due date
- Time-sensitive tasks = appropriate due dates
- Routine/maintenance tasks = low/medium priority
- Strategic/planning tasks = medium priority with longer timeframes

Return JSON with:
{
  "priority": "low" | "medium" | "high",
  "suggested_due_date": "YYYY-MM-DD" (or null if not applicable),
  "reasoning": "brief explanation"
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${systemPrompt}\n\nTask Title: ${title}\nDescription: ${description || 'No description provided'}`,
      response_json_schema: {
        type: "object",
        properties: {
          priority: { 
            type: "string",
            enum: ["low", "medium", "high"]
          },
          suggested_due_date: { 
            type: "string"
          },
          reasoning: { type: "string" }
        }
      }
    });

    return Response.json(response);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});