# Portfolio to Resume Converter

A Next.js application that converts portfolio websites into professional PDF resumes using [Firecrawl](https://firecrawl.dev) for web scraping and [@react-pdf/renderer](https://react-pdf.org/) for PDF generation.

## Features

- Scrape portfolio websites using Firecrawl
- Parse website content into structured resume data
- Generate professional PDF resumes automatically
- Clean, modern UI with loading states and error handling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Firecrawl API key ([Get one here](https://firecrawl.dev))

### Installation

1. Clone the repository and install dependencies:

```bash
npm install --legacy-peer-deps
```

Note: `--legacy-peer-deps` is required due to React 19 compatibility with @react-pdf/renderer.

2. Create a `.env.local` file in the root directory:

```bash
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

Replace the placeholders with your actual API keys:
- Get your Firecrawl API key from [firecrawl.dev](https://firecrawl.dev)
- Get your Groq API key from [console.groq.com](https://console.groq.com)

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Enter your portfolio website URL in the input field
2. Click "Generate PDF Resume"
3. The application will:
   - Scrape your website content using Firecrawl
   - Parse the content into structured resume data
   - Generate a professional PDF resume
   - Automatically download the PDF file

## How It Works

1. **Web Scraping**: Uses Firecrawl to scrape the portfolio website and extract content as markdown
2. **AI-Powered Parsing**: Uses Groq AI (Llama 3.1) to intelligently parse the markdown and extract structured resume data (name, experience, education, skills, projects)
3. **PDF Generation**: Uses @react-pdf/renderer to create a professional PDF resume with proper formatting

## Project Structure

- `src/app/page.tsx` - Main page with form UI
- `src/app/api/generate-resume/route.ts` - API route for PDF generation
- `src/components/ResumePDF.tsx` - React PDF component for resume layout
- `src/lib/groqParser.ts` - Groq AI-powered parser to extract structured resume data from markdown

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
