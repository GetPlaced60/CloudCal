import {
  Globe,
  Zap,
  Lock,
  DoorOpen,
  Scale,
  Server,
  Archive,
  Mail,
  Bell,
  Activity
} from 'lucide-react';

export const ALL_SERVICES = [
  {
    key: 'route53',
    name: 'Route 53',
    subtitle: 'Domain registration & DNS mapping to application endpoint',
    icon: Globe,
    category: 'Networking & Content Delivery'
  },
  {
    key: 'cloudfront',
    name: 'CloudFront',
    subtitle: 'Content delivery network (CDN) & edge caching',
    icon: Zap,
    category: 'Networking & Content Delivery'
  },
  {
    key: 'vpc',
    name: 'VPC & Internet Gateway (IGW)',
    subtitle: 'Isolated VPC network, public/private subnets, IGW & PrivateLink',
    icon: Lock,
    category: 'Networking & Content Delivery'
  },
  {
    key: 'natGateway',
    name: 'NAT Gateway',
    subtitle: 'Outbound internet access for instances in private subnets',
    icon: DoorOpen,
    category: 'Networking & Content Delivery'
  },
  {
    key: 'elb',
    name: 'Elastic Load Balancing (ALB/NLB)',
    subtitle: 'Distribute incoming traffic across healthy EC2 targets',
    icon: Scale,
    category: 'Networking & Content Delivery'
  },
  {
    key: 'ec2',
    name: 'Amazon EC2 (Virtual Servers)',
    subtitle: 'Multi-instance server fleet with customizable instance types, families, and EBS volumes',
    icon: Server,
    category: 'Compute & Sizing'
  },
  {
    key: 's3',
    name: 'Amazon S3',
    subtitle: 'Object storage for documents, uploads, media assets & backups',
    icon: Archive,
    category: 'Storage & Database'
  },
  {
    key: 'ses',
    name: 'Amazon SES / SMTP',
    subtitle: 'Sends application emails, notifications, and verification links',
    icon: Mail,
    category: 'Application Integration'
  },
  {
    key: 'sns',
    name: 'Amazon SNS',
    subtitle: 'Pub/sub messaging, SMS alerts, and alarm distribution',
    icon: Bell,
    category: 'Application Integration'
  },
  {
    key: 'cloudwatch',
    name: 'Amazon CloudWatch',
    subtitle: 'Collects metrics and logs, and triggers automated alarms',
    icon: Activity,
    category: 'Management & Governance'
  }
];
