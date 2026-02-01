import { Groq } from 'groq-sdk';
import type { ResumeData } from './markdownParser';

export async function parseMarkdownWithGroq(markdown: string): Promise<ResumeData> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const groq = new Groq({ apiKey });

  const prompt = `You are a resume parser. Extract structured information from the following portfolio website markdown content and return it as JSON.

Extract the following information:
- name: Full name of the person
- email: Email address if found
- phone: Phone number if found
- website: Personal website or portfolio URL
- location: Location (city, country, etc.)
- summary: A professional summary/bio (2-4 sentences combining relevant information)
- experience: Array of work experience items with title, company, location (optional), startDate, endDate (optional), description
- education: Array of education items with degree, institution, location (optional), year (optional), description
- skills: Array of technical skills, programming languages, tools, frameworks mentioned
- projects: Array of projects with name, description, technologies (array), url (optional)

For projects, extract:
- Project name/title
- Description of what the project does
- Technologies used (React, TypeScript, Python, etc.)
- GitHub or demo URL if available

For experience, try to extract:
- Job title/role
- Company name
- Dates (if mentioned)
- Brief description

Return ONLY valid JSON in this exact format:
{
  "name": "string or null",
  "email": "string or null",
  "phone": "string or null",
  "website": "string or null",
  "location": "string or null",
  "summary": "string or null",
  "experience": [{"title": "string", "company": "string", "location": "string or null", "startDate": "string or null", "endDate": "string or null", "description": "string"}],
  "education": [{"degree": "string", "institution": "string", "location": "string or null", "year": "string or null", "description": "string"}],
  "skills": ["string"],
  "projects": [{"name": "string", "description": "string", "technologies": ["string"], "url": "string or null"}]
}

Markdown content:
${markdown.substring(0, 8000)}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048,
      response_format: {
        type: 'json_object',
      },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq');
    }

    const parsed = JSON.parse(content);

    return {
      name: parsed.name || null,
      email: parsed.email || null,
      phone: parsed.phone || null,
      website: parsed.website || null,
      location: parsed.location || null,
      summary: parsed.summary || null,
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      education: Array.isArray(parsed.education) ? parsed.education : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch (error: unknown) {
    console.error('Groq parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse markdown with Groq: ${errorMessage}`);
  }
}
