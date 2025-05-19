import React from 'react';
import { LucideIcon } from 'lucide-react';
import { 
  CreditCard, 
  Globe, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Settings, 
  FileText, 
  Briefcase, 
  UserCircle 
} from 'lucide-react';

interface IconItem {
  Icon: LucideIcon;
  title: string;
}

interface IconGridProps {
  icons: IconItem[];
}

export const Features: React.FC = () => {
  const personalIcons: IconItem[] = [
    { Icon: CreditCard, title: 'Payments' },
    { Icon: Globe, title: 'Investments' },
    { Icon: ShieldCheck, title: 'Security' },
    { Icon: Zap, title: 'Transfers' },
    { Icon: TrendingUp, title: 'Analytics' },
    { Icon: Settings, title: 'Customization' },
    { Icon: FileText, title: 'Reporting' },
    { Icon: UserCircle, title: 'Profile' },
    { Icon: CreditCard, title: 'Rewards' }
  ];

  const businessIcons: IconItem[] = [
    { Icon: Briefcase, title: 'Invoicing' },
    { Icon: FileText, title: 'Accounting' },
    { Icon: Globe, title: 'Transactions' },
    { Icon: TrendingUp, title: 'Analytics' },
    { Icon: ShieldCheck, title: 'Compliance' },
    { Icon: Zap, title: 'Approvals' },
    { Icon: Settings, title: 'Controls' },
    { Icon: CreditCard, title: 'Expense' },
    { Icon: FileText, title: 'Reporting' }
  ];

  const IconGrid: React.FC<IconGridProps> = ({ icons }) => (
    <div className="grid grid-cols-3 grid-rows-3 gap-4">
      {icons.map(({ Icon, title }) => (
        <div 
          key={title} 
          className="flex  items-center justify-center p-4 
                    hover:bg-secondary rounded-md transition-colors
                   hover:border-primary border-[6px] border-dashed
                    hover:text-primary"
        >
          <Icon className="size-20 " />
          {/* <span className="text-sm text-center">{title}</span> */}
        </div>
      ))}
    </div>
  );

  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
                  <h2 className="text-left mb-8 font-regular text-xl tracking-tighter md:text-3xl lg:text-5xl lg:max-w-xl">
            What website do you need?
          </h2>
        <div className="flex flex-col gap-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex aspect-square h-full items-center justify-center rounded-md bg-muted p-6 lg:col-span-2 lg:aspect-auto">
              <div className="flex flex-col">
                <h3 className="text-5xl tracking-tight mb-4">Personal</h3>
                <p className="max-w-lg text-3xl text-muted-foreground">
                  Empower your financial journey with intuitive, personalized tools
                </p>
              </div>
            </div>
            <div className="flex aspect-square flex-col justify-center items-center rounded-md bg-muted p-6">
              <div className="flex flex-col w-full">
                <IconGrid icons={personalIcons} />
              </div>
            </div>

            <div className="flex aspect-square flex-col justify-center items-center rounded-md bg-muted p-6">
              <div className="flex flex-col w-full">

                <IconGrid icons={businessIcons} />
              </div>
            </div>
            <div className="flex aspect-square h-full flex-col justify-center items-center rounded-md bg-muted p-6 lg:col-span-2 lg:aspect-auto">
              <div className="flex flex-col">
                <h3 className="text-5xl tracking-tight mb-4">Business</h3>
                <p className="max-w-lg text-3xl text-muted-foreground">
                  Accelerate your business growth with comprehensive financial management
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};