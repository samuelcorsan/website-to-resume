import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ResumeData } from '../lib/markdownParser';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #000000',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    fontSize: 9,
    color: '#333333',
  },
  contactItem: {
    marginRight: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    borderBottom: '1 solid #cccccc',
    paddingBottom: 3,
    textTransform: 'uppercase',
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#333333',
    marginBottom: 5,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  company: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  dateRange: {
    fontSize: 9,
    color: '#666666',
    fontStyle: 'italic',
  },
  location: {
    fontSize: 9,
    color: '#666666',
  },
  description: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#333333',
    marginTop: 3,
  },
  bulletPoint: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#333333',
    marginLeft: 10,
    marginTop: 2,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  skillTag: {
    fontSize: 9,
    backgroundColor: '#f0f0f0',
    padding: '3 8',
    borderRadius: 3,
    marginRight: 5,
    marginBottom: 5,
  },
  educationItem: {
    marginBottom: 10,
  },
  degree: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  institution: {
    fontSize: 10,
    color: '#333333',
  },
  projectItem: {
    marginBottom: 10,
  },
  projectName: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  projectDescription: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#333333',
    marginTop: 3,
  },
  projectUrl: {
    fontSize: 9,
    color: '#0066cc',
    marginTop: 2,
  },
});

interface ResumePDFProps {
  data: ResumeData;
}

export const ResumePDF: React.FC<ResumePDFProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {data.name && <Text style={styles.name}>{data.name}</Text>}
          <View style={styles.contactInfo}>
            {data.email && (
              <Text style={styles.contactItem}>{data.email}</Text>
            )}
            {data.phone && (
              <Text style={styles.contactItem}>{data.phone}</Text>
            )}
            {data.website && (
              <Text style={styles.contactItem}>{data.website}</Text>
            )}
            {data.location && (
              <Text style={styles.contactItem}>{data.location}</Text>
            )}
          </View>
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View>
                    <Text style={styles.jobTitle}>{exp.title}</Text>
                    <Text style={styles.company}>{exp.company}</Text>
                    {exp.location && (
                      <Text style={styles.location}>{exp.location}</Text>
                    )}
                  </View>
                  {(exp.startDate || exp.endDate) && (
                    <Text style={styles.dateRange}>
                      {exp.startDate || ''}
                      {exp.startDate && exp.endDate ? ' - ' : ''}
                      {exp.endDate || ''}
                    </Text>
                  )}
                </View>
                {exp.description && (
                  <Text style={styles.description}>{exp.description}</Text>
                )}
                {exp.responsibilities &&
                  exp.responsibilities.map((resp, respIndex) => (
                    <Text key={respIndex} style={styles.bulletPoint}>
                      • {resp}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        )}

        {data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.institution}>
                  {edu.institution}
                  {edu.location && `, ${edu.location}`}
                  {edu.year && ` • ${edu.year}`}
                </Text>
                {edu.description && (
                  <Text style={styles.description}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsList}>
              {data.skills.map((skill, index) => (
                <Text key={index} style={styles.skillTag}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.name}</Text>
                {project.description && (
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.description}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
                {project.url && (
                  <Text style={styles.projectUrl}>{project.url}</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
