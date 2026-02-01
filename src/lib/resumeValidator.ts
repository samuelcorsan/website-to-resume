import { Groq } from 'groq-sdk';

export async function validateResumeContent(markdown: string): Promise<{ valid: boolean; reason?: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const groq = new Groq({ apiKey });

  const prompt = `You are a resume content validator. Analyze the following scraped website content and determine if it contains enough information to create a basic resume.

A basic resume should have at least:
- Name or personal identifier
- Some form of professional information (projects, work experience, skills, education, or about/bio section)

Return ONLY a JSON object with this exact format:
{
  "valid": true or false,
  "reason": "brief explanation if invalid, empty string if valid"
}

Scraped content:
${markdown.substring(0, 4000)}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.1,
      max_tokens: 200,
      response_format: {
        type: 'json_object',
      },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      return { valid: true };
    }

    const parsed = JSON.parse(content);
    return {
      valid: parsed.valid === true,
      reason: parsed.reason || undefined,
    };
  } catch (error: unknown) {
    console.error('Resume validation error:', error);
    return { valid: true };
  }
}
