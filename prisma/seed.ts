import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Roles
  const rolesData = [
    { name: 'Admin', priority: 100 },
    { name: 'Customer', priority: 10 },
    { name: 'Contractor', priority: 20 },
    { name: 'Employee', priority: 30 },
    { name: 'Supplier', priority: 40 },
  ];

  const roles = [];
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { roleName: r.name },
      update: {},
      create: { roleName: r.name, priority: r.priority, description: `${r.name} role` },
    });
    roles.push(role);
  }

  // 2. Create Companies
  const company1 = await prisma.company.create({
    data: { companyName: 'BuildCorp Mega', city: 'New York' },
  });

  const company2 = await prisma.company.create({
    data: { companyName: 'Rapid Suppliers Inc.', city: 'Chicago' },
  });

  // 3. Create Users
  const adminRole = roles.find(r => r.roleName === 'Admin')!;
  const customerRole = roles.find(r => r.roleName === 'Customer')!;
  const contractorRole = roles.find(r => r.roleName === 'Contractor')!;
  const employeeRole = roles.find(r => r.roleName === 'Employee')!;
  const supplierRole = roles.find(r => r.roleName === 'Supplier')!;

  const admin = await prisma.user.upsert({
    where: { email: 'admin@veeraconcrete.com' },
    update: {},
    create: { firebaseUid: 'admin_uid_seed', fullName: 'Admin User', email: 'admin@veeraconcrete.com', roleId: adminRole.id },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: { firebaseUid: 'customer_uid_seed', fullName: 'John Customer', email: 'customer@test.com', roleId: customerRole.id, companyId: company1.id },
  });

  const contractor = await prisma.user.upsert({
    where: { email: 'contractor@test.com' },
    update: {},
    create: { firebaseUid: 'contractor_uid_seed', fullName: 'Bob Contractor', email: 'contractor@test.com', roleId: contractorRole.id, companyId: company1.id },
  });

  const employee = await prisma.user.upsert({
    where: { email: 'employee@veeraconcrete.com' },
    update: {},
    create: { 
      firebaseUid: 'employee_uid_seed', 
      fullName: 'Alice Employee', 
      email: 'employee@veeraconcrete.com', 
      roleId: employeeRole.id,
      employeeProfile: {
        create: { department: 'Logistics', designation: 'Plant Manager', salary: 75000 }
      }
    },
  });

  const supplier = await prisma.user.upsert({
    where: { email: 'supplier@test.com' },
    update: {},
    create: { 
      firebaseUid: 'supplier_uid_seed', 
      fullName: 'Sam Supplier', 
      email: 'supplier@test.com', 
      roleId: supplierRole.id, 
      companyId: company2.id,
      supplierProfile: {
        create: { materialTypes: ['Cement', 'Aggregate'], rating: 4.8 }
      }
    },
  });

  // 4. Create Projects
  const project1 = await prisma.project.create({
    data: { projectName: 'Downtown Skyscraper', location: 'City Center', customerId: customer.id, contractorId: contractor.id },
  });

  // 5. Create Orders
  await prisma.order.create({
    data: { orderNumber: 'ORD-1001', customerId: customer.id, projectId: project1.id, concreteGrade: 'M30', quantity: 150, deliveryDate: new Date(), status: 'PENDING' },
  });
  await prisma.order.create({
    data: { orderNumber: 'ORD-1002', customerId: customer.id, concreteGrade: 'M40', quantity: 200, deliveryDate: new Date(), status: 'IN_TRANSIT' },
  });

  // 6. Create Trucks
  await prisma.truck.create({ data: { licensePlate: 'NY-TRK-01', capacity: 8, status: 'AVAILABLE' } });
  await prisma.truck.create({ data: { licensePlate: 'NY-TRK-02', capacity: 10, status: 'ON_DELIVERY' } });

  // 7. Create Inventory
  await prisma.inventory.create({ data: { itemName: 'Portland Cement', category: 'CEMENT', currentStock: 500, unit: 'TON', minimumStock: 100 } });
  await prisma.inventory.create({ data: { itemName: 'Coarse Aggregate', category: 'AGGREGATE', currentStock: 1200, unit: 'TON', minimumStock: 200 } });
  
  // 8. Notifications
  await prisma.notification.create({ data: { userId: customer.id, title: 'Order Confirmed', message: 'Your order ORD-1001 has been confirmed.', type: 'SUCCESS' }});

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
