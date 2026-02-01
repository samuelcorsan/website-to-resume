import { NextRequest, NextResponse } from 'next/server';
import Firecrawl from '@mendable/firecrawl-js';
import { renderToBuffer, DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { ResumePDF } from '@/components/ResumePDF';
import { parseMarkdownWithGroq } from '@/lib/groqParser';
import { validateResumeContent } from '@/lib/resumeValidator';

interface FirecrawlPage {
  markdown?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, mode = 'scrape' } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
    if (!firecrawlApiKey) {
      return NextResponse.json(
        { error: 'Firecrawl API key is not configured' },
        { status: 500 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      );
    }

    const firecrawl = new Firecrawl({ apiKey: firecrawlApiKey });

    let markdown: string;
    try {
      if (mode === 'crawl') {
        const crawlResult = await firecrawl.crawl(url, {
          limit: 3,
          scrapeOptions: {
            formats: ['markdown'],
          },
        });

        if (crawlResult.data && Array.isArray(crawlResult.data)) {
          markdown = crawlResult.data
            .map((page: FirecrawlPage) => page.markdown || '')
            .filter((md: string) => md.length > 0)
            .join('\n\n---\n\n');
        } else {
          markdown = '';
        }
      } else {
        const scrapeResult = await firecrawl.scrape(url, {
          formats: ['markdown'],
        });

        markdown = 
          (scrapeResult as { markdown?: string }).markdown || 
          (scrapeResult as { data?: { markdown?: string } }).data?.markdown || 
          '';
      }
      
      if (!markdown) {
        return NextResponse.json(
          { error: 'Failed to extract content from the website. The website may be inaccessible or have no readable content.' },
          { status: 500 }
        );
      }

      try {
        const validation = await validateResumeContent(markdown);
        if (!validation.valid) {
          return NextResponse.json(
            { 
              error: 'Insufficient content for resume',
              details: validation.reason || 'The website does not contain enough information to create a basic resume. Please ensure the portfolio includes your name, projects, skills, or professional experience.',
            },
            { status: 400 }
          );
        }
      } catch (validationError: unknown) {
        console.error('Validation error:', validationError);
      }
    } catch (error: unknown) {
      console.error('Firecrawl error:', error);
      
      const errorObj = error as { message?: string; status?: number };
      if (errorObj.message?.includes('blocklisted') || errorObj.status === 403) {
        return NextResponse.json(
          { 
            error: 'This website cannot be accessed',
            errorType: 'blocklisted',
            details: 'The website is protected or has restrictions that prevent scraping. Try using a different portfolio URL or a personal website.',
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to scrape website: ${errorObj.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    let resumeData;
    try {
      resumeData = await parseMarkdownWithGroq(markdown);
      
      console.log('Parsed resume data:', {
        name: resumeData.name,
        summary: resumeData.summary?.substring(0, 100),
        experienceCount: resumeData.experience.length,
        projectsCount: resumeData.projects.length,
        skillsCount: resumeData.skills.length,
      });
    } catch (error: unknown) {
      console.error('Groq parsing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: `Failed to parse content: ${errorMessage}` },
        { status: 500 }
      );
    }

    try {
      const pdfBuffer = await renderToBuffer(
        React.createElement(ResumePDF, { data: resumeData }) as React.ReactElement<DocumentProps>
      );

      const pdfArray = new Uint8Array(pdfBuffer);
      const pdfBase64 = Buffer.from(pdfArray).toString('base64');
      
      return NextResponse.json({
        pdf: pdfBase64,
        resumeData: resumeData,
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
