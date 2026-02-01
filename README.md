# Portfolio Website to Resume | AI-Powered Generator

A Next.js application that transforms portfolio websites into professional PDF resumes using AI-powered content extraction and intelligent parsing.

## Features

- **Two Scraping Modes**:
  - **Main Page**: Scrapes a single page (faster, ideal for single-page portfolios)
  - **Crawl**: Crawls multiple pages (up to 3 pages) for comprehensive content extraction
  
- **AI-Powered Content Extraction**: Uses Groq AI (Llama 3.3) to intelligently extract and structure:
  - Personal information (name, email, phone, location, website)
  - Professional summary
  - Work experience with dates and descriptions
  - Education history
  - Skills and technologies
  - Projects with descriptions and tech stacks

- **Interactive Resume Editor**: Chat-based interface to modify and refine your resume after generation
  - Natural language modifications (e.g., "Add more details to my experience", "Change the summary")
  - Real-time PDF preview
  - Download updated PDFs instantly

- **Professional PDF Output**: Clean, well-formatted PDF resumes ready for job applications

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Web Scraping**: [Firecrawl](https://firecrawl.dev)
- **AI**: [Groq AI](https://groq.com)
- **PDF Generation**: [@react-pdf/renderer](https://react-pdf.org/)
- **Markdown Parsing**: [marked](https://marked.js.org/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
