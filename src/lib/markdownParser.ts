export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  summary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
}

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  responsibilities?: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  location?: string;
  year?: string;
  description?: string;
}

export interface ProjectItem {
  name: string;
  description?: string;
  technologies?: string[];
  url?: string;
}
