import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ResumePDF } from '@/components/ResumePDF';
import { Groq } from 'groq-sdk';
import type { ResumeData } from '@/lib/markdownParser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeData, modification } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    if (!modification) {
      return NextResponse.json(
        { error: 'Modification request is required' },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: groqApiKey });

    const prompt = `You are a resume editor. Modify the following resume data based on the user's request.

Current resume data (JSON):
${JSON.stringify(resumeData, null, 2)}

User's modification request: "${modification}"

Apply the requested modifications and return the updated resume data as JSON in the exact same format. Only modify what the user requested, keep everything else the same.

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
}`;

    let modifiedResumeData: ResumeData;
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
      modifiedResumeData = {
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
      console.error('Groq modification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to apply modifications: ${errorMessage}` },
        { status: 500 }
      );
    }

    try {
      const pdfBuffer = await renderToBuffer(
        React.createElement(ResumePDF, { data: modifiedResumeData }) as React.ReactElement
      );

      const pdfArray = new Uint8Array(pdfBuffer);
      
      const pdfBase64 = Buffer.from(pdfArray).toString('base64');
      
      return NextResponse.json({
        pdf: pdfBase64,
        resumeData: modifiedResumeData,
      });
    } catch (error: unknown) {
      console.error('PDF generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to generate PDF: ${errorMessage}` },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
