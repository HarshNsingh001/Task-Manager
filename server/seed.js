const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Category = require('./models/Category');
const bcrypt = require('bcryptjs');

const seedDemoData = async () => {
  try {
    // In development, always clear and reseed
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Category.deleteMany({});

    console.log('Seeding demo data...');

    // Hash passwords before creating users
    const adminPassword = await bcrypt.hash('demo1234', 12);
    const memberPassword = await bcrypt.hash('demo1234', 12);

    // Create admin user
    const admin = await User.create({
      name: 'Alex Morgan',
      email: 'admin@demo.com',
      password: adminPassword,
    });

    // Create member user
    const member = await User.create({
      name: 'Jordan Lee',
      email: 'member@demo.com',
      password: memberPassword,
    });

    const project = await Project.create({
      name: 'Marketing Launch Q1',
      description: 'Cross-functional initiative to launch the Q1 marketing campaign across web, email, and social.',
      owner: admin._id,
      members: [
        { user: admin._id, role: 'admin' },
        { user: member._id, role: 'member' },
      ],
    });

    const [labelBug, labelFeature, labelDesign] = await Category.insertMany([
      { name: 'Bug', color: '#DC2626', project: project._id },
      { name: 'Feature', color: '#4F46E5', project: project._id },
      { name: 'Design', color: '#059669', project: project._id },
    ]);

    const today = new Date();
    const daysFromNow = (n) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000);

    await Task.insertMany([
      {
        title: 'Finalize landing page copy',
        description: 'Review and approve the hero, features, and CTA sections for the new launch page.',
        status: 'in-progress',
        priority: 'high',
        dueDate: daysFromNow(3),
        project: project._id,
        assignedTo: admin._id,
        createdBy: admin._id,
        labels: [labelFeature._id],
      },
      {
        title: 'Design email template',
        description: 'Create the responsive HTML email template for the announcement campaign.',
        status: 'todo',
        priority: 'medium',
        dueDate: daysFromNow(5),
        project: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        labels: [labelDesign._id],
      },
      {
        title: 'Fix navbar overflow on mobile',
        description: 'Long menu items wrap incorrectly on screens under 380px wide.',
        status: 'todo',
        priority: 'urgent',
        dueDate: daysFromNow(-2),
        project: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        labels: [labelBug._id],
      },
      {
        title: 'Set up analytics tracking',
        description: 'Wire up GA4 and conversion events for the launch funnel.',
        status: 'completed',
        priority: 'medium',
        dueDate: daysFromNow(-7),
        project: project._id,
        assignedTo: admin._id,
        createdBy: admin._id,
        labels: [labelFeature._id],
      },
      {
        title: 'Write press release draft',
        description: 'First draft for review by the comms team.',
        status: 'in-progress',
        priority: 'medium',
        dueDate: daysFromNow(7),
        project: project._id,
        assignedTo: admin._id,
        createdBy: member._id,
        labels: [],
      },
      {
        title: 'Source partner logos',
        description: 'Collect approved partner logos in SVG and PNG formats.',
        status: 'todo',
        priority: 'low',
        dueDate: daysFromNow(10),
        project: project._id,
        assignedTo: member._id,
        createdBy: admin._id,
        labels: [labelDesign._id],
      },
    ]);

    console.log('Demo data seeded successfully!');
    console.log('  Admin:  admin@demo.com / demo1234');
    console.log('  Member: member@demo.com / demo1234');
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

module.exports = { seedDemoData };
