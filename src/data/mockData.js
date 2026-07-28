export const clients = [
  { id: 1, name: 'Studio Alpha', status: 'Active', projects: 3, lastContact: 'Oct 20, 2023', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 2, name: 'E-com Global', status: 'Active', projects: 1, lastContact: 'Oct 22, 2023', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 3, name: 'Nexus HR', status: 'Pending', projects: 0, lastContact: 'Oct 24, 2023', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 4, name: 'Venture Labs', status: 'Active', projects: 2, lastContact: 'Oct 18, 2023', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 5, name: 'FinTech Pro', status: 'Inactive', projects: 0, lastContact: 'Sep 15, 2023', avatar: 'https://i.pravatar.cc/150?u=5' }
];

export const projects = [
  { id: 1, title: 'Brand Guidelines', client: 'Studio Alpha', status: 'Completed', progress: 100, deadline: 'Oct 20, 2023' },
  { id: 2, title: 'Checkout Flow', client: 'E-com Global', status: 'In Progress', progress: 65, deadline: 'Nov 5, 2023' },
  { id: 3, title: 'Initial Research', client: 'Nexus HR', status: 'To Do', progress: 0, deadline: 'Nov 15, 2023' },
  { id: 4, title: 'Solaris', client: 'Venture Labs', status: 'In Progress', progress: 40, deadline: 'Oct 24, 2023' }
];

export const tasks = [
  { id: 1, title: 'Draft Brand Guidelines', client: 'Studio Alpha', status: 'Completed', priority: 'Low' },
  { id: 2, title: 'Wireframe Checkout Flow', client: 'E-com Global', status: 'In Progress', priority: 'High' },
  { id: 3, title: 'Initial Research Phase', client: 'Nexus HR', status: 'To Do', priority: 'Medium' },
  { id: 4, title: 'Final Asset Handoff', client: 'Venture Labs', status: 'In Progress', priority: 'High', deadline: 'Oct 24, 2023' },
  { id: 5, title: 'UI Styleguide Review', client: 'FinTech Pro', status: 'To Do', priority: 'Medium', deadline: 'Oct 28, 2023' }
];

export const upcomingDeadlines = [
  { id: 1, title: 'Final Asset Handoff', client: 'Venture Labs', date: '24', month: 'Oct', priority: 'High', opacity: '100' },
  { id: 2, title: 'UI Styleguide Review', client: 'FinTech Pro', date: '28', month: 'Oct', priority: 'Medium', opacity: '80' },
  { id: 3, title: 'Contract Renewal', client: 'Cloud 9 Agency', date: '02', month: 'Nov', priority: 'Low', opacity: '60' },
];

export const analyticsData = [
  { name: 'Mon', completion: 40 },
  { name: 'Tue', completion: 65 },
  { name: 'Wed', completion: 50 },
  { name: 'Thu', completion: 90 },
  { name: 'Fri', completion: 75 },
  { name: 'Sat', completion: 20 },
  { name: 'Sun', completion: 15 },
];
