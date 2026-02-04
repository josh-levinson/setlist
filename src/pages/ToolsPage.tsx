import { Link } from 'react-router-dom'
import styles from './Pages.module.css'

interface ToolCardProps {
  title: string
  description: string
  link: string
  icon: string
}

function ToolCard({ title, description, link, icon }: ToolCardProps) {
  return (
    <Link to={link} className={styles.toolCard}>
      <span className={styles.toolIcon}>{icon}</span>
      <div className={styles.toolInfo}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  )
}

export function ToolsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Tools</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.toolsGrid}>
          <ToolCard
            title="AI Tag Suggestions"
            description="Use AI to analyze your jokes and suggest relevant tags based on content."
            link="/tools/tag-analysis"
            icon="🏷️"
          />
          <ToolCard
            title="Duration Calculator"
            description="Calculate joke duration based on word count and speaking pace."
            link="/tools/duration-calculator"
            icon="⏱️"
          />
        </div>
      </div>
    </div>
  )
}
