/**
 * FeatureCard Component
 * 
 * Displays a feature with icon, title, and description
 * Used on the landing page to showcase product features
 */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="mb-4">
        {icon}
      </div>
      <h4 className="font-heading text-lg font-semibold text-slate-900 mb-2">{title}</h4>
      <p className="font-body text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

