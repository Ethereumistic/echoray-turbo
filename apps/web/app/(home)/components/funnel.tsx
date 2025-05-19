import { LucideIcon } from 'lucide-react';
import { 
  UserCircle, 
  Briefcase, 
  CreditCard, 
  FileText, 
  Globe, 
  Settings, 
  Zap, 
  ShieldCheck, 
  TrendingUp 
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface FeatureGridProps {
  title: string;
  description: string;
  features: Feature[];
}

export const Funnel = () => {
  const personalFeatures: Feature[] = [
    { icon: CreditCard, title: 'Personal Finance', description: 'Manage your money with intuitive tracking and insights' },
    { icon: FileText, title: 'Tax Optimization', description: 'Simplify tax preparation and maximize your returns' },
    { icon: Globe, title: 'Global Investments', description: 'Diversify with easy international investment options' },
    { icon: Zap, title: 'Quick Transfers', description: 'Instant money transfers with minimal fees' },
    { icon: ShieldCheck, title: 'Security First', description: 'Bank-grade encryption and fraud protection' },
    { icon: TrendingUp, title: 'Investment Guidance', description: 'Personalized investment strategy recommendations' },
    { icon: Settings, title: 'Customizable Alerts', description: 'Set up personalized financial notifications' },
    { icon: UserCircle, title: 'Personal Dashboard', description: 'Comprehensive overview of your financial health' },
    { icon: CreditCard, title: 'Rewards & Cashback', description: 'Earn rewards on everyday spending' }
  ];

  const businessFeatures: Feature[] = [
    { icon: Briefcase, title: 'Supplier Payments', description: 'Streamline invoice processing and payments' },
    { icon: FileText, title: 'Accounting Integration', description: 'Seamless sync with major accounting software' },
    { icon: CreditCard, title: 'Corporate Cards', description: 'Flexible spending and expense management' },
    { icon: Globe, title: 'International Transactions', description: 'Easy cross-border business payments' },
    { icon: TrendingUp, title: 'Financial Analytics', description: 'Real-time business performance insights' },
    { icon: ShieldCheck, title: 'Fraud Prevention', description: 'Advanced security for business transactions' },
    { icon: Zap, title: 'Quick Approvals', description: 'Accelerate payment workflows' },
    { icon: Settings, title: 'Customizable Controls', description: 'Granular access and spending permissions' },
    { icon: FileText, title: 'Tax Reporting', description: 'Simplified financial reporting tools' }
  ];

  const FeatureGrid: React.FC<FeatureGridProps> = ({ title, description, features }) => (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div className="flex aspect-square h-full flex-col justify-between rounded-md bg-muted p-6 lg:col-span-2 lg:aspect-auto">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-semibold tracking-tight">{title}</h2>
          <p className="max-w-xl text-lg text-muted-foreground">{description}</p>
        </div>
      </div>
      
      {features.map((feature) => (
        <div 
          key={feature.title} 
          className="flex aspect-square flex-col justify-between rounded-md bg-muted p-6"
        >
          <feature.icon className="h-8 w-8 stroke-1" />
          <div className="flex flex-col">
            <h3 className="text-xl tracking-tight">{feature.title}</h3>
            <p className="max-w-xs text-base text-muted-foreground">
              {feature.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col gap-20">
          <FeatureGrid 
            title="Personal Solutions" 
            description="Empower your personal financial journey with intuitive tools and smart insights"
            features={personalFeatures}
          />
          <FeatureGrid 
            title="Business Solutions" 
            description="Accelerate your business growth with comprehensive financial management tools"
            features={businessFeatures}
          />
        </div>
      </div>
    </div>
  );
};